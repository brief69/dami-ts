import { Recipe, RecipeMetadata } from '../entities/Recipe';

export interface RecipeManager {
  createRecipe(chunks: string[], metadata: RecipeMetadata, creator: string): Promise<Recipe>;
  getRecipe(id: string): Promise<Recipe>;
  updateRecipe(id: string, updates: Partial<RecipeMetadata>): Promise<Recipe>;
  deleteRecipe(id: string): Promise<void>;
  
  // レシピの実行と検証
  executeRecipe(recipe: Recipe): Promise<Buffer>;
  validateRecipe(recipe: Recipe): Promise<boolean>;
  
  // インセンティブ関連
  calculateZeny(recipe: Recipe): Promise<number>;
  updateRecipeValue(recipe: Recipe, value: number): Promise<void>;
} 