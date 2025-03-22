import React, { useState, useRef } from 'react';
import {
  Container,
  Typography,
  Paper,
  Box,
  Button,
  Grid,
  Card,
  CardContent,
  Divider,
  Chip,
  Toolbar,
  Alert,
  IconButton,
  TextField,
  Tabs,
  Tab,
  Slider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Switch,
  FormControlLabel,
  LinearProgress,
} from '@mui/material';
import VideocamIcon from '@mui/icons-material/Videocam';
import ImageIcon from '@mui/icons-material/Image';
import MovieIcon from '@mui/icons-material/Movie';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DownloadIcon from '@mui/icons-material/Download';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import SpeedIcon from '@mui/icons-material/Speed';

interface MediaItem {
  id: string;
  type: 'image' | 'video';
  name: string;
  size: number;
  cid: string;
  url: string; // ダミーURL - 実際にはIPFSゲートウェイURLなど
  thumbnail?: string;
  timestamp: string;
  metadata: {
    width?: number;
    height?: number;
    duration?: number;
    format?: string;
  };
}

const MediaTest: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [useAdaptiveStreaming, setUseAdaptiveStreaming] = useState(true);
  const [quality, setQuality] = useState('auto');
  const [alert, setAlert] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const isVideo = file.type.startsWith('video/');
      const isImage = file.type.startsWith('image/');
      
      if (!isVideo && !isImage) {
        setAlert({
          type: 'error',
          message: '画像または動画ファイルを選択してください。',
        });
        return;
      }
      
      // アップロード処理開始
      handleUploadMedia(file);
    }
  };

  const handleUploadMedia = (file: File) => {
    setUploading(true);
    setUploadProgress(0);
    
    setAlert({
      type: 'info',
      message: `${file.name} をアップロード中...`,
    });
    
    // アップロード進行状況のシミュレーション
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + Math.random() * 10;
      });
    }, 300);
    
    // アップロード完了のシミュレーション
    setTimeout(() => {
      clearInterval(interval);
      setUploadProgress(100);
      
      setTimeout(() => {
        // 新しいメディアアイテムの作成
        const isVideo = file.type.startsWith('video/');
        const isImage = file.type.startsWith('image/');
        const type = isVideo ? 'video' : 'image';
        
        // ダミーのCIDを生成
        const cid = `Qm${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
        
        // ダミーのURLを生成（実際のアプリではIPFSゲートウェイURLなど）
        const url = isVideo 
          ? 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4' 
          : `https://picsum.photos/seed/${Math.random()}/800/600`;
        
        const thumbnail = isVideo 
          ? `https://picsum.photos/seed/${Math.random()}/400/300` 
          : url;
        
        const newItem: MediaItem = {
          id: `media_${Date.now()}`,
          type,
          name: file.name,
          size: file.size,
          cid,
          url,
          thumbnail,
          timestamp: new Date().toISOString(),
          metadata: {
            width: Math.floor(Math.random() * 1000) + 500,
            height: Math.floor(Math.random() * 800) + 400,
            format: file.type,
            ...(isVideo ? { duration: Math.floor(Math.random() * 300) + 30 } : {}),
          },
        };
        
        setMediaItems([...mediaItems, newItem]);
        setSelectedItem(newItem);
        
        setAlert({
          type: 'success',
          message: `${file.name} のアップロードが完了しました！`,
        });
        
        setUploading(false);
        setTimeout(() => setAlert(null), 3000);
      }, 500);
    }, 3000);
  };

  const handleItemSelect = (item: MediaItem) => {
    setSelectedItem(item);
    if (item.type === 'video') {
      setIsPlaying(false);
    }
  };

  const handlePlayPause = () => {
    if (!videoRef.current) return;
    
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    
    setIsPlaying(!isPlaying);
  };

  const handleSpeedChange = (event: Event, newValue: number | number[]) => {
    const speed = newValue as number;
    setPlaybackSpeed(speed);
    
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  };

  const handleQualityChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setQuality(event.target.value as string);
  };

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setAlert({
      type: 'success',
      message: 'クリップボードにコピーしました！',
    });
    setTimeout(() => setAlert(null), 3000);
  };

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <>
      <Toolbar />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Paper sx={{ p: 3, mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <VideocamIcon color="primary" sx={{ mr: 1 }} />
            <Typography variant="h5" component="h1">
              メディアテスト
            </Typography>
          </Box>
          <Typography variant="body1" sx={{ mb: 3 }}>
            DAMIプロトコルでの画像・動画の扱いをテストします。メディアのアップロード、表示、ストリーミングなどが可能です。
          </Typography>

          {alert && (
            <Alert severity={alert.type} sx={{ mb: 3 }} onClose={() => setAlert(null)}>
              {alert.message}
            </Alert>
          )}

          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs value={activeTab} onChange={handleTabChange} aria-label="media tabs">
              <Tab label="画像" icon={<ImageIcon />} iconPosition="start" />
              <Tab label="動画" icon={<MovieIcon />} iconPosition="start" />
            </Tabs>
          </Box>

          <Grid container spacing={3}>
            {/* メディア一覧 */}
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    メディア一覧
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  <Box sx={{ textAlign: 'center', mb: 3 }}>
                    <input
                      type="file"
                      hidden
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept={activeTab === 0 ? "image/*" : "video/*"}
                    />
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<CloudUploadIcon />}
                      onClick={handleFileSelect}
                      disabled={uploading}
                      fullWidth
                    >
                      {activeTab === 0 ? '画像をアップロード' : '動画をアップロード'}
                    </Button>
                  </Box>

                  {uploading && (
                    <Box sx={{ width: '100%', mb: 3 }}>
                      <LinearProgress 
                        variant="determinate" 
                        value={uploadProgress} 
                        sx={{ mb: 1 }}
                      />
                      <Typography variant="body2" color="text.secondary" align="center">
                        {Math.round(uploadProgress)}% アップロード完了
                      </Typography>
                    </Box>
                  )}

                  <Box sx={{ maxHeight: 400, overflowY: 'auto' }}>
                    {mediaItems.filter(item => 
                      (activeTab === 0 && item.type === 'image') || 
                      (activeTab === 1 && item.type === 'video')
                    ).length === 0 ? (
                      <Box sx={{ textAlign: 'center', py: 4 }}>
                        <Typography variant="body2" color="text.secondary">
                          {activeTab === 0 ? '画像' : '動画'}がまだありません。
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          上のボタンからアップロードしてください。
                        </Typography>
                      </Box>
                    ) : (
                      <Grid container spacing={1}>
                        {mediaItems
                          .filter(item => 
                            (activeTab === 0 && item.type === 'image') || 
                            (activeTab === 1 && item.type === 'video')
                          )
                          .map((item) => (
                            <Grid item xs={6} key={item.id}>
                              <Card 
                                variant="outlined"
                                sx={{ 
                                  cursor: 'pointer',
                                  border: selectedItem?.id === item.id ? '2px solid' : '1px solid',
                                  borderColor: selectedItem?.id === item.id ? 'primary.main' : 'divider'
                                }}
                                onClick={() => handleItemSelect(item)}
                              >
                                <Box
                                  sx={{
                                    position: 'relative',
                                    paddingTop: '75%',
                                    backgroundImage: `url(${item.thumbnail})`,
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                  }}
                                >
                                  {item.type === 'video' && (
                                    <Box
                                      sx={{
                                        position: 'absolute',
                                        top: '50%',
                                        left: '50%',
                                        transform: 'translate(-50%, -50%)',
                                        bgcolor: 'rgba(0,0,0,0.5)',
                                        color: 'white',
                                        borderRadius: '50%',
                                        width: 30,
                                        height: 30,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                      }}
                                    >
                                      <PlayArrowIcon />
                                    </Box>
                                  )}
                                </Box>
                                <Box sx={{ p: 1 }}>
                                  <Typography 
                                    variant="body2" 
                                    noWrap 
                                    title={item.name}
                                  >
                                    {item.name}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {formatBytes(item.size)}
                                  </Typography>
                                </Box>
                              </Card>
                            </Grid>
                          ))
                        }
                      </Grid>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* メディアプレビュー */}
            <Grid item xs={12} md={8}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    メディアプレビュー
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  {!selectedItem ? (
                    <Box sx={{ 
                      height: 400, 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      bgcolor: 'background.default',
                      borderRadius: 1
                    }}>
                      <Typography variant="body1" color="text.secondary">
                        左側のリストからメディアを選択してください
                      </Typography>
                    </Box>
                  ) : (
                    <Box>
                      {/* 画像プレビュー */}
                      {selectedItem.type === 'image' && (
                        <Box sx={{ 
                          textAlign: 'center',
                          mb: 2
                        }}>
                          <Box
                            component="img"
                            src={selectedItem.url}
                            alt={selectedItem.name}
                            sx={{
                              maxWidth: '100%',
                              maxHeight: 400,
                              objectFit: 'contain',
                              borderRadius: 1,
                            }}
                          />
                        </Box>
                      )}

                      {/* 動画プレビュー */}
                      {selectedItem.type === 'video' && (
                        <Box sx={{ mb: 2 }}>
                          <Box sx={{ position: 'relative', mb: 2 }}>
                            <Box
                              component="video"
                              ref={videoRef}
                              src={selectedItem.url}
                              sx={{
                                width: '100%',
                                maxHeight: 400,
                                bgcolor: 'black',
                                borderRadius: 1,
                              }}
                              controls={false}
                              onPlay={() => setIsPlaying(true)}
                              onPause={() => setIsPlaying(false)}
                            />
                            
                            <Box
                              sx={{
                                position: 'absolute',
                                bottom: 16,
                                left: 16,
                                right: 16,
                                display: 'flex',
                                alignItems: 'center',
                                bgcolor: 'rgba(0,0,0,0.5)',
                                color: 'white',
                                p: 1,
                                borderRadius: 1,
                              }}
                            >
                              <IconButton
                                color="inherit"
                                onClick={handlePlayPause}
                              >
                                {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
                              </IconButton>
                              
                              <Box sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
                                <SpeedIcon fontSize="small" sx={{ mr: 1 }} />
                                <Slider
                                  value={playbackSpeed}
                                  onChange={handleSpeedChange}
                                  step={0.25}
                                  marks
                                  min={0.5}
                                  max={2}
                                  valueLabelDisplay="auto"
                                  valueLabelFormat={(value) => `${value}x`}
                                  sx={{ width: 100, color: 'white' }}
                                />
                              </Box>
                              
                              <Box sx={{ ml: 'auto' }}>
                                <FormControl variant="outlined" size="small" sx={{ minWidth: 80 }}>
                                  <Select
                                    value={quality}
                                    onChange={handleQualityChange}
                                    sx={{ 
                                      color: 'white', 
                                      '.MuiOutlinedInput-notchedOutline': { 
                                        borderColor: 'rgba(255,255,255,0.5)' 
                                      },
                                      '&:hover .MuiOutlinedInput-notchedOutline': { 
                                        borderColor: 'rgba(255,255,255,0.8)' 
                                      },
                                      '.MuiSvgIcon-root': { 
                                        color: 'white' 
                                      }
                                    }}
                                    inputProps={{
                                      sx: { p: '4px 8px', fontSize: '0.75rem' }
                                    }}
                                  >
                                    <MenuItem value="auto">自動</MenuItem>
                                    <MenuItem value="1080p">1080p</MenuItem>
                                    <MenuItem value="720p">720p</MenuItem>
                                    <MenuItem value="480p">480p</MenuItem>
                                    <MenuItem value="360p">360p</MenuItem>
                                  </Select>
                                </FormControl>
                              </Box>
                            </Box>
                          </Box>
                          
                          <FormControlLabel
                            control={
                              <Switch
                                checked={useAdaptiveStreaming}
                                onChange={(e) => setUseAdaptiveStreaming(e.target.checked)}
                                color="primary"
                              />
                            }
                            label="アダプティブストリーミングを使用"
                          />
                        </Box>
                      )}

                      {/* メディア情報 */}
                      <Box>
                        <Typography variant="h6" gutterBottom>
                          メディア情報
                        </Typography>
                        <Grid container spacing={2}>
                          <Grid item xs={12} sm={6}>
                            <Typography variant="subtitle2">ファイル名:</Typography>
                            <Typography variant="body2">{selectedItem.name}</Typography>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <Typography variant="subtitle2">サイズ:</Typography>
                            <Typography variant="body2">{formatBytes(selectedItem.size)}</Typography>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <Typography variant="subtitle2">形式:</Typography>
                            <Typography variant="body2">{selectedItem.metadata.format}</Typography>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <Typography variant="subtitle2">寸法:</Typography>
                            <Typography variant="body2">
                              {selectedItem.metadata.width} x {selectedItem.metadata.height}
                            </Typography>
                          </Grid>
                          {selectedItem.type === 'video' && selectedItem.metadata.duration && (
                            <Grid item xs={12} sm={6}>
                              <Typography variant="subtitle2">再生時間:</Typography>
                              <Typography variant="body2">
                                {formatDuration(selectedItem.metadata.duration)}
                              </Typography>
                            </Grid>
                          )}
                          <Grid item xs={12}>
                            <Typography variant="subtitle2">CID:</Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <TextField
                                fullWidth
                                value={selectedItem.cid}
                                size="small"
                                InputProps={{ readOnly: true }}
                              />
                              <IconButton
                                size="small"
                                onClick={() => handleCopyToClipboard(selectedItem.cid)}
                                sx={{ ml: 1 }}
                              >
                                <ContentCopyIcon fontSize="small" />
                              </IconButton>
                            </Box>
                          </Grid>
                        </Grid>
                        
                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                          <Button
                            variant="outlined"
                            color="primary"
                            startIcon={<DownloadIcon />}
                            component="a"
                            href={selectedItem.url}
                            download={selectedItem.name}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            ダウンロード
                          </Button>
                        </Box>
                      </Box>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Paper>
      </Container>
    </>
  );
};

export default MediaTest; 