import { EnhancedChunkManager } from '../EnhancedChunkManager';
import { ChunkType } from '../../../core/entities/Chunk';
import { NetworkConfig } from '../../../core/entities/NetworkTypes';

// IPFSクライアントのモック
const mockIpfsClient = {
  add: jest.fn(),
  cat: jest.fn(),
  ping: jest.fn(),
  swarm: {
    peers: jest.fn()
  },
  dht: {
    findProvs: jest.fn()
  },
  pin: {
    rm: jest.fn()
  }
};

// create関数をモック
jest.mock('kubo-rpc-client', () => ({
  create: () => mockIpfsClient
}));

describe('EnhancedChunkManager', () => {
  let manager: EnhancedChunkManager;
  const testConfig: NetworkConfig = {
    latencyThreshold: 100,
    localTimeout: 50,
    regionalTimeout: 200,
    globalTimeout: 1000,
    maxPeers: 10
  };

  beforeEach(() => {
    jest.clearAllMocks();
    manager = new EnhancedChunkManager(testConfig);
  });

  describe('createChunk', () => {
    const testData = Buffer.from('test data');
    const testCid = 'test-cid';

    it('既存のチャンクが近くにある場合は参照を返す', async () => {
      // CID計算のモック
      mockIpfsClient.add.mockResolvedValueOnce({ cid: { toString: () => testCid } });
      
      // ローカルノードで利用可能な場合
      mockIpfsClient.dht.findProvs
        .mockResolvedValueOnce([{ id: 'local-peer' }]);
      mockIpfsClient.ping
        .mockResolvedValueOnce({ time: 50 }); // 低レイテンシ

      const chunk = await manager.createChunk(testData, ChunkType.JSON);
      
      expect(chunk.cid).toBe(testCid);
      expect(mockIpfsClient.add).toHaveBeenCalledTimes(1);
      expect(mockIpfsClient.add).toHaveBeenCalledWith(testData, { onlyHash: true });
    });

    it('既存のチャンクが遠すぎる場合は新規保存する', async () => {
      // CID計算のモック
      mockIpfsClient.add
        .mockResolvedValueOnce({ cid: { toString: () => testCid } }) // onlyHash
        .mockResolvedValueOnce({ cid: { toString: () => 'new-cid' } }); // 実際の保存
      
      // グローバルノードでのみ利用可能な場合
      mockIpfsClient.dht.findProvs
        .mockResolvedValueOnce([]) // ローカルなし
        .mockResolvedValueOnce([]) // リージョナルなし
        .mockResolvedValueOnce([{ id: 'global-peer' }]); // グローバルあり

      const chunk = await manager.createChunk(testData, ChunkType.JSON);
      
      expect(chunk.cid).toBe('new-cid');
      expect(mockIpfsClient.add).toHaveBeenCalledTimes(2);
    });
  });

  describe('ピア管理', () => {
    const mockPeers = [
      { peer: 'peer1', latency: 50 },
      { peer: 'peer2', latency: 150 },
      { peer: 'peer3', latency: 300 }
    ];

    beforeEach(async () => {
      mockIpfsClient.swarm.peers.mockResolvedValue(mockPeers);
      mockIpfsClient.ping.mockImplementation(async (peerId) => {
        const peer = mockPeers.find(p => p.peer === peerId);
        return { time: peer?.latency || 1000 };
      });

      await manager.init();
    });

    it('ピアを適切に分類する', async () => {
      const testCid = 'test-cid';
      
      // ローカルピアでデータが見つかる場合
      mockIpfsClient.dht.findProvs
        .mockResolvedValueOnce([{ id: 'peer1' }]);

      const accessibility = await (manager as any)
        .checkDataAccessibility(testCid);

      expect(accessibility.location).toBe('local');
      expect(accessibility.latency).toBeLessThan(testConfig.localTimeout);
    });

    it('非アクティブなピアを削除する', async () => {
      jest.useFakeTimers();
      
      // 5分経過をシミュレート
      jest.advanceTimersByTime(300000);
      
      await (manager as any).updatePeers();
      
      // 新しいピア探索が呼ばれることを確認
      expect(mockIpfsClient.swarm.peers).toHaveBeenCalled();
      
      jest.useRealTimers();
    });
  });

  describe('チャンク取得とストリーミング', () => {
    const testMetadata = {
      type: 'json' as const,
      totalChunks: 2,
      chunkIds: ['chunk1', 'chunk2']
    };

    beforeEach(() => {
      mockIpfsClient.cat.mockImplementation(async function* (cid) {
        if (cid === 'metadata-cid') {
          yield Buffer.from(JSON.stringify(testMetadata));
        } else {
          yield Buffer.from(`data for ${cid}`);
        }
      });
    });

    it('チャンクを順番にストリーミングする', async () => {
      const chunks = [];
      for await (const chunk of manager.streamChunks('metadata-cid')) {
        chunks.push(chunk);
      }

      expect(chunks).toHaveLength(2);
      expect(chunks[0].progress).toBe(0.5);
      expect(chunks[1].progress).toBe(1);
    });

    it('無効なメタデータを適切にハンドリングする', async () => {
      mockIpfsClient.cat.mockImplementation(async function* () {
        yield Buffer.from(JSON.stringify({ invalid: 'metadata' }));
      });

      await expect(manager.streamChunks('invalid-metadata'))
        .rejects
        .toThrow('Invalid metadata format');
    });
  });

  describe('エラーハンドリング', () => {
    it('ネットワークエラーを適切にハンドリングする', async () => {
      mockIpfsClient.add.mockRejectedValue(new Error('Network error'));

      await expect(manager.createChunk(Buffer.from('test'), ChunkType.JSON))
        .rejects
        .toThrow('Failed to create chunk');
    });

    it('タイムアウトを適切にハンドリングする', async () => {
      // グローバル検索で時間切れ
      mockIpfsClient.dht.findProvs.mockImplementation(() => 
        new Promise(resolve => setTimeout(resolve, 2000))
      );

      const accessibility = await (manager as any)
        .checkDataAccessibility('test-cid');

      expect(accessibility.isAccessible).toBe(false);
      expect(accessibility.location).toBe('global');
    });
  });
}); 