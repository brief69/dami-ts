import { Chunk, ChunkType } from '../entities/Chunk';

export interface ChunkManager {
  // 基本的なチャンク操作
  createChunk(data: Buffer, type: ChunkType): Promise<Chunk>;
  getChunk(cid: string): Promise<Chunk>;
  deleteChunk(cid: string): Promise<void>;
  
  // データ整合性チェック
  verifyChunkIntegrity(chunk: Chunk): Promise<boolean>;

  // プログレッシブダウンロード用のストリーム
  streamChunks(metadataCid: string): AsyncGenerator<{
    data: Buffer;
    type: ChunkType;
    progress: number;
  }>;

  // 初期化と終了
  init(): Promise<void>;
  stop(): Promise<void>;
} 