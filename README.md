# DAMI Protocol

DAMIは、分散型コンテンツ管理とP2P通信を組み合わせた新しいプロトコルです。

## 主な特徴

- IPFSベースのチャンク管理
- libp2pを使用したP2P通信
- AT Protocol準拠の分散型ID
- インセンティブベースの価値システム

## 技術スタック

- TypeScript
- IPFS (データストレージ)
- libp2p (P2P通信基盤)
- libp2p-kad-dht (DHT実装)

## 開発状況

現在の実装は以下の基本機能を含みます：

- エンティティ定義 (Chunk, Recipe, User)
- コアサービス (ChunkManager, RecipeManager)
- IPFS統合
- libp2pベースのP2P通信基盤

## 未実装/検討中の機能

- チャンク分割の具体的実装
- インセンティブ計算アルゴリズム
- XLLシステムとの連携
- ユーザー認証システム

## 実装観点

- シンプルで簡単な実装を目指します
- 拡張性を重視した設計を行います
- 柔軟な構造を維持します
- 不必要な複雑性は排除します

## セットアップ

```bash
npm install
npm run build
npm start
```

## 注意点

- 開発初期段階のため、APIは変更される可能性があります
- 本番環境での使用は推奨されません
- セキュリティ面での検証が必要です

## コントリビューション

1. このリポジトリをフォークします
2. 新しい機能用のブランチを作成します：`git checkout -b feature/amazing-feature`
3. 変更をコミットします：`git commit -m 'Add amazing feature'`
4. リモートブランチにプッシュします：`git push origin feature/amazing-feature`
5. プルリクエストを作成します
