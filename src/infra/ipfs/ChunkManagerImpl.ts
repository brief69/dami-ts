import { create } from 'kubo-rpc-client'
import { Chunk, ChunkType } from '../../core/entities/Chunk'
import { ChunkManager } from '../../core/services/ChunkManager'
import { P2PManager } from '../p2p/libp2p'
import { concat as uint8ArrayConcat } from 'uint8arrays/concat'

interface ChunkMetadata {
  type: 'json' | 'video';
  totalChunks: number;
  chunkIds: string[];
  totalSize?: number;
  timestamp: string;
}

class ChunkError extends Error {
  constructor(message: string, public readonly cause?: Error) {
    super(message);
    this.name = 'ChunkError';
  }
}

// チャンクサイズの定数
const CHUNK_CONSTANTS = {
  // JSONの最大チャンクサイズ（1MB）
  MAX_JSON_CHUNK_SIZE: 1024 * 1024,
  // ビデオの最大チャンクサイズ（5MB）
  MAX_VIDEO_CHUNK_SIZE: 5 * 1024 * 1024,
  // ビデオチャンクの長さ（秒）
  VIDEO_CHUNK_DURATION: 6
};

export class ChunkManagerImpl implements ChunkManager {
  private ipfs
  private p2pManager: P2PManager

  // チャンクタイプとマジックナンバーのマッピング
  private static readonly MAGIC_NUMBERS = {
    IMAGE: [0xFF, 0xD8, 0xFF],
    VIDEO: [0x00, 0x00, 0x00, 0x18, 0x66, 0x74, 0x79, 0x70],
    JSON: [0x7B]
  };

  constructor() {
    try {
      this.ipfs = create({ url: 'http://localhost:5001/api/v0' })
      this.p2pManager = new P2PManager()
    } catch (error) {
      throw new ChunkError('Failed to initialize ChunkManager', error as Error)
    }
  }

  private detectChunkType(data: Uint8Array): ChunkType {
    const header = Array.from(data.slice(0, 8));

    if (header[0] === ChunkManagerImpl.MAGIC_NUMBERS.JSON[0]) {
      try {
        const text = new TextDecoder().decode(data);
        JSON.parse(text);
        return ChunkType.JSON;
      } catch {
        return ChunkType.OTHER;
      }
    }

    if (ChunkManagerImpl.MAGIC_NUMBERS.IMAGE.every((byte, index) => header[index] === byte)) {
      return ChunkType.IMAGE;
    }

    if (ChunkManagerImpl.MAGIC_NUMBERS.VIDEO.every((byte, index) => header[index] === byte)) {
      return ChunkType.VIDEO;
    }

    return ChunkType.OTHER;
  }

  async init() {
    try {
      await this.p2pManager.init()
    } catch (error) {
      throw new ChunkError('Failed to initialize P2P manager', error as Error)
    }
  }

  async createChunk(data: Buffer, type: ChunkType): Promise<Chunk> {
    try {
      const result = await this.ipfs.add(data)
      return {
        cid: result.cid.toString(),
        type,
        size: data.length,
        timestamp: new Date()
      }
    } catch (error) {
      throw new ChunkError(`Failed to create chunk of type ${type}`, error as Error)
    }
  }

  async getChunk(cid: string): Promise<Chunk> {
    try {
      const chunks = []
      for await (const chunk of this.ipfs.cat(cid)) {
        chunks.push(chunk)
      }
      const content = uint8ArrayConcat(chunks)
      
      return {
        cid,
        type: this.detectChunkType(content),
        size: content.length,
        timestamp: new Date()
      }
    } catch (error) {
      throw new ChunkError(`Failed to get chunk with CID ${cid}`, error as Error)
    }
  }

  async deleteChunk(cid: string): Promise<void> {
    try {
      await this.ipfs.pin.rm(cid)
    } catch (error) {
      throw new ChunkError(`Failed to delete chunk with CID ${cid}`, error as Error)
    }
  }

  async verifyChunkIntegrity(chunk: Chunk): Promise<boolean> {
    try {
      const storedChunk = await this.getChunk(chunk.cid)
      return storedChunk.cid === chunk.cid && storedChunk.size === chunk.size
    } catch (error) {
      console.error(`Integrity check failed for chunk ${chunk.cid}:`, error)
      return false
    }
  }

  async stop() {
    try {
      await this.p2pManager.stop()
    } catch (error) {
      throw new ChunkError('Failed to stop ChunkManager', error as Error)
    }
  }

  private async getMetadata(metadataCid: string): Promise<ChunkMetadata> {
    try {
      const chunks = [];
      for await (const chunk of this.ipfs.cat(metadataCid)) {
        chunks.push(chunk);
      }
      const metadata = JSON.parse(Buffer.concat(chunks).toString());
      
      if (!metadata.type || !metadata.totalChunks || !metadata.chunkIds || !metadata.timestamp) {
        throw new ChunkError('Invalid metadata format');
      }
      
      return metadata as ChunkMetadata;
    } catch (error) {
      throw new ChunkError(`Failed to get metadata from CID ${metadataCid}`, error as Error);
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
          data: Buffer.concat(chunkData),
          type: metadata.type === 'json' ? ChunkType.JSON : ChunkType.VIDEO,
          progress: processedChunks / metadata.totalChunks
        };
      }
    } catch (error) {
      throw new ChunkError(`Failed to stream chunks from metadata ${metadataCid}`, error as Error);
    }
  }
} 