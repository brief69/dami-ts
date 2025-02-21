import { HistoryManagerImpl } from '../HistoryManagerImpl';
import { HistoryEntry, HistoryManifest } from '../../../core/entities/HistoryTypes';

// IPFSクライアントのモック
const mockIpfsClient = {
  add: jest.fn(),
  cat: jest.fn(),
  pin: {
    rm: jest.fn()
  }
};

// create関数をモック
jest.mock('kubo-rpc-client', () => ({
  create: () => mockIpfsClient
}));

describe('HistoryManagerImpl', () => {
  let manager: HistoryManagerImpl;
  let mockManifests: Map<string, HistoryManifest>;
  let currentTime: number;

  beforeEach(() => {
    jest.clearAllMocks();
    manager = new HistoryManagerImpl();
    mockManifests = new Map();
    currentTime = Date.now();

    // IPFSのadd操作をモック
    mockIpfsClient.add.mockImplementation(async (content: string) => {
      const cid = `cid-${mockManifests.size + 1}`;
      const manifest = JSON.parse(content);
      manifest.zll = cid;
      mockManifests.set(cid, manifest);
      return { cid: { toString: () => cid } };
    });

    // IPFSのcat操作をモック
    mockIpfsClient.cat.mockImplementation(async function* (cid: string) {
      const manifest = mockManifests.get(cid);
      if (!manifest) {
        throw new Error(`Manifest not found for CID: ${cid}`);
      }
      yield Buffer.from(JSON.stringify(manifest));
    });
  });

  describe('addEntry', () => {
    it('最初のエントリを追加すると新しいチェーンが作成される', async () => {
      const yll = 'test-yll-1';
      await manager.addEntry(yll);

      const currentZll = await manager.getCurrentZll();
      const manifest = await manager.getManifest(currentZll);

      expect(manifest.previousZll).toBeNull();
      expect(manifest.entries).toHaveLength(1);
      expect(manifest.entries[0].yll).toBe(yll);
      expect(manifest.entries[0].sequence).toBe(1);
    });

    it('複数のエントリを追加するとチェーンが正しく形成される', async () => {
      const ylls = ['test-yll-1', 'test-yll-2', 'test-yll-3'];
      
      for (const yll of ylls) {
        await manager.addEntry(yll);
      }

      const currentZll = await manager.getCurrentZll();
      const manifest = await manager.getManifest(currentZll);

      expect(manifest.entries).toHaveLength(3);
      expect(manifest.previousZll).not.toBeNull();
      
      // シーケンス番号の検証
      expect(manifest.entries.map(e => e.sequence)).toEqual([1, 2, 3]);
      
      // チェーンの検証
      const isValid = await manager.verifyChain(currentZll);
      expect(isValid).toBe(true);
    });

    it('メタデータ付きでエントリを追加できる', async () => {
      const yll = 'test-yll-1';
      const metadata = {
        title: 'Test Entry',
        description: 'Test Description',
        tags: ['test', 'entry']
      };

      await manager.addEntry(yll, metadata);
      const currentZll = await manager.getCurrentZll();
      const manifest = await manager.getManifest(currentZll);

      expect(manifest.entries[0].metadata).toEqual(metadata);
    });
  });

  describe('getEntriesByTimeRange', () => {
    beforeEach(async () => {
      // 異なる時間のエントリを追加
      const entries = [
        { yll: 'yll-1', timestamp: currentTime - 3000 },
        { yll: 'yll-2', timestamp: currentTime - 2000 },
        { yll: 'yll-3', timestamp: currentTime - 1000 }
      ];

      for (const entry of entries) {
        jest.spyOn(Date, 'now').mockReturnValue(entry.timestamp);
        await manager.addEntry(entry.yll);
      }
    });

    it('指定した時間範囲のエントリを取得できる', async () => {
      const entries = await manager.getEntriesByTimeRange(
        currentTime - 2500,
        currentTime - 500
      );

      expect(entries).toHaveLength(2);
      expect(entries[0].yll).toBe('yll-2');
      expect(entries[1].yll).toBe('yll-3');
    });

    it('時間範囲外のエントリは除外される', async () => {
      const entries = await manager.getEntriesByTimeRange(
        currentTime - 1500,
        currentTime - 500
      );

      expect(entries).toHaveLength(1);
      expect(entries[0].yll).toBe('yll-3');
    });
  });

  describe('verifyChain', () => {
    it('改ざんされていないチェーンは検証に成功する', async () => {
      const ylls = ['yll-1', 'yll-2', 'yll-3'];
      for (const yll of ylls) {
        await manager.addEntry(yll);
      }

      const currentZll = await manager.getCurrentZll();
      const isValid = await manager.verifyChain(currentZll);
      expect(isValid).toBe(true);
    });

    it('改ざんされたチェーンは検証に失敗する', async () => {
      const ylls = ['yll-1', 'yll-2', 'yll-3'];
      for (const yll of ylls) {
        await manager.addEntry(yll);
      }

      const currentZll = await manager.getCurrentZll();
      const manifest = await manager.getManifest(currentZll);

      // マニフェストを改ざん
      manifest.entries[1].sequence = 10;
      mockManifests.set(currentZll, manifest);

      const isValid = await manager.verifyChain(currentZll);
      expect(isValid).toBe(false);
    });

    it('特定の範囲のチェーンを検証できる', async () => {
      const ylls = ['yll-1', 'yll-2', 'yll-3', 'yll-4'];
      const zllHistory: string[] = [];

      for (const yll of ylls) {
        await manager.addEntry(yll);
        zllHistory.push(await manager.getCurrentZll());
      }

      // 中間の範囲を検証
      const isValid = await manager.verifyChain(zllHistory[3], zllHistory[1]);
      expect(isValid).toBe(true);
    });
  });

  describe('cleanup', () => {
    it('保持期間を超えた古い履歴を削除する', async () => {
      // オプションを設定（1日で期限切れ）
      manager.updateOptions({ retentionDays: 1 });

      // 2日前のエントリを作成
      const oldTime = currentTime - (2 * 24 * 60 * 60 * 1000);
      jest.spyOn(Date, 'now')
        .mockReturnValue(oldTime);

      // 古いエントリを作成
      await manager.addEntry('old-yll');
      const oldZll = await manager.getCurrentZll();

      // 現在のエントリを作成
      jest.spyOn(Date, 'now')
        .mockReturnValue(currentTime);
      await manager.addEntry('new-yll');

      // クリーンアップを実行
      await manager.cleanup();

      // 古いエントリとマニフェストが削除され、新しいマニフェストが作成されたことを確認
      const pinRmCalls = mockIpfsClient.pin.rm.mock.calls.map(call => call[0]);
      expect(pinRmCalls).toContain('old-yll');
      expect(pinRmCalls).toContain(oldZll);

      // 新しいマニフェストには古いエントリが含まれていないことを確認
      const addCalls = mockIpfsClient.add.mock.calls.map(call => call[0]);
      const newManifestCall = addCalls[addCalls.length - 1];
      expect(newManifestCall).not.toContain('old-yll');
      expect(newManifestCall).toContain('new-yll');

      // 新しいマニフェストのpreviousZllがnullであることを確認
      const newManifest = JSON.parse(newManifestCall);
      expect(newManifest.previousZll).toBeNull();
    });
  });
}); 