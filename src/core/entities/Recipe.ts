export class Recipe {
  constructor(
    public readonly id: string,
    public readonly chunks: string[], // CIDs of chunks
    public readonly metadata: RecipeMetadata,
    public readonly creator: string, // User ID
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly value: number = 0
  ) {}

  public withUpdates(updates: Partial<Recipe>): Recipe {
    return new Recipe(
      updates.id ?? this.id,
      updates.chunks ?? this.chunks,
      updates.metadata ?? this.metadata,
      updates.creator ?? this.creator,
      updates.createdAt ?? this.createdAt,
      new Date(), // updatedAtは常に現在時刻
      updates.value ?? this.value
    )
  }
}

export interface RecipeMetadata {
  title: string;
  description?: string;
  type: string;
  tags?: string[];
  // 拡張可能な形式で定義
} 