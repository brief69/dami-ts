import { useState, useCallback } from 'react';
import { useDAMIClient } from './useDAMIClient';

export const useDAMIUpload = () => {
  const [progress, setProgress] = useState(0);
  const { ipfs, isInitialized } = useDAMIClient();

  const uploadMedia = useCallback(async (file: File) => {
    if (!isInitialized || !ipfs) {
      throw new Error('DAMIクライアントが初期化されていません');
    }

    try {
      // ファイルをバッファに変換
      const buffer = await file.arrayBuffer();
      const data = Buffer.from(buffer);

      // IPFSにアップロード
      const result = await ipfs.add(data, {
        progress: (prog: number) => {
          setProgress((prog / data.length) * 100);
        }
      });

      return result.cid.toString();
    } catch (error) {
      console.error('アップロードエラー:', error);
      throw error;
    }
  }, [ipfs, isInitialized]);

  return { uploadMedia, progress };
}; 