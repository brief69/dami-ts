declare module '@hyperswarm/dht' {
  interface DHTOptions {
    bootstrap?: string[];
    maxPeers?: number;
    [key: string]: any;
  }

  interface DHT {
    ready(): Promise<void>;
    destroy(): Promise<void>;
    on(event: string, callback: (peer: any) => void): void;
  }

  const createDHT: {
    new (options?: DHTOptions): DHT;
  };

  export = createDHT;
} 