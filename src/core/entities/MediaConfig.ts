export const MEDIA_STANDARDS = {
  // 動画の標準設定
  VIDEO: {
    CHUNK_DURATION: 6, // 秒
    MAX_CHUNK_SIZE: 5 * 1024 * 1024, // 5MB
    RESOLUTION: {
      SD: { width: 854, height: 480 },   // 480p
      HD: { width: 1280, height: 720 },  // 720p
      FHD: { width: 1920, height: 1080 } // 1080p
    },
    CODEC: 'h264',
    CONTAINER: 'mp4'
  },

  // 画像の標準設定
  IMAGE: {
    MAX_CHUNK_SIZE: 1024 * 1024, // 1MB
    RESOLUTION: {
      THUMBNAIL: { width: 150, height: 150 },
      PREVIEW: { width: 480, height: 480 },
      FULL: { width: 1920, height: 1920 }
    },
    FORMAT: 'jpeg',
    QUALITY: 85 // JPEG品質
  },

  // ドキュメントデータの標準設定
  DOCUMENT: {
    ALWAYS_SPLIT_FIELDS: true, // 常にフィールドごとに分割
    FIELD_HANDLING: {
      PRESERVE_ORDER: true,    // フィールドの順序を保持
      INCLUDE_FIELD_TYPE: true // フィールドの型情報を含める
    }
  }
}; 