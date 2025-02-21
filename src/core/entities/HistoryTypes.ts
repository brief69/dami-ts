import { Chunk } from './Chunk';

export interface HistoryEntry {
  yll: string;           // 中位CID
  timestamp: number;     // 投稿時刻
  sequence: number;      // 順序番号（全体での通し番号）
  metadata?: {           // メタデータ（オプション）
    title?: string;
    description?: string;
    tags?: string[];
  };
}

export interface HistoryManifest {
  zll: string;          // 上位CID
  entries: HistoryEntry[]; // 全履歴
  lastUpdated: number;  // 最終更新時刻
  version: string;      // マニフェストのバージョン
  previousZll: string | null; // 前のzll（チェーン構造用）
  hash: string;         // 前のマニフェストのハッシュ（改ざん検知用）
}

export interface HistoryOptions {
  retentionDays?: number; // 履歴保持期間
  autoCleanup?: boolean;  // 古い履歴の自動クリーンアップ
}

export const DEFAULT_HISTORY_OPTIONS: HistoryOptions = {
  retentionDays: 365,
  autoCleanup: true
}; 