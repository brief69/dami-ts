import { HistoryEntry, HistoryManifest, HistoryOptions } from '../entities/HistoryTypes';

export interface HistoryManager {
  /**
   * 新しいyllエントリを追加し、必要に応じてzllを生成
   */
  addEntry(yll: string, metadata?: HistoryEntry['metadata']): Promise<void>;

  /**
   * 最新のzllを取得
   */
  getCurrentZll(): Promise<string>;

  /**
   * 特定のzllのマニフェストを取得
   */
  getManifest(zll: string): Promise<HistoryManifest>;

  /**
   * 指定された期間内のエントリを取得
   */
  getEntriesByTimeRange(
    startTime: number,
    endTime: number
  ): Promise<HistoryEntry[]>;

  /**
   * zllの履歴チェーンを検証
   */
  verifyChain(startZll: string, endZll?: string): Promise<boolean>;

  /**
   * 履歴オプションを更新
   */
  updateOptions(options: Partial<HistoryOptions>): void;

  /**
   * 古い履歴を整理（オプション）
   */
  cleanup(): Promise<void>;
} 