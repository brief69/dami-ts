import { create } from 'ipfs-http-client'
import { Recipe, RecipeMetadata } from '../../core/entities/Recipe'
import { RecipeManager } from '../../core/services/RecipeManager'
import { P2PManager } from '../p2p/libp2p'
import { ChunkManager } from '../../core/services/ChunkManager'

export class RecipeManagerImpl implements RecipeManager {
  private ipfs
  private p2pManager: P2PManager
  private chunkManager: ChunkManager

  constructor(chunkManager: ChunkManager) {
    this.ipfs = create({ url: 'http://localhost:5001/api/v0' })
    this.p2pManager = new P2PManager()
    this.chunkManager = chunkManager
  }

  async init() {
    await this.p2pManager.init()
  }

  async createRecipe(chunks: string[], metadata: RecipeMetadata, creator: string): Promise<Recipe> {
    // レシピデータの作成
    const recipe: Recipe = {
      id: `recipe-${Date.now()}`,
      chunks,
      metadata,
      creator,
      createdAt: new Date(),
      updatedAt: new Date(),
      value: 0
    }

    // レシピをIPFSに保存
    const recipeData = Buffer.from(JSON.stringify(recipe))
    const result = await this.ipfs.add(recipeData)
    recipe.id = result.cid.toString()

    // P2Pネットワークに新しいレシピを通知
    await this.p2pManager.publish('new-recipe', {
      id: recipe.id,
      creator: recipe.creator,
      metadata: recipe.metadata
    })

    return recipe
  }

  async getRecipe(id: string): Promise<Recipe> {
    const chunks = await this.ipfs.get(id)
    for await (const chunk of chunks) {
      if (!chunk.content) continue
      const content = await chunk.content()
      return JSON.parse(content.toString())
    }
    throw new Error(`Recipe not found: ${id}`)
  }

  async updateRecipe(id: string, updates: Partial<RecipeMetadata>): Promise<Recipe> {
    const recipe = await this.getRecipe(id)
    recipe.metadata = { ...recipe.metadata, ...updates }
    recipe.updatedAt = new Date()

    // 更新されたレシピをIPFSに保存
    const recipeData = Buffer.from(JSON.stringify(recipe))
    const result = await this.ipfs.add(recipeData)
    recipe.id = result.cid.toString()

    // P2Pネットワークにレシピ更新を通知
    await this.p2pManager.publish('update-recipe', {
      id: recipe.id,
      updates
    })

    return recipe
  }

  async deleteRecipe(id: string): Promise<void> {
    await this.ipfs.pin.rm(id)
    // P2Pネットワークにレシピ削除を通知
    await this.p2pManager.publish('delete-recipe', { id })
  }

  async executeRecipe(recipe: Recipe): Promise<Buffer> {
    // レシピの各チャンクを取得して結合
    const chunks = await Promise.all(
      recipe.chunks.map(cid => this.chunkManager.getChunk(cid))
    )
    
    // TODO: チャンクの結合ロジックを実装
    // この実装は仮のものです
    return Buffer.from('')
  }

  async validateRecipe(recipe: Recipe): Promise<boolean> {
    try {
      // 全てのチャンクの整合性を確認
      const validations = await Promise.all(
        recipe.chunks.map(async cid => {
          try {
            const chunk = await this.chunkManager.getChunk(cid)
            return this.chunkManager.verifyChunkIntegrity(chunk)
          } catch {
            return false
          }
        })
      )
      return validations.every(valid => valid)
    } catch {
      return false
    }
  }

  async calculateZeny(recipe: Recipe): Promise<number> {
    // TODO: ゼニー計算アルゴリズムの実装
    return 0
  }

  async updateRecipeValue(recipe: Recipe, value: number): Promise<void> {
    const updatedRecipe = await this.getRecipe(recipe.id)
    updatedRecipe.value = value
    updatedRecipe.updatedAt = new Date()

    // 更新されたレシピをIPFSに保存
    const recipeData = Buffer.from(JSON.stringify(updatedRecipe))
    await this.ipfs.add(recipeData)

    // P2Pネットワークに価値更新を通知
    await this.p2pManager.publish('update-recipe-value', {
      id: recipe.id,
      value
    })
  }

  async stop() {
    await this.p2pManager.stop()
  }
} 