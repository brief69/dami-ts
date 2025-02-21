import { useCallback } from 'react';
import { useDAMIUpload } from '../../hooks/useDAMIUpload';

interface UploadProps {
  isUploading: boolean;
  setIsUploading: (value: boolean) => void;
}

export const Upload = ({ isUploading, setIsUploading }: UploadProps) => {
  const { uploadMedia, progress } = useDAMIUpload();

  const handleFileSelect = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      await uploadMedia(file);
    } catch (error) {
      console.error('アップロードエラー:', error);
    } finally {
      setIsUploading(false);
    }
  }, [uploadMedia, setIsUploading]);

  return (
    <div className="upload-container">
      <label className="upload-button">
        <input
          type="file"
          accept="image/*,video/*"
          onChange={handleFileSelect}
          disabled={isUploading}
          aria-label="ファイルを選択"
        />
        ファイルを選択
      </label>
      {isUploading && (
        <div className="upload-progress">
          <progress value={progress} max={100} />
          <span>{Math.round(progress)}%</span>
        </div>
      )}
    </div>
  );
}; 