import { useEffect, useState } from 'react';
import { useDAMIStream } from '../../hooks/useDAMIStream';
import { MediaPreview } from '../Preview/MediaPreview';

interface FeedItem {
  cid: string;
  type: 'image' | 'video';
  timestamp: number;
}

export const Feed = () => {
  const [items, setItems] = useState<FeedItem[]>([]);
  const { streamHistory } = useDAMIStream();

  useEffect(() => {
    const loadFeed = async () => {
      try {
        // 最新の履歴を取得
        const history = await streamHistory();
        const newItems: FeedItem[] = [];

        for await (const entry of history) {
          newItems.push({
            cid: entry.yll,
            type: entry.metadata?.type || 'image',
            timestamp: entry.timestamp
          });
        }

        // 時系列順にソート
        setItems(newItems.sort((a, b) => b.timestamp - a.timestamp));
      } catch (error) {
        console.error('フィード読み込みエラー:', error);
      }
    };

    loadFeed();
  }, [streamHistory]);

  return (
    <div className="feed-container">
      {items.map(item => (
        <div key={item.cid} className="feed-item">
          <MediaPreview
            cid={item.cid}
            type={item.type}
          />
          <div className="feed-item-meta">
            <time>{new Date(item.timestamp).toLocaleString()}</time>
          </div>
        </div>
      ))}
    </div>
  );
}; 