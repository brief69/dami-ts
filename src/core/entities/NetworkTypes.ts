export interface PeerInfo {
  id: string;
  latency: number;
  location?: {
    country: string;
    region: string;
  };
  lastSeen: Date;
  connectionStatus: 'active' | 'inactive';
}

export interface AccessibilityCheck {
  isAccessible: boolean;
  latency: number;
  location?: 'local' | 'regional' | 'global';
  peer?: PeerInfo;
}

export interface NetworkConfig {
  latencyThreshold: number;  // ミリ秒
  localTimeout: number;      // ローカル検索のタイムアウト
  regionalTimeout: number;   // リージョナル検索のタイムアウト
  globalTimeout: number;     // グローバル検索のタイムアウト
  maxPeers: number;         // 最大ピア数
}

// デフォルト設定
export const DEFAULT_NETWORK_CONFIG: NetworkConfig = {
  latencyThreshold: 200,    // 200ms
  localTimeout: 100,        // 100ms
  regionalTimeout: 500,     // 500ms
  globalTimeout: 2000,      // 2秒
  maxPeers: 50
}; 