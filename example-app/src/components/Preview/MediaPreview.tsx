import { useEffect, useState } from 'react';
import { useDAMIStream } from '../../hooks/useDAMIStream';

interface MediaPreviewProps {
  cid: string;
  type: 'image' | 'video';
}

export const MediaPreview = ({ cid, type }: MediaPreviewProps) => {
  const [data, setData] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { streamContent } = useDAMIStream();

  useEffect(() => {
    const loadMedia = async () => {
      try {
        setLoading(true);
        const chunks: Uint8Array[] = [];
        
        // コンテンツのストリーミング
        for await (const { data: chunk } of streamContent(cid)) {
          chunks.push(chunk);
        }

        // Blobの作成
        const blob = new Blob(chunks, { 
          type: type === 'image' ? 'image/jpeg' : 'video/mp4' 
        });
        const url = URL.createObjectURL(blob);
        setData(url);
      } catch (error) {
        console.error('メディア読み込みエラー:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMedia();

    // クリーンアップ
    return () => {
      if (data) {
        URL.revokeObjectURL(data);
      }
    };
  }, [cid, type, streamContent]);

  if (loading) {
    return <div className="media-loading">読み込み中...</div>;
  }

  if (!data) {
    return <div className="media-error">読み込みエラー</div>;
  }

  return (
    <div className="media-preview">
      {type === 'image' ? (
        <img 
          src={data} 
          alt="投稿画像"
          loading="lazy"
        />
      ) : (
        <video 
          src={data} 
          controls 
          preload="metadata"
        />
      )}
    </div>
  );
}; 