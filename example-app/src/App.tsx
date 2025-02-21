import { useState } from 'react'
import { Feed } from './components/Feed'
import { Upload } from './components/Upload'
import { useDAMIClient } from './hooks/useDAMIClient'
import './App.css'

export const App = () => {
  const { isInitialized, error } = useDAMIClient();
  const [isUploading, setIsUploading] = useState(false);

  if (!isInitialized) {
    return <div>DAMIクライアントを初期化中...</div>;
  }

  if (error) {
    return <div>エラーが発生しました: {error.message}</div>;
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>DAMI Example App</h1>
        <Upload 
          isUploading={isUploading}
          setIsUploading={setIsUploading}
        />
      </header>
      <main className="app-main">
        <Feed />
      </main>
    </div>
  );
};
