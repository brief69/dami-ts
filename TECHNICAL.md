# DAMI Technical Documentation

## アーキテクチャ概要

DAMIは、データの重複を効率的に排除しながら、分散型の信頼性を確保する新しいアプローチを実現します。

### 1. データモデル

#### 1.1 チャンク（データの最小単位）

```typescript
interface Chunk {
  cid: string;          // コンテンツID（IPFS CID）
  type: ChunkType;      // データタイプ（JSON, VIDEO, IMAGE等）
  size: number;         // チャンクサイズ
  timestamp: Date;      // 作成時刻
}
```

#### 1.2 メタデータ（チャンク間の関係）

```typescript
interface ChunkMetadata {
  originalCid: string;  // 元データのCID
  chunks: {
    cid: string;       // チャンクのCID
    order: number;     // 順序
    type: ChunkType;   // タイプ
  }[];
  contentType: string; // コンテンツタイプ
  version: string;     // メタデータバージョン
}
```

### 2. 重複排除メカニズム

#### 2.1 データの分割と保存

1. **コンテンツの分析**:
   - データタイプの判別
   - 最適な分割サイズの決定
   - 重複可能性の評価

2. **チャンク分割**:
   ```typescript
   class ChunkManager {
     async splitContent(data: Buffer): Promise<Chunk[]> {
       // 1. コンテンツタイプの判別
       const type = this.detectContentType(data);
       
       // 2. 適切な分割方法の選択
       switch (type) {
         case ChunkType.JSON:
           return this.splitJsonContent(data);
         case ChunkType.VIDEO:
           return this.splitVideoContent(data);
         // ...
       }
     }
   }
   ```

### 3. ネットワーク最適化

#### 3.1 ピア管理

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

#### 3.2 アクセシビリティチェック

```typescript
interface AccessibilityCheck {
  isAccessible: boolean;
  latency: number;
  location?: 'local' | 'regional' | 'global';
  peer?: PeerInfo;
}
```

### 4. 履歴管理システム

#### 4.1 マニフェスト構造

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

#### 4.2 履歴エントリ

```typescript
interface HistoryEntry {
  yll: string;           // 中位CID
  timestamp: number;     // 投稿時刻
  sequence: number;      // 順序番号
  metadata?: {
    title?: string;
    description?: string;
    tags?: string[];
  };
}
```

### 5. メディア処理

#### 5.1 画像処理

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

#### 5.2 動画処理

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

### 6. エラーハンドリング

#### 6.1 カスタムエラー

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

### 7. パフォーマンス最適化

#### 7.1 キャッシュ設定

```typescript
const CACHE_CONFIG = {
  maxSize: 100 * 1024 * 1024, // 100MB
  maxAge: 24 * 60 * 60 * 1000, // 24時間
  cleanupInterval: 60 * 60 * 1000 // 1時間
};
```

#### 7.2 チャンクサイズ

```typescript
const CHUNK_SIZE_LIMITS = {
  MIN_SIZE: 256 * 1024,    // 256KB
  OPTIMAL_SIZE: 1024 * 1024, // 1MB
  MAX_SIZE: 5 * 1024 * 1024  // 5MB
};
```

### 8. セキュリティ

#### 8.1 データ保護

- 転送時の暗号化（TLS/SSL）
- 保存時の暗号化（AES-256）
- ピアの認証
- コンテンツの権限管理

#### 8.2 データ整合性

- ハッシュチェーンによる改ざん検知
- デジタル署名による認証
- タイムスタンプの検証

### 9. 将来の展望

1. **AI統合**:
   - 重複検出の精度向上
   - アクセスパターン予測
   - 自動最適化

2. **スケーラビリティ改善**:
   - シャーディング戦略
   - 動的なノード管理
   - 負荷分散の最適化

3. **新機能**:
   - リアルタイムコラボレーション
   - バージョン管理の強化
   - セマンティック検索
