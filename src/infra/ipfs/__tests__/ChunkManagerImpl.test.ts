import { ChunkManagerImpl } from '../ChunkManagerImpl';
import { ChunkType } from '../../../core/entities/Chunk';
import { MINIMAL_JPEG, MINIMAL_MP4 } from './fixtures/sample';

describe('ChunkManagerImpl', () => {
  let chunkManager: ChunkManagerImpl;

  beforeEach(async () => {
    chunkManager = new ChunkManagerImpl();
    await chunkManager.init();
  });

  afterEach(async () => {
    await chunkManager.stop();
  });

  describe('createChunk', () => {
    it('should create a chunk successfully', async () => {
      const testData = Buffer.from('test data');
      const chunk = await chunkManager.createChunk(testData, ChunkType.JSON);
      
      expect(chunk.cid).toBeDefined();
      expect(chunk.type).toBe(ChunkType.JSON);
      expect(chunk.size).toBe(testData.length);
      expect(chunk.timestamp).toBeInstanceOf(Date);
    });
  });

  describe('getChunk with type detection', () => {
    it('should detect JSON type correctly', async () => {
      const jsonData = Buffer.from('{"test": "data"}');
      const chunk = await chunkManager.createChunk(jsonData, ChunkType.UNKNOWN);
      const retrieved = await chunkManager.getChunk(chunk.cid);
      expect(retrieved.type).toBe(ChunkType.JSON);
    });

    it('should detect OTHER type for invalid JSON', async () => {
      const invalidJson = Buffer.from('{not a valid json}');
      const chunk = await chunkManager.createChunk(invalidJson, ChunkType.UNKNOWN);
      const retrieved = await chunkManager.getChunk(chunk.cid);
      expect(retrieved.type).toBe(ChunkType.OTHER);
    });

    it('should detect IMAGE type for JPEG data', async () => {
      const chunk = await chunkManager.createChunk(MINIMAL_JPEG, ChunkType.UNKNOWN);
      const retrieved = await chunkManager.getChunk(chunk.cid);
      expect(retrieved.type).toBe(ChunkType.IMAGE);
    });

    it('should detect VIDEO type for MP4 data', async () => {
      const chunk = await chunkManager.createChunk(MINIMAL_MP4, ChunkType.UNKNOWN);
      const retrieved = await chunkManager.getChunk(chunk.cid);
      expect(retrieved.type).toBe(ChunkType.VIDEO);
    });

    it('should handle corrupted image data correctly', async () => {
      // JPEGヘッダーだけの不完全なデータ
      const corruptedJpeg = Buffer.from([0xFF, 0xD8, 0xFF]);
      const chunk = await chunkManager.createChunk(corruptedJpeg, ChunkType.UNKNOWN);
      const retrieved = await chunkManager.getChunk(chunk.cid);
      expect(retrieved.type).toBe(ChunkType.OTHER);
    });

    it('should handle corrupted video data correctly', async () => {
      // MP4ヘッダーの一部だけの不完全なデータ
      const corruptedMp4 = Buffer.from([0x00, 0x00, 0x00, 0x18, 0x66]);
      const chunk = await chunkManager.createChunk(corruptedMp4, ChunkType.UNKNOWN);
      const retrieved = await chunkManager.getChunk(chunk.cid);
      expect(retrieved.type).toBe(ChunkType.OTHER);
    });
  });

  describe('verifyChunkIntegrity', () => {
    it('should verify chunk integrity successfully', async () => {
      const testData = Buffer.from('test data');
      const chunk = await chunkManager.createChunk(testData, ChunkType.JSON);
      
      const isValid = await chunkManager.verifyChunkIntegrity(chunk);
      expect(isValid).toBe(true);
    });

    it('should verify image chunk integrity successfully', async () => {
      const chunk = await chunkManager.createChunk(MINIMAL_JPEG, ChunkType.IMAGE);
      const isValid = await chunkManager.verifyChunkIntegrity(chunk);
      expect(isValid).toBe(true);
    });

    it('should verify video chunk integrity successfully', async () => {
      const chunk = await chunkManager.createChunk(MINIMAL_MP4, ChunkType.VIDEO);
      const isValid = await chunkManager.verifyChunkIntegrity(chunk);
      expect(isValid).toBe(true);
    });
  });

  describe('splitJsonIntoChunks', () => {
    it('should not split small JSON', async () => {
      const smallJson = { test: 'data', number: 123 };
      const chunks = await chunkManager.splitJsonIntoChunks(smallJson);
      
      // メタデータチャンクを含めて2つのチャンクができるはず
      expect(chunks.length).toBe(2);
      expect(chunks[0].type).toBe(ChunkType.JSON);
      
      // メタデータの検証
      const metadataChunk = chunks[1];
      const metadata = JSON.parse(await getChunkContent(metadataChunk));
      expect(metadata.type).toBe('json');
      expect(metadata.totalChunks).toBe(1);
      expect(metadata.chunkIds).toContain(chunks[0].cid);
    });

    it('should split large JSON correctly', async () => {
      // 大きなJSONオブジェクトを作成
      const largeJson: Record<string, string> = {};
      for (let i = 0; i < 1000; i++) {
        largeJson[`key${i}`] = 'a'.repeat(1000); // 各エントリ約1KBのデータ
      }

      const chunks = await chunkManager.splitJsonIntoChunks(largeJson);
      
      // 複数のチャンクに分割されているはず
      expect(chunks.length).toBeGreaterThan(2); // データチャンク + メタデータチャンク
      
      // メタデータの検証
      const metadataChunk = chunks[chunks.length - 1];
      const metadata = JSON.parse(await getChunkContent(metadataChunk));
      expect(metadata.type).toBe('json');
      expect(metadata.totalChunks).toBe(chunks.length - 1);
      
      // 各チャンクの検証
      for (let i = 0; i < chunks.length - 1; i++) {
        expect(chunks[i].type).toBe(ChunkType.JSON);
        const content = await getChunkContent(chunks[i]);
        expect(content.length).toBeLessThanOrEqual(1024 * 1024); // 1MB以下
      }
    });
  });

  describe('splitVideoIntoChunks', () => {
    it('should not split small video', async () => {
      const chunks = await chunkManager.splitVideoIntoChunks(MINIMAL_MP4);
      
      // メタデータチャンクを含めて2つのチャンクができるはず
      expect(chunks.length).toBe(2);
      expect(chunks[0].type).toBe(ChunkType.VIDEO);
      
      // メタデータの検証
      const metadataChunk = chunks[1];
      const metadata = JSON.parse(await getChunkContent(metadataChunk));
      expect(metadata.type).toBe('video');
      expect(metadata.totalChunks).toBe(1);
      expect(metadata.chunkIds).toContain(chunks[0].cid);
    });

    it('should split large video correctly', async () => {
      // 6MBの疑似ビデオデータを作成
      const largeVideo = Buffer.alloc(6 * 1024 * 1024);
      largeVideo.set(MINIMAL_MP4); // 先頭にMP4ヘッダーを設定
      
      const chunks = await chunkManager.splitVideoIntoChunks(largeVideo);
      
      // 複数のチャンクに分割されているはず
      expect(chunks.length).toBeGreaterThan(2); // データチャンク + メタデータチャンク
      
      // メタデータの検証
      const metadataChunk = chunks[chunks.length - 1];
      const metadata = JSON.parse(await getChunkContent(metadataChunk));
      expect(metadata.type).toBe('video');
      expect(metadata.totalChunks).toBe(chunks.length - 1);
      expect(metadata.totalSize).toBe(largeVideo.length);
      
      // 各チャンクの検証
      for (let i = 0; i < chunks.length - 1; i++) {
        expect(chunks[i].type).toBe(ChunkType.VIDEO);
        const content = await getChunkContent(chunks[i]);
        expect(content.length).toBeLessThanOrEqual(5 * 1024 * 1024); // 5MB以下
      }
    });
  });

  describe('combineChunks and streamChunks', () => {
    it('should combine JSON chunks correctly', async () => {
      // 大きなJSONオブジェクトを作成
      const largeJson: Record<string, string> = {};
      for (let i = 0; i < 1000; i++) {
        largeJson[`key${i}`] = 'a'.repeat(1000);
      }

      // チャンクに分割
      const chunks = await chunkManager.splitJsonIntoChunks(largeJson);
      const metadataChunk = chunks[chunks.length - 1];

      // プログレスコールバックのモック
      const progressCallback = jest.fn();

      // チャンクを結合
      const combined = await chunkManager.combineChunks(metadataChunk.cid, progressCallback);
      
      // 結果の検証
      expect(combined.type).toBe(ChunkType.JSON);
      const reconstructedJson = JSON.parse(combined.data.toString());
      expect(reconstructedJson).toEqual(largeJson);
      
      // プログレスコールバックが呼ばれたことを確認
      expect(progressCallback).toHaveBeenCalled();
      expect(progressCallback).toHaveBeenLastCalledWith(1);
    });

    it('should combine video chunks correctly', async () => {
      // 6MBの疑似ビデオデータを作成
      const largeVideo = Buffer.alloc(6 * 1024 * 1024);
      largeVideo.set(MINIMAL_MP4);
      
      // チャンクに分割
      const chunks = await chunkManager.splitVideoIntoChunks(largeVideo);
      const metadataChunk = chunks[chunks.length - 1];

      // チャンクを結合
      const combined = await chunkManager.combineChunks(metadataChunk.cid);
      
      // 結果の検証
      expect(combined.type).toBe(ChunkType.VIDEO);
      expect(combined.size).toBe(largeVideo.length);
      expect(combined.data).toEqual(largeVideo);
    });

    it('should stream chunks progressively', async () => {
      // 大きなJSONオブジェクトを作成
      const largeJson: Record<string, string> = {};
      for (let i = 0; i < 1000; i++) {
        largeJson[`key${i}`] = 'a'.repeat(1000);
      }

      // チャンクに分割
      const chunks = await chunkManager.splitJsonIntoChunks(largeJson);
      const metadataChunk = chunks[chunks.length - 1];

      // ストリームからチャンクを取得
      const receivedChunks: Buffer[] = [];
      let lastProgress = 0;

      for await (const { data, type, progress } of chunkManager.streamChunks(metadataChunk.cid)) {
        receivedChunks.push(data);
        expect(type).toBe(ChunkType.JSON);
        expect(progress).toBeGreaterThan(lastProgress);
        lastProgress = progress;
      }

      // 全てのチャンクを受信したことを確認
      expect(lastProgress).toBe(1);
      
      // 結合したデータを検証
      const reconstructedData = Buffer.concat(receivedChunks);
      const reconstructedJson = JSON.parse(reconstructedData.toString());
      expect(reconstructedJson).toEqual(largeJson);
    });

    it('should handle errors gracefully when combining invalid chunks', async () => {
      // 無効なメタデータCIDでのエラーハンドリング
      await expect(chunkManager.combineChunks('invalid-cid')).rejects.toThrow('Failed to get metadata');
    });
  });
});

// ヘルパー関数: チャンクの内容を取得
async function getChunkContent(chunk: Chunk): Promise<string> {
  const chunks = [];
  for await (const data of chunkManager.ipfs.cat(chunk.cid)) {
    chunks.push(data);
  }
  return Buffer.concat(chunks).toString();
} 