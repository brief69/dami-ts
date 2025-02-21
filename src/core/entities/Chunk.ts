export interface Chunk {
  cid: string;          // コンテンツID（IPFS CID）
  type: ChunkType;      // データタイプ（JSON, VIDEO, IMAGE等）
  size: number;         // チャンクサイズ
  timestamp: Date;      // 作成時刻
}

export enum ChunkType {
  JSON = 'json',
  VIDEO = 'video',
  IMAGE = 'image',
  OTHER = 'other'
} 