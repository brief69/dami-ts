import { create } from 'kubo-rpc-client';
import { HistoryManager } from '../../core/services/HistoryManager';
import { HistoryEntry, HistoryManifest, HistoryOptions, DEFAULT_HISTORY_OPTIONS } from '../../core/entities/HistoryTypes';
import { createHash } from 'crypto';

class HistoryError extends Error {
  constructor(message: string, public readonly cause?: Error) {
    super(message);
    this.name = 'HistoryError';
  }
}

export class HistoryManagerImpl implements HistoryManager {
  private ipfs;
  private currentZll: string | null = null;
  private options: HistoryOptions;
  private sequence: number = 0;

  constructor(options: Partial<HistoryOptions> = {}) {
    this.options = { ...DEFAULT_HISTORY_OPTIONS, ...options };
    this.ipfs = create({ url: 'http://localhost:5001/api/v0' });
  }

  private async calculateHash(data: any): Promise<string> {
    const content = typeof data === 'string' ? data : JSON.stringify(data);
    return createHash('sha256').update(content).digest('hex');
  }

  async addEntry(yll: string, metadata?: HistoryEntry['metadata']): Promise<void> {
    try {
      // 新しいエントリの作成
      const timestamp = Date.now();
      const newEntry: HistoryEntry = {
        yll,
        timestamp,
        sequence: ++this.sequence,
        metadata
      };

      // 現在のマニフェストを取得または新規作成
      let currentManifest: HistoryManifest;
      if (this.currentZll) {
        currentManifest = await this.getManifest(this.currentZll);
      } else {
        currentManifest = {
          zll: '',
          entries: [],
          lastUpdated: timestamp,
          version: '1.0',
          previousZll: null,
          hash: ''
        };
      }

      // 新しいマニフェストの作成
      const newManifest: HistoryManifest = {
        zll: '',  // 後で設定
        entries: [...currentManifest.entries, newEntry],
        lastUpdated: timestamp,
        version: currentManifest.version,
        previousZll: this.currentZll,
        hash: await this.calculateHash(currentManifest)
      };

      // マニフェストをIPFSに保存
      const result = await this.ipfs.add(JSON.stringify(newManifest));
      newManifest.zll = result.cid.toString();
      
      // 現在のzllを更新
      this.currentZll = newManifest.zll;

      // 自動クリーンアップが有効な場合、古い履歴を整理
      if (this.options.autoCleanup) {
        await this.cleanup();
      }
    } catch (error) {
      throw new HistoryError('Failed to add entry', error as Error);
    }
  }

  async getCurrentZll(): Promise<string> {
    if (!this.currentZll) {
      throw new HistoryError('No history exists yet');
    }
    return this.currentZll;
  }

  async getManifest(zll: string): Promise<HistoryManifest> {
    try {
      const chunks: Buffer[] = [];
      for await (const chunk of this.ipfs.cat(zll)) {
        chunks.push(Buffer.from(chunk));
      }
      const content = Buffer.concat(chunks).toString();
      return JSON.parse(content);
    } catch (error) {
      throw new HistoryError(`Failed to get manifest for ZLL ${zll}`, error as Error);
    }
  }

  async getEntriesByTimeRange(startTime: number, endTime: number): Promise<HistoryEntry[]> {
    try {
      if (!this.currentZll) {
        return [];
      }

      const entries: HistoryEntry[] = [];
      let currentManifest = await this.getManifest(this.currentZll);

      while (currentManifest) {
        // 該当する期間のエントリを抽出
        const timeFilteredEntries = currentManifest.entries.filter(
          entry => entry.timestamp >= startTime && entry.timestamp <= endTime
        );
        entries.push(...timeFilteredEntries);

        // 前のマニフェストが存在し、まだ startTime に達していない場合は遡る
        if (currentManifest.previousZll && 
            currentManifest.entries[0].timestamp > startTime) {
          currentManifest = await this.getManifest(currentManifest.previousZll);
        } else {
          break;
        }
      }

      // シーケンス番号でソート
      return entries.sort((a, b) => a.sequence - b.sequence);
    } catch (error) {
      throw new HistoryError('Failed to get entries by time range', error as Error);
    }
  }

  async verifyChain(startZll: string, endZll?: string): Promise<boolean> {
    try {
      let currentZll = startZll;
      let manifest = await this.getManifest(currentZll);

      while (true) {
        // ハッシュの検証
        if (manifest.previousZll) {
          const previousManifest = await this.getManifest(manifest.previousZll);
          const calculatedHash = await this.calculateHash(previousManifest);
          if (calculatedHash !== manifest.hash) {
            return false;
          }
        }

        // シーケンス番号の連続性を確認
        for (let i = 1; i < manifest.entries.length; i++) {
          if (manifest.entries[i].sequence !== manifest.entries[i-1].sequence + 1) {
            return false;
          }
        }

        // 終了条件のチェック
        if (!manifest.previousZll || manifest.previousZll === endZll) {
          break;
        }

        // 次のマニフェストへ
        currentZll = manifest.previousZll;
        manifest = await this.getManifest(currentZll);
      }

      return true;
    } catch (error) {
      throw new HistoryError('Failed to verify chain', error as Error);
    }
  }

  updateOptions(options: Partial<HistoryOptions>): void {
    this.options = { ...this.options, ...options };
  }

  async cleanup(): Promise<void> {
    if (!this.options.retentionDays || !this.currentZll) {
      return;
    }

    try {
      const cutoffTime = Date.now() - (this.options.retentionDays * 24 * 60 * 60 * 1000);
      let currentManifest = await this.getManifest(this.currentZll);

      // 期限切れのエントリを特定
      const expiredEntries = currentManifest.entries.filter(
        entry => entry.timestamp < cutoffTime
      );

      if (expiredEntries.length > 0) {
        // 期限切れのエントリを削除
        for (const entry of expiredEntries) {
          await this.ipfs.pin.rm(entry.yll);
        }

        // 有効なエントリのみを保持
        const validEntries = currentManifest.entries.filter(
          entry => entry.timestamp >= cutoffTime
        );

        // 前のマニフェストを削除
        if (currentManifest.previousZll) {
          await this.ipfs.pin.rm(currentManifest.previousZll);
        }

        // 新しいマニフェストを作成
        const timestamp = Date.now();
        const newManifest: HistoryManifest = {
          zll: '',
          entries: validEntries,
          lastUpdated: timestamp,
          version: currentManifest.version,
          previousZll: null,
          hash: await this.calculateHash(currentManifest)
        };

        // 新しいマニフェストを保存
        const result = await this.ipfs.add(JSON.stringify(newManifest));
        newManifest.zll = result.cid.toString();
        this.currentZll = newManifest.zll;
      }
    } catch (error) {
      throw new HistoryError('Failed to cleanup history', error as Error);
    }
  }
} 