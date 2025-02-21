# DAMI 開発者ガイド

## 目次

1. [アーキテクチャ概要](#アーキテクチャ概要)
2. [コアコンポーネント](#コアコンポーネント)
3. [データモデル](#データモデル)
4. [ネットワーク管理](#ネットワーク管理)
5. [履歴管理](#履歴管理)
6. [デモアプリケーション](#デモアプリケーション)
7. [テスト](#テスト)
8. [エラーハンドリング](#エラーハンドリング)

## アーキテクチャ概要

DAMIは以下の主要なレイヤーで構成されています：

```
src/
├── core/           # ドメインロジックと型定義
│   ├── entities/   # データモデル
│   └── services/   # インターフェース定義
└── infra/          # 実装レイヤー
    ├── ipfs/       # IPFSとの連携
    ├── p2p/        # P2P通信
    └── media/      # メディア処理
```

## デモアプリケーション

### コンポーネント構造

```
example-app/
├── src/
│   ├── components/
│   │   ├── Feed/        # フィード表示
│   │   ├── Upload/      # ファイルアップロード
│   │   └── Preview/     # メディアプレビュー
│   ├── hooks/
│   │   ├── useDAMIClient.ts   # DAMIクライアント管理
│   │   ├── useDAMIStream.ts   # ストリーミング機能
│   │   └── useDAMIUpload.ts   # アップロード機能
│   └── core/
│       └── DAMINode.ts  # DAMIノード実装
```

### 主要コンポーネント

#### DAMINode
- IPFSノードの初期化と管理
- P2P通信の設定
- WebRTC接続の管理

#### Feed
- 投稿履歴の表示
- メディアプレビューの統合
- 時系列ソート

#### Upload
- ファイル選択UI
- プログレス表示
- エラーハンドリング

#### MediaPreview
- 画像/動画の表示
- ストリーミング再生
- プレースホルダー表示

### カスタムフック

#### useDAMIClient
- DAMIクライアントの初期化
- 接続状態の管理
- エラーハンドリング

#### useDAMIStream
- コンテンツのストリーミング
- 履歴の取得
- プログレス管理

#### useDAMIUpload
- ファイルアップロード
- チャンク分割
- プログレス管理

## コアコンポーネント

### ChunkManager

チャンクの基本操作を担当します：

```typescript
interface ChunkManager {
  createChunk(data: Buffer, type: ChunkType): Promise<Chunk>;
  getChunk(cid: string): Promise<Chunk>;
  deleteChunk(cid: string): Promise<void>;
  verifyChunkIntegrity(chunk: Chunk): Promise<boolean>;
}
```

#### 使用例：

```typescript
const chunkManager = new ChunkManagerImpl();
await chunkManager.init();

// チャンクの作成
const chunk = await chunkManager.createChunk(
  Buffer.from('データ'),
  ChunkType.JSON
);

// チャンクの取得
const retrievedChunk = await chunkManager.getChunk(chunk.cid);
```

### EnhancedChunkManager

地理的な最適化とネットワークレイテンシを考慮した拡張機能：

```typescript
const manager = new EnhancedChunkManager({
  latencyThreshold: 200,    // 200ms
  localTimeout: 100,        // 100ms
  regionalTimeout: 500,     // 500ms
  globalTimeout: 2000,      // 2秒
  maxPeers: 50
});
```

## データモデル

### チャンク（Chunk）

```typescript
interface Chunk {
  cid: string;          // コンテンツID
  type: ChunkType;      // データタイプ
  size: number;         // サイズ
  timestamp: Date;      // 作成時刻
}

enum ChunkType {
  JSON = 'json',
  VIDEO = 'video',
  IMAGE = 'image',
  OTHER = 'other'
}
```

### 履歴管理（History）

```typescript
interface HistoryEntry {
  yll: string;           // 中位CID
  timestamp: number;     // 投稿時刻
  sequence: number;      // 順序番号
  metadata?: {           // メタデータ
    title?: string;
    description?: string;
    tags?: string[];
  };
}
```

## ネットワーク管理

### ピア管理

```typescript
interface PeerInfo {
  id: string;
  latency: number;
  location?: {
    country: string;
    region: string;
  };
  lastSeen: Date;
  connectionStatus: 'active' | 'inactive';
}
```

### アクセシビリティチェック

```typescript
interface AccessibilityCheck {
  isAccessible: boolean;
  latency: number;
  location?: 'local' | 'regional' | 'global';
  peer?: PeerInfo;
}
```

## 履歴管理

### マニフェスト構造

```typescript
interface HistoryManifest {
  zll: string;          // 上位CID
  entries: HistoryEntry[];
  lastUpdated: number;
  version: string;
  previousZll: string | null;
  hash: string;
}
```

### 設定オプション

```typescript
interface HistoryOptions {
  retentionDays?: number; // 履歴保持期間
  autoCleanup?: boolean;  // 自動クリーンアップ
}
```

## メディア処理

### 画像設定

```typescript
const IMAGE_STANDARDS = {
  MAX_CHUNK_SIZE: 1024 * 1024, // 1MB
  RESOLUTION: {
    THUMBNAIL: { width: 150, height: 150 },
    PREVIEW: { width: 480, height: 480 },
    FULL: { width: 1920, height: 1920 }
  },
  FORMAT: 'jpeg',
  QUALITY: 85
};
```

### 動画設定

```typescript
const VIDEO_STANDARDS = {
  CHUNK_DURATION: 6, // 秒
  MAX_CHUNK_SIZE: 5 * 1024 * 1024, // 5MB
  RESOLUTION: {
    SD: { width: 854, height: 480 },
    HD: { width: 1280, height: 720 },
    FHD: { width: 1920, height: 1080 }
  }
};
```

## テスト

### ユニットテスト

```bash
# 全テストの実行
npm test

# 特定のテストファイルの実行
npm test src/infra/ipfs/__tests__/ChunkManagerImpl.test.ts

# 監視モードでのテスト実行
npm run test:watch
```

### モックの使用例

```typescript
const mockIpfsClient = {
  add: jest.fn(),
  cat: jest.fn(),
  pin: {
    rm: jest.fn()
  }
};

jest.mock('kubo-rpc-client', () => ({
  create: () => mockIpfsClient
}));
```

## エラーハンドリング

### カスタムエラークラス

```typescript
class ChunkError extends Error {
  constructor(message: string, public readonly cause?: Error) {
    super(message);
    this.name = 'ChunkError';
  }
}

class NetworkError extends Error {
  constructor(message: string, public readonly cause?: Error) {
    super(message);
    this.name = 'NetworkError';
  }
}

class HistoryError extends Error {
  constructor(message: string, public readonly cause?: Error) {
    super(message);
    this.name = 'HistoryError';
  }
}
```

### エラー処理のベストプラクティス

1. **エラーの種類に応じた適切な処理**:
   - ネットワークエラー → リトライ
   - データ整合性エラー → 検証とリカバリー
   - タイムアウト → フォールバック処理

2. **エラーログの記録**:
   ```typescript
   try {
     await operation();
   } catch (error) {
     console.error(
       `操作失敗: ${error.message}`,
       `コンテキスト: ${JSON.stringify(context)}`,
       error
     );
     throw new OperationError('操作に失敗しました', error);
   }
   ```

3. **グレースフルデグラデーション**:
   ```typescript
   async function getDataWithFallback(cid: string): Promise<Buffer> {
     try {
       return await getPrimaryData(cid);
     } catch {
       return await getBackupData(cid);
     }
   }
   ```

## パフォーマンス最適化

### キャッシュ戦略

```typescript
const CACHE_CONFIG = {
  maxSize: 100 * 1024 * 1024, // 100MB
  maxAge: 24 * 60 * 60 * 1000, // 24時間
  cleanupInterval: 60 * 60 * 1000 // 1時間
};
```

### チャンクサイズの最適化

```typescript
const CHUNK_SIZE_LIMITS = {
  MIN_SIZE: 256 * 1024,    // 256KB
  OPTIMAL_SIZE: 1024 * 1024, // 1MB
  MAX_SIZE: 5 * 1024 * 1024  // 5MB
};
```

## セキュリティ考慮事項

1. **データの暗号化**:
   - 転送時の暗号化（TLS/SSL）
   - 保存時の暗号化（AES-256）

2. **アクセス制御**:
   - ピアの認証
   - コンテンツの権限管理

3. **データの整合性**:
   - ハッシュチェーン
   - デジタル署名

## 貢献ガイドライン

1. **コーディング規約**:
   - TypeScriptの厳格モード使用
   - ESLintとPrettierの設定に従う
   - 適切なコメント記述

2. **プルリクエスト**:
   - 機能単位でブランチを作成
   - テストの追加
   - ドキュメントの更新

3. **コミットメッセージ**:
   ```
   feat: 新機能の追加
   fix: バグ修正
   docs: ドキュメントの更新
   test: テストの追加・修正
   refactor: リファクタリング
   ```
