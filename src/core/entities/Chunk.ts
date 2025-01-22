export class Chunk {
  constructor(
    public readonly cid: string,
    public readonly type: ChunkType,
    public readonly size: number,
    public readonly timestamp: Date
  ) {}
}

export enum ChunkType {
  VIDEO = 'VIDEO',
  IMAGE = 'IMAGE',
  JSON = 'JSON',
  OTHER = 'OTHER',
  UNKNOWN = 'UNKNOWN'
} 