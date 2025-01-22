import { create } from 'ipfs-http-client'
import { Chunk, ChunkType } from '../../core/entities/Chunk'
import { ChunkManager } from '../../core/services/ChunkManager'
import { P2PManager } from '../p2p/libp2p'
import { concat as uint8ArrayConcat } from 'uint8arrays/concat'

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
    const chunk = new Chunk(
      result.cid.toString(),
      type,
      data.length,
      new Date()
    )
    
    // P2Pネットワークに新しいチャンクを通知
    await this.p2pManager.publish('new-chunk', {
      cid: chunk.cid,
      type: chunk.type
    })

    return chunk
  }

  async getChunk(cid: string): Promise<Chunk> {
    // IPFSからデータを取得し、Uint8Arrayの配列を結合
    const chunks = []
    for await (const chunk of this.ipfs.cat(cid)) {
      chunks.push(chunk)
    }
    const content = uint8ArrayConcat(chunks)
    
    return new Chunk(
      cid,
      ChunkType.UNKNOWN,
      content.length,
      new Date()
    )
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