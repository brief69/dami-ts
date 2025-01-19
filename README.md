# DAMI Protocol

DAMIは、分散型コンテンツ管理とP2P通信を組み合わせた新しいプロトコルです。

## 主な特徴

- IPFSベースのチャンク管理
- Holepunchを使用したP2P通信
- AT Protocol準拠の分散型ID
- インセンティブベースの価値システム

## 技術スタック

- TypeScript
- IPFS (データストレージ)
- Hyperswarm/DHT (P2P通信)
- Hypercore Protocol (データ同期)

## 開発状況

現在の実装は以下の基本機能を含みます：

- エンティティ定義 (Chunk, Recipe, User)
- コアサービス (ChunkManager, RecipeManager)
- IPFS統合
- P2P通信基盤

## 未実装/検討中の機能

- チャンク分割の具体的実装
- インセンティブ計算アルゴリズム
- XLLシステムとの連携
- ユーザー認証システム

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

## ライセンス

ISC
