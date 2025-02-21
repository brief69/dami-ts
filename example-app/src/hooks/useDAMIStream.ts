import { useCallback } from 'react';
import { useDAMIClient } from './useDAMIClient';
import { HistoryEntry } from '../../../src/core/entities/HistoryTypes';

export const useDAMIStream = () => {
  const { ipfs, isInitialized } = useDAMIClient();

  const streamHistory = useCallback(async () => {
    if (!isInitialized || !ipfs) {
      throw new Error('DAMIクライアントが初期化されていません');
    }

    // TODO: 実際のhistory streamingロジックを実装
    return [] as HistoryEntry[];
  }, [ipfs, isInitialized]);

  const streamContent = useCallback(async function* (cid: string) {
    if (!isInitialized || !ipfs) {
      throw new Error('DAMIクライアントが初期化されていません');
    }

    try {
      for await (const chunk of ipfs.cat(cid)) {
        yield {
          data: chunk,
          progress: 0 // TODO: 進捗計算を実装
        };
      }
    } catch (error) {
      console.error('コンテンツストリーミングエラー:', error);
      throw error;
    }
  }, [ipfs, isInitialized]);

  return {
    streamHistory,
    streamContent
  };
}; 