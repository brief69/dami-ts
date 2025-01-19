export class User {
  constructor(
    public readonly did: string, // AT Protocol DID
    public readonly publicKey: string,
    public readonly metadata: UserMetadata,
    public readonly createdAt: Date
  ) {}
}

export interface UserMetadata {
  name?: string;
  description?: string;
  // AT Protocolに準拠した追加フィールド
} 