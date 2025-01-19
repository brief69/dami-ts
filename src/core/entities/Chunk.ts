export class Chunk {
  constructor(
    public readonly cid: string,
    public readonly data: Buffer,
    public readonly type: ChunkType,
    public readonly timestamp: Date
  ) {}
}

export enum ChunkType {
  VIDEO = 'VIDEO',
  IMAGE = 'IMAGE',
  JSON = 'JSON',
  OTHER = 'OTHER'
} 