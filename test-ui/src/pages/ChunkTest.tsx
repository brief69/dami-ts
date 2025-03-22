import React, { useState } from 'react';
import {
  Container,
  Typography,
  Paper,
  Box,
  Button,
  TextField,
  Grid,
  Stepper,
  Step,
  StepLabel,
  Alert,
  Toolbar,
  Card,
  CardContent,
  Divider,
  Chip,
  IconButton,
} from '@mui/material';
import StorageIcon from '@mui/icons-material/Storage';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteIcon from '@mui/icons-material/Delete';

interface ChunkInfo {
  cid: string;
  type: string;
  size: number;
  timestamp: string;
}

// プログレスバーコンポーネント
const LinearProgressWithLabel: React.FC<{ value: number }> = ({ value }) => {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
      <Box sx={{ width: '100%', mr: 1 }}>
        <Box
          sx={{
            height: 10,
            borderRadius: 5,
            position: 'relative',
            bgcolor: 'rgba(0, 0, 0, 0.1)',
          }}
        >
          <Box
            sx={{
              height: '100%',
              borderRadius: 5,
              position: 'absolute',
              width: `${value}%`,
              bgcolor: 'primary.main',
              transition: 'width 0.3s ease-in-out',
            }}
          />
        </Box>
      </Box>
    </Box>
  );
};

const ChunkTest: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  const [chunks, setChunks] = useState<ChunkInfo[]>([]);
  const [metadataCid, setMetadataCid] = useState<string>('');
  const [alert, setAlert] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  // ダミーのチャンク作成処理（実際にはバックエンドAPIを呼び出す）
  const handleProcessFile = async () => {
    if (!fileToUpload) return;
    
    setUploading(true);
    setAlert(null);
    
    // プログレスバーのシミュレーション
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 5;
      });
    }, 200);
    
    try {
      // ファイルの処理が完了するまで待機（実際はAPIコール）
      await new Promise((resolve) => setTimeout(resolve, 4000));
      
      // ダミーのチャンクデータを生成
      const numChunks = Math.floor(Math.random() * 5) + 3;
      const newChunks: ChunkInfo[] = [];
      
      for (let i = 0; i < numChunks; i++) {
        const fileType = fileToUpload.type.includes('image') 
          ? 'IMAGE' 
          : fileToUpload.type.includes('video')
            ? 'VIDEO'
            : fileToUpload.type.includes('json') 
              ? 'JSON' 
              : 'OTHER';
              
        const chunkSize = Math.floor((fileToUpload.size / numChunks) * (0.8 + Math.random() * 0.4));
        
        newChunks.push({
          cid: `Qm${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`,
          type: fileType,
          size: chunkSize,
          timestamp: new Date().toISOString(),
        });
      }
      
      setChunks(newChunks);
      
      const dummyMetadataCid = `Qm${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
      setMetadataCid(dummyMetadataCid);
      
      setAlert({
        type: 'success',
        message: 'ファイルの分割が完了しました！',
      });
      
      setActiveStep(1);
    } catch (error) {
      setAlert({
        type: 'error',
        message: 'ファイルの処理中にエラーが発生しました。',
      });
    } finally {
      clearInterval(interval);
      setUploading(false);
      setUploadProgress(100);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFileToUpload(event.target.files[0]);
      setAlert({
        type: 'info',
        message: `${event.target.files[0].name} が選択されました。処理ボタンをクリックしてください。`,
      });
    }
  };

  const handleReset = () => {
    setFileToUpload(null);
    setChunks([]);
    setMetadataCid('');
    setActiveStep(0);
    setUploadProgress(0);
    setAlert(null);
  };
  
  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setAlert({
      type: 'success',
      message: 'クリップボードにコピーしました！',
    });
    setTimeout(() => setAlert(null), 3000);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const steps = ['ファイル選択と分割', 'チャンク管理と確認'];

  return (
    <>
      <Toolbar />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Paper sx={{ p: 3, mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <StorageIcon color="primary" sx={{ mr: 1 }} />
            <Typography variant="h5" component="h1">
              チャンク管理テスト
            </Typography>
          </Box>
          <Typography variant="body1" sx={{ mb: 3 }}>
            データファイルをアップロードして、DAMIプロトコルによる分割処理と管理をテストします。
          </Typography>
          
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
          
          {alert && (
            <Alert 
              severity={alert.type} 
              sx={{ mb: 3 }}
              onClose={() => setAlert(null)}
            >
              {alert.message}
            </Alert>
          )}
          
          {activeStep === 0 ? (
            <Box>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    disabled
                    label="選択されたファイル"
                    value={fileToUpload ? fileToUpload.name : ''}
                    sx={{ mb: 2 }}
                  />
                  
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                      variant="outlined"
                      component="label"
                      startIcon={<UploadFileIcon />}
                    >
                      ファイルを選択
                      <input
                        type="file"
                        hidden
                        onChange={handleFileChange}
                      />
                    </Button>
                    
                    <Button
                      variant="contained"
                      onClick={handleProcessFile}
                      disabled={!fileToUpload || uploading}
                    >
                      {uploading ? '処理中...' : 'ファイルを処理'}
                    </Button>
                  </Box>
                  
                  {uploading && (
                    <Box sx={{ width: '100%', mt: 4 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box sx={{ width: '100%', mr: 1 }}>
                          <LinearProgressWithLabel value={uploadProgress} />
                        </Box>
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {uploadProgress}%
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  )}
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
                    <Typography variant="h6" gutterBottom>
                      チャンク分割とは？
                    </Typography>
                    <Typography variant="body2">
                      DAMIプロトコルでは、大きなファイルを小さな「チャンク」に分割して効率的に管理します。
                      分割されたチャンクは個別のCID（Content Identifier）を持ち、適切に保存・管理されます。
                    </Typography>
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        チャンク分割の利点:
                      </Typography>
                      <ul>
                        <li>効率的なデータの重複排除</li>
                        <li>部分的なデータアクセスが可能</li>
                        <li>並列処理による高速なアップロード/ダウンロード</li>
                        <li>コンテンツの効率的な共有と流通</li>
                      </ul>
                    </Box>
                  </Paper>
                </Grid>
              </Grid>
            </Box>
          ) : (
            <Box>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    メタデータCID
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <TextField
                      fullWidth
                      value={metadataCid}
                      InputProps={{
                        readOnly: true,
                      }}
                    />
                    <IconButton 
                      onClick={() => handleCopyToClipboard(metadataCid)}
                      sx={{ ml: 1 }}
                    >
                      <ContentCopyIcon />
                    </IconButton>
                  </Box>
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    生成されたチャンク
                  </Typography>
                  <Box sx={{ overflowX: 'auto' }}>
                    <Grid container spacing={2}>
                      {chunks.map((chunk, index) => (
                        <Grid item xs={12} sm={6} md={4} key={index}>
                          <Card>
                            <CardContent>
                              <Box sx={{ mb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography color="text.secondary" gutterBottom>
                                  チャンク #{index + 1}
                                </Typography>
                                <Chip 
                                  label={chunk.type} 
                                  size="small"
                                  color={
                                    chunk.type === 'IMAGE' ? 'info' :
                                    chunk.type === 'VIDEO' ? 'error' :
                                    chunk.type === 'JSON' ? 'success' : 'default'
                                  }
                                />
                              </Box>
                              <Divider sx={{ mb: 2 }} />
                              <Box sx={{ mb: 1 }}>
                                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>CID:</Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  <Typography 
                                    variant="body2" 
                                    sx={{ 
                                      fontFamily: 'monospace',
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis'
                                    }}
                                  >
                                    {chunk.cid}
                                  </Typography>
                                  <IconButton 
                                    size="small"
                                    onClick={() => handleCopyToClipboard(chunk.cid)}
                                  >
                                    <ContentCopyIcon fontSize="small" />
                                  </IconButton>
                                </Box>
                              </Box>
                              <Typography variant="body2">
                                サイズ: {formatFileSize(chunk.size)}
                              </Typography>
                              <Typography variant="body2">
                                作成日時: {new Date(chunk.timestamp).toLocaleString()}
                              </Typography>
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                </Grid>
              </Grid>
              
              <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
                <Button 
                  variant="outlined" 
                  onClick={handleReset}
                  startIcon={<DeleteIcon />}
                >
                  リセット
                </Button>
              </Box>
            </Box>
          )}
        </Paper>
      </Container>
    </>
  );
};

export default ChunkTest; 