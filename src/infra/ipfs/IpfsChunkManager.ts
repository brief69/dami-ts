import { create } from 'ipfs-http-client';
import { Chunk, ChunkType } from '../../core/entities/Chunk';
import { ChunkManager } from '../../core/services/ChunkManager';

export class IpfsChunkManager implements ChunkManager {
  private ipfs;

  constructor() {
    // Infuraノードに接続
    // 注意: 実際の実装では環境変数から設定を読み込む
    this.ipfs = create({ url: 'https://ipfs.infura.io:5001/api/v0' });
  }

  async createChunk(data: Buffer, type: ChunkType): Promise<Chunk> {
    const result = await this.ipfs.add(data);
    return new Chunk(result.cid.toString(), data, type, new Date());
  }

  async getChunk(cid: string): Promise<Chunk> {
    // 実装要: IPFSからのデータ取得
    throw new Error('Not implemented');
  }

  async deleteChunk(cid: string): Promise<void> {
    // 注意: IPFSでは実際には削除できない
    // ローカルノードからのピン解除のみ可能
    await this.ipfs.pin.rm(cid);
  }

  async splitVideoIntoChunks(videoData: Buffer): Promise<Chunk[]> {
    // 実装要: FFmpegなどを使用した6秒単位の分割
    throw new Error('Not implemented');
  }

  async splitJsonIntoChunks(jsonData: object): Promise<Chunk[]> {
    // 実装要: JSONのフィールドごとの分割
    throw new Error('Not implemented');
  }

  async verifyChunkIntegrity(chunk: Chunk): Promise<boolean> {
    // 実装要: CIDの検証
    throw new Error('Not implemented');
  }
} 