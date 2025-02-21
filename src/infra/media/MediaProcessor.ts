import { MEDIA_STANDARDS } from '../../core/entities/MediaConfig';
import sharp from 'sharp';
import ffmpeg from 'fluent-ffmpeg';

interface FieldChunk {
  fieldName: string;
  value: any;
  type: string;
  order: number;
}

export class MediaProcessor {
  /**
   * 画像を標準化する
   */
  static async standardizeImage(imageBuffer: Buffer, type: 'THUMBNAIL' | 'PREVIEW' | 'FULL' = 'FULL'): Promise<Buffer> {
    const config = MEDIA_STANDARDS.IMAGE.RESOLUTION[type];
    
    return await sharp(imageBuffer)
      .resize(config.width, config.height, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .jpeg({
        quality: MEDIA_STANDARDS.IMAGE.QUALITY,
        progressive: true
      })
      .toBuffer();
  }

  /**
   * 動画を標準化する
   */
  static standardizeVideo(videoBuffer: Buffer, resolution: 'SD' | 'HD' | 'FHD' = 'HD'): Promise<Buffer> {
    const config = MEDIA_STANDARDS.VIDEO.RESOLUTION[resolution];
    
    return new Promise((resolve, reject) => {
      const command = ffmpeg(videoBuffer)
        .videoCodec(MEDIA_STANDARDS.VIDEO.CODEC)
        .size(`${config.width}x${config.height}`)
        .format(MEDIA_STANDARDS.VIDEO.CONTAINER)
        .on('end', () => {
          // 処理後の動画バッファを返す
          resolve(Buffer.from([])); // TODO: 実際のバッファ処理を実装
        })
        .on('error', reject);
    });
  }

  /**
   * ドキュメントデータを標準化してフィールドごとに分割
   */
  static splitDocument(data: any): FieldChunk[] {
    const chunks: FieldChunk[] = [];
    let order = 0;

    // 各フィールドを個別のチャンクとして分割
    for (const [fieldName, value] of Object.entries(data)) {
      chunks.push({
        fieldName,
        value,
        type: typeof value,
        order: order++
      });
    }

    return chunks;
  }

  /**
   * 分割されたフィールドを再構成
   */
  static reconstructDocument(chunks: FieldChunk[]): any {
    // 順序でソート
    const sortedChunks = chunks.sort((a, b) => a.order - b.order);
    
    // ドキュメントを再構成
    const document = {};
    for (const chunk of sortedChunks) {
      document[chunk.fieldName] = chunk.value;
    }

    return document;
  }
} 