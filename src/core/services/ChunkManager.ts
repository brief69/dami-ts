import { Chunk, ChunkType } from '../entities/Chunk';

export interface ChunkManager {
  createChunk(data: Buffer, type: ChunkType): Promise<Chunk>;
  getChunk(cid: string): Promise<Chunk>;
  deleteChunk(cid: string): Promise<void>;
  
  // チャンク分割ロジック
  splitVideoIntoChunks(videoData: Buffer): Promise<Chunk[]>;
  splitJsonIntoChunks(jsonData: object): Promise<Chunk[]>;
  
  // データ整合性チェック
  verifyChunkIntegrity(chunk: Chunk): Promise<boolean>;
} 