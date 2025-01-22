import { create } from 'ipfs-http-client'
import { Chunk, ChunkType } from '../../core/entities/Chunk'
import { ChunkManager } from '../../core/services/ChunkManager'
import { P2PManager } from '../p2p/libp2p'

export class ChunkManagerImpl implements ChunkManager {
  private ipfs
  private p2pManager: P2PManager

  constructor() {
    this.ipfs = create({ url: 'http://localhost:5001/api/v0' })
    this.p2pManager = new P2PManager()
  }

  async init() {
    await this.p2pManager.init()
  }

  async createChunk(data: Buffer, type: ChunkType): Promise<Chunk> {
    const result = await this.ipfs.add(data)
    const chunk: Chunk = {
      cid: result.cid.toString(),
      type,
      size: data.length,
      timestamp: new Date()
    }
    
    // P2Pネットワークに新しいチャンクを通知
    await this.p2pManager.publish('new-chunk', {
      cid: chunk.cid,
      type: chunk.type
    })

    return chunk
  }

  async getChunk(cid: string): Promise<Chunk> {
    const chunks = await this.ipfs.get(cid)
    for await (const chunk of chunks) {
      if (!chunk.content) continue
      return {
        cid,
        type: ChunkType.Unknown, // 実際の型は保存されたメタデータから取得する必要がある
        size: chunk.size,
        timestamp: new Date()
      }
    }
    throw new Error(`Chunk not found: ${cid}`)
  }

  async deleteChunk(cid: string): Promise<void> {
    await this.ipfs.pin.rm(cid)
    // P2Pネットワークにチャンク削除を通知
    await this.p2pManager.publish('delete-chunk', { cid })
  }

  async splitVideoIntoChunks(videoData: Buffer): Promise<Chunk[]> {
    // 動画を6秒単位で分割する実装
    // TODO: 実際の動画分割ロジックを実装
    const chunks: Chunk[] = []
    return chunks
  }

  async splitJsonIntoChunks(jsonData: object): Promise<Chunk[]> {
    // JSONをフィールドごとに分割する実装
    // TODO: 実際のJSON分割ロジックを実装
    const chunks: Chunk[] = []
    return chunks
  }

  async verifyChunkIntegrity(chunk: Chunk): Promise<boolean> {
    try {
      const storedChunk = await this.getChunk(chunk.cid)
      return storedChunk.cid === chunk.cid
    } catch (error) {
      return false
    }
  }

  async stop() {
    await this.p2pManager.stop()
  }
} 