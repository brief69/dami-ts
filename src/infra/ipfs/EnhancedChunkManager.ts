import { create } from 'kubo-rpc-client';
import { Chunk, ChunkType } from '../../core/entities/Chunk';
import { ChunkManager } from '../../core/services/ChunkManager';
import { AccessibilityCheck, NetworkConfig, DEFAULT_NETWORK_CONFIG, PeerInfo } from '../../core/entities/NetworkTypes';
import { concat as uint8ArrayConcat } from 'uint8arrays/concat';
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string';
import { toString as uint8ArrayToString } from 'uint8arrays/to-string';

class NetworkError extends Error {
  constructor(message: string, public readonly cause?: Error) {
    super(message);
    this.name = 'NetworkError';
  }
}

export class EnhancedChunkManager implements ChunkManager {
  private ipfs;
  private peers: Map<string, PeerInfo> = new Map();
  private config: NetworkConfig;

  constructor(config: Partial<NetworkConfig> = {}) {
    this.config = { ...DEFAULT_NETWORK_CONFIG, ...config };
    this.ipfs = create({ url: 'http://localhost:5001/api/v0' });
  }

  async init(): Promise<void> {
    try {
      // ピアの初期探索
      await this.discoverPeers();
      
      // 定期的なピア更新の開始
      setInterval(() => this.updatePeers(), 30000); // 30秒ごと
    } catch (error) {
      throw new NetworkError('Failed to initialize EnhancedChunkManager', error as Error);
    }
  }

  async stop(): Promise<void> {
    try {
      // クリーンアップ処理
      this.peers.clear();
    } catch (error) {
      throw new NetworkError('Failed to stop EnhancedChunkManager', error as Error);
    }
  }

  private async discoverPeers(): Promise<void> {
    try {
      // 接続済みのピアを取得
      const connectedPeers = await this.ipfs.swarm.peers();
      
      for (const peer of connectedPeers) {
        const latency = await this.measureLatency(peer.peer);
        
        this.peers.set(peer.peer, {
          id: peer.peer,
          latency,
          lastSeen: new Date(),
          connectionStatus: 'active'
        });
      }
    } catch (error) {
      console.warn('Peer discovery failed:', error);
    }
  }

  private async updatePeers(): Promise<void> {
    try {
      // 非アクティブなピアの削除
      const now = new Date();
      for (const [id, peer] of this.peers.entries()) {
        if (now.getTime() - peer.lastSeen.getTime() > 300000) { // 5分
          this.peers.delete(id);
        }
      }

      // 新しいピアの探索
      await this.discoverPeers();
    } catch (error) {
      console.warn('Peer update failed:', error);
    }
  }

  private async measureLatency(peerId: string): Promise<number> {
    const startTime = Date.now();
    try {
      await this.ipfs.ping(peerId, { count: 1 });
      return Date.now() - startTime;
    } catch {
      return Infinity;
    }
  }

  async createChunk(data: Buffer, type: ChunkType): Promise<Chunk> {
    try {
      // まずCIDを計算
      const cid = await this.calculateCid(data);
      
      // アクセス可能性をチェック
      const accessibility = await this.checkDataAccessibility(cid);

      if (accessibility.isAccessible && 
          accessibility.latency < this.config.latencyThreshold) {
        // 十分速くアクセスできる場合は既存のチャンクを返す
        return {
          cid,
          type,
          size: data.length,
          timestamp: new Date()
        };
      }

      // 遅すぎる or アクセス困難な場合は新規保存
      const result = await this.ipfs.add(data);
      return {
        cid: result.cid.toString(),
        type,
        size: data.length,
        timestamp: new Date()
      };
    } catch (error) {
      throw new NetworkError(`Failed to create chunk of type ${type}`, error as Error);
    }
  }

  private async calculateCid(data: Buffer): Promise<string> {
    const result = await this.ipfs.add(data, { onlyHash: true });
    return result.cid.toString();
  }

  private async checkDataAccessibility(cid: string): Promise<AccessibilityCheck> {
    const startTime = Date.now();

    // 1. ローカルチェック
    const localCheck = await this.checkLocalNodes(cid);
    if (localCheck) {
      return {
        isAccessible: true,
        latency: Date.now() - startTime,
        location: 'local'
      };
    }

    // 2. リージョナルチェック
    const regionalCheck = await this.checkRegionalNodes(cid);
    if (regionalCheck) {
      const latency = Date.now() - startTime;
      return {
        isAccessible: latency < this.config.latencyThreshold,
        latency,
        location: 'regional'
      };
    }

    // 3. グローバルチェック
    const globalCheck = await Promise.race([
      this.checkGlobalNodes(cid),
      new Promise<boolean>(resolve => 
        setTimeout(() => resolve(false), this.config.globalTimeout)
      )
    ]);

    return {
      isAccessible: !!globalCheck,
      latency: Date.now() - startTime,
      location: 'global'
    };
  }

  private async checkLocalNodes(cid: string): Promise<boolean> {
    try {
      const localPeers = Array.from(this.peers.values())
        .filter(peer => peer.latency < this.config.localTimeout);

      return await this.checkPeersForCid(cid, localPeers);
    } catch {
      return false;
    }
  }

  private async checkRegionalNodes(cid: string): Promise<boolean> {
    try {
      const regionalPeers = Array.from(this.peers.values())
        .filter(peer => peer.latency < this.config.regionalTimeout);

      return await this.checkPeersForCid(cid, regionalPeers);
    } catch {
      return false;
    }
  }

  private async checkGlobalNodes(cid: string): Promise<boolean> {
    try {
      // DHT経由で検索
      const providers = await this.ipfs.dht.findProvs(cid);
      return providers.length > 0;
    } catch {
      return false;
    }
  }

  private async checkPeersForCid(cid: string, peers: PeerInfo[]): Promise<boolean> {
    for (const peer of peers) {
      try {
        const providers = await this.ipfs.dht.findProvs(cid, {
          timeout: this.config.localTimeout,
          maxNumProviders: 1
        });
        if (providers.some(p => p.id === peer.id)) {
          return true;
        }
      } catch {
        continue;
      }
    }
    return false;
  }

  async getChunk(cid: string): Promise<Chunk> {
    try {
      const chunks = [];
      for await (const chunk of this.ipfs.cat(cid)) {
        chunks.push(chunk);
      }
      const content = uint8ArrayConcat(chunks);
      
      return {
        cid,
        type: this.detectChunkType(content),
        size: content.length,
        timestamp: new Date()
      };
    } catch (error) {
      throw new NetworkError(`Failed to get chunk with CID ${cid}`, error as Error);
    }
  }

  private detectChunkType(data: Uint8Array): ChunkType {
    // 既存の実装を流用
    const header = Array.from(data.slice(0, 8));

    if (header[0] === 0x7B) { // '{' character
      try {
        const text = new TextDecoder().decode(data);
        JSON.parse(text);
        return ChunkType.JSON;
      } catch {
        return ChunkType.OTHER;
      }
    }

    if (header[0] === 0xFF && header[1] === 0xD8 && header[2] === 0xFF) {
      return ChunkType.IMAGE;
    }

    if (header[4] === 0x66 && header[5] === 0x74 && header[6] === 0x79 && header[7] === 0x70) {
      return ChunkType.VIDEO;
    }

    return ChunkType.OTHER;
  }

  async deleteChunk(cid: string): Promise<void> {
    try {
      await this.ipfs.pin.rm(cid);
    } catch (error) {
      throw new NetworkError(`Failed to delete chunk with CID ${cid}`, error as Error);
    }
  }

  async verifyChunkIntegrity(chunk: Chunk): Promise<boolean> {
    try {
      const storedChunk = await this.getChunk(chunk.cid);
      return storedChunk.cid === chunk.cid && storedChunk.size === chunk.size;
    } catch (error) {
      console.error(`Integrity check failed for chunk ${chunk.cid}:`, error);
      return false;
    }
  }

  async *streamChunks(metadataCid: string): AsyncGenerator<{
    data: Buffer;
    type: ChunkType;
    progress: number;
  }> {
    try {
      const metadata = await this.getMetadata(metadataCid);
      let processedChunks = 0;

      for (const chunkId of metadata.chunkIds) {
        const chunk = await this.getChunk(chunkId);
        const chunkData = [];
        
        for await (const data of this.ipfs.cat(chunk.cid)) {
          chunkData.push(data);
        }
        
        processedChunks++;
        yield {
          data: Buffer.from(uint8ArrayConcat(chunkData)),
          type: metadata.type === 'json' ? ChunkType.JSON : ChunkType.VIDEO,
          progress: processedChunks / metadata.totalChunks
        };
      }
    } catch (error) {
      throw new NetworkError(`Failed to stream chunks from metadata ${metadataCid}`, error as Error);
    }
  }

  private async getMetadata(metadataCid: string): Promise<{
    type: 'json' | 'video';
    totalChunks: number;
    chunkIds: string[];
  }> {
    const chunks = [];
    for await (const chunk of this.ipfs.cat(metadataCid)) {
      chunks.push(chunk);
    }
    const metadata = JSON.parse(uint8ArrayToString(uint8ArrayConcat(chunks)));
    
    if (!metadata.type || !metadata.totalChunks || !metadata.chunkIds) {
      throw new NetworkError('Invalid metadata format');
    }
    
    return metadata;
  }
} 