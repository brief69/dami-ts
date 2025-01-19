export class Recipe {
  constructor(
    public readonly id: string,
    public readonly chunks: string[], // CIDs of chunks
    public readonly metadata: RecipeMetadata,
    public readonly creator: string, // User ID
    public readonly timestamp: Date
  ) {}
}

export interface RecipeMetadata {
  title: string;
  description?: string;
  type: string;
  tags?: string[];
  // 拡張可能な形式で定義
} 