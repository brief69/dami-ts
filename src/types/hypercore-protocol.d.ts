declare module 'hypercore-protocol' {
  interface HypercoreOptions {
    live?: boolean;
    encrypt?: boolean;
    [key: string]: any;
  }

  class Protocol {
    constructor(options?: HypercoreOptions);
    on(event: string, callback: (data: any) => void): void;
    destroy(): void;
  }

  const protocol: {
    new (options?: HypercoreOptions): Protocol;
  };

  export = protocol;
} 