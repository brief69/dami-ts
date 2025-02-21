import { useState, useEffect } from 'react';
import { createLibp2p } from 'libp2p';
import { noise } from '@chainsafe/libp2p-noise';
import { mplex } from '@libp2p/mplex';
import { tcp } from '@libp2p/tcp';
import { gossipsub } from '@chainsafe/libp2p-gossipsub';
import { DAMINode } from '../core/DAMINode';

interface DAMIClientState {
  isInitialized: boolean;
  error: Error | null;
  ipfs: any;
  node: any;
}

export const useDAMIClient = () => {
  const [state, setState] = useState<DAMIClientState>({
    isInitialized: false,
    error: null,
    ipfs: null,
    node: null
  });

  useEffect(() => {
    const damiNode = new DAMINode();
    
    const initializeClient = async () => {
      try {
        // TODO: エラーリトライロジックの実装
        // - 接続失敗時の再試行
        // - フォールバックサーバーの使用
        const ipfs = await damiNode.start();
        
        // TODO: libp2p設定の最適化
        // - プロトコル設定のカスタマイズ
        // - ルーティングテーブルの最適化
        const node = await createLibp2p({
          addresses: {
            listen: ['/ip4/0.0.0.0/tcp/0']
          },
          transports: [tcp()],
          connectionEncryption: [noise()],
          streamMuxers: [mplex()],
          services: {
            pubsub: gossipsub()
          }
        });

        await node.start();
        console.log('P2Pノード起動完了');
        console.log('リッスンアドレス:', node.getMultiaddrs());

        setState({
          isInitialized: true,
          error: null,
          ipfs,
          node
        });

      } catch (error) {
        console.error('DAMIクライアントの初期化エラー:', error);
        setState(prev => ({
          ...prev,
          error: error as Error,
          isInitialized: false
        }));
      }
    };

    // TODO: 状態管理の改善
    // - 再接続ロジックの実装
    // - オフライン/オンライン処理
    // - エラー状態からの回復
    initializeClient();

    return () => {
      damiNode.stop().catch(console.error);
    };
  }, []);

  return state;
}; 