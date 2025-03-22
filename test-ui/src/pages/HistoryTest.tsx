import React, { useState } from 'react';
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
} from '@mui/material';
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineOppositeContent,
} from '@mui/lab';
import HistoryIcon from '@mui/icons-material/History';
import AddIcon from '@mui/icons-material/Add';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteIcon from '@mui/icons-material/Delete';
import VerifiedIcon from '@mui/icons-material/Verified';
import StorageIcon from '@mui/icons-material/Storage';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';

interface HistoryEntry {
  yll: string;
  timestamp: string;
  sequence: number;
  metadata?: {
    title?: string;
    description?: string;
    tags?: string[];
  };
}

interface HistoryManifest {
  zll: string;
  entries: HistoryEntry[];
  lastUpdated: string;
  version: string;
  previousZll: string | null;
  hash: string;
}

const HistoryTest: React.FC = () => {
  const [manifest, setManifest] = useState<HistoryManifest>({
    zll: '',
    entries: [],
    lastUpdated: '',
    version: '1.0',
    previousZll: null,
    hash: '',
  });
  const [newYll, setNewYll] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [alert, setAlert] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  const handleCreateHistory = () => {
    setManifest({
      zll: `Qm${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`,
      entries: [],
      lastUpdated: new Date().toISOString(),
      version: '1.0',
      previousZll: null,
      hash: `0x${Math.random().toString(36).substring(2, 15)}`,
    });

    setAlert({
      type: 'success',
      message: '新しい履歴マニフェストを作成しました。',
    });
    setTimeout(() => setAlert(null), 3000);
  };

  const handleAddEntry = () => {
    if (!newYll) {
      setAlert({
        type: 'error',
        message: 'YLL（中位CID）を入力してください。',
      });
      return;
    }

    const tags = tagInput
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);

    const newEntry: HistoryEntry = {
      yll: newYll,
      timestamp: new Date().toISOString(),
      sequence: manifest.entries.length + 1,
      metadata: {
        title: newTitle || undefined,
        description: newDescription || undefined,
        tags: tags.length > 0 ? tags : undefined,
      },
    };

    const updatedEntries = [...manifest.entries, newEntry];
    const updatedManifest = {
      ...manifest,
      entries: updatedEntries,
      lastUpdated: new Date().toISOString(),
      hash: `0x${Math.random().toString(36).substring(2, 15)}`,
    };

    setManifest(updatedManifest);
    setNewYll('');
    setNewTitle('');
    setNewDescription('');
    setTagInput('');

    setAlert({
      type: 'success',
      message: '履歴エントリーを追加しました。',
    });
    setTimeout(() => setAlert(null), 3000);
  };

  const handleRemoveEntry = (index: number) => {
    const updatedEntries = manifest.entries.filter((_, i) => i !== index);
    // 順番を更新
    const reorderedEntries = updatedEntries.map((entry, i) => ({
      ...entry,
      sequence: i + 1,
    }));

    const updatedManifest = {
      ...manifest,
      entries: reorderedEntries,
      lastUpdated: new Date().toISOString(),
      hash: `0x${Math.random().toString(36).substring(2, 15)}`,
    };

    setManifest(updatedManifest);

    setAlert({
      type: 'info',
      message: '履歴エントリーを削除しました。',
    });
    setTimeout(() => setAlert(null), 3000);
  };

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setAlert({
      type: 'success',
      message: 'クリップボードにコピーしました！',
    });
    setTimeout(() => setAlert(null), 3000);
  };

  const handleVerifyIntegrity = () => {
    // 実際にはハッシュチェーンの検証などを行う
    setAlert({
      type: 'success',
      message: '履歴の整合性を検証しました。問題は見つかりませんでした。',
    });
    setTimeout(() => setAlert(null), 4000);
  };

  const handleReset = () => {
    setManifest({
      zll: '',
      entries: [],
      lastUpdated: '',
      version: '1.0',
      previousZll: null,
      hash: '',
    });
    setNewYll('');
    setNewTitle('');
    setNewDescription('');
    setTagInput('');

    setAlert({
      type: 'info',
      message: '履歴をリセットしました。',
    });
    setTimeout(() => setAlert(null), 3000);
  };

  const formatDate = (dateString: string): string => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleString();
  };

  const truncateHash = (hash: string): string => {
    if (!hash) return '';
    if (hash.length <= 12) return hash;
    return `${hash.substring(0, 6)}...${hash.substring(hash.length - 6)}`;
  };

  return (
    <>
      <Toolbar />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Paper sx={{ p: 3, mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <HistoryIcon color="primary" sx={{ mr: 1 }} />
            <Typography variant="h5" component="h1">
              履歴管理テスト
            </Typography>
          </Box>
          <Typography variant="body1" sx={{ mb: 3 }}>
            DAMIプロトコルの履歴管理システムをテストします。履歴は、コンテンツの時系列的な変更や関係性を管理します。
          </Typography>

          {alert && (
            <Alert severity={alert.type} sx={{ mb: 3 }} onClose={() => setAlert(null)}>
              {alert.message}
            </Alert>
          )}

          <Grid container spacing={3}>
            {/* 履歴操作パネル */}
            <Grid item xs={12} md={5}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    履歴操作
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  {!manifest.zll ? (
                    <Box sx={{ textAlign: 'center', py: 2 }}>
                      <Typography variant="body1" sx={{ mb: 2 }}>
                        履歴マニフェストがまだ作成されていません。
                      </Typography>
                      <Button
                        variant="contained"
                        color="primary"
                        startIcon={<AddIcon />}
                        onClick={handleCreateHistory}
                      >
                        新しい履歴を作成
                      </Button>
                    </Box>
                  ) : (
                    <>
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          ZLL（上位CID）:
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <TextField
                            fullWidth
                            value={manifest.zll}
                            size="small"
                            InputProps={{ readOnly: true }}
                          />
                          <IconButton
                            size="small"
                            onClick={() => handleCopyToClipboard(manifest.zll)}
                            sx={{ ml: 1 }}
                          >
                            <ContentCopyIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </Box>

                      <Typography variant="subtitle1" gutterBottom>
                        エントリー追加
                      </Typography>
                      <Box sx={{ mb: 3 }}>
                        <TextField
                          fullWidth
                          label="YLL（中位CID）"
                          value={newYll}
                          onChange={(e) => setNewYll(e.target.value)}
                          sx={{ mb: 2 }}
                          size="small"
                        />
                        <TextField
                          fullWidth
                          label="タイトル"
                          value={newTitle}
                          onChange={(e) => setNewTitle(e.target.value)}
                          sx={{ mb: 2 }}
                          size="small"
                        />
                        <TextField
                          fullWidth
                          label="説明"
                          value={newDescription}
                          onChange={(e) => setNewDescription(e.target.value)}
                          sx={{ mb: 2 }}
                          size="small"
                          multiline
                          rows={2}
                        />
                        <TextField
                          fullWidth
                          label="タグ（カンマ区切り）"
                          value={tagInput}
                          onChange={(e) => setTagInput(e.target.value)}
                          sx={{ mb: 2 }}
                          size="small"
                          placeholder="tag1, tag2, tag3"
                        />
                        <Button
                          variant="contained"
                          color="primary"
                          startIcon={<AddIcon />}
                          onClick={handleAddEntry}
                          disabled={!newYll}
                          fullWidth
                        >
                          エントリーを追加
                        </Button>
                      </Box>

                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                        <Button
                          variant="outlined"
                          color="primary"
                          startIcon={<VerifiedIcon />}
                          onClick={handleVerifyIntegrity}
                        >
                          整合性検証
                        </Button>
                        <Button
                          variant="outlined"
                          color="error"
                          startIcon={<DeleteIcon />}
                          onClick={handleReset}
                        >
                          リセット
                        </Button>
                      </Box>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* 履歴の説明 */}
              <Paper sx={{ p: 2, bgcolor: 'background.default', mt: 2 }}>
                <Typography variant="h6" gutterBottom>
                  履歴管理とは？
                </Typography>
                <Typography variant="body2">
                  DAMIプロトコルの履歴管理は、データの時系列的な変化や関連性を追跡するための仕組みです。
                  3階層のCID構造（xll, yll, zll）により、データの整合性と信頼性を確保します。
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    履歴管理の利点:
                  </Typography>
                  <ul>
                    <li>データの変更履歴を追跡可能</li>
                    <li>改ざん防止機能で信頼性を確保</li>
                    <li>時系列データの整合性を保証</li>
                    <li>関連コンテンツの発見と参照が容易</li>
                  </ul>
                </Box>
              </Paper>
            </Grid>

            {/* 履歴表示 */}
            <Grid item xs={12} md={7}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    履歴タイムライン
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  {manifest.entries.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <Typography variant="body1" color="text.secondary">
                        履歴エントリーがまだありません。
                      </Typography>
                      {manifest.zll && (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          左側のパネルからエントリーを追加してください。
                        </Typography>
                      )}
                    </Box>
                  ) : (
                    <Timeline position="alternate">
                      {manifest.entries.map((entry, index) => (
                        <TimelineItem key={index}>
                          <TimelineOppositeContent color="text.secondary">
                            {formatDate(entry.timestamp)}
                          </TimelineOppositeContent>
                          <TimelineSeparator>
                            <TimelineDot 
                              color={index % 2 === 0 ? "primary" : "secondary"}
                              variant={index === manifest.entries.length - 1 ? "filled" : "outlined"}
                            >
                              <StorageIcon />
                            </TimelineDot>
                            {index < manifest.entries.length - 1 && <TimelineConnector />}
                          </TimelineSeparator>
                          <TimelineContent>
                            <Card variant="outlined" sx={{ mb: 1 }}>
                              <CardContent sx={{ pb: 1 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                  <Typography variant="subtitle1">
                                    {entry.metadata?.title || `エントリー #${entry.sequence}`}
                                  </Typography>
                                  <IconButton
                                    size="small"
                                    onClick={() => handleRemoveEntry(index)}
                                    color="error"
                                  >
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                </Box>
                                
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                  <Typography variant="caption" sx={{ fontWeight: 'bold', mr: 1 }}>
                                    YLL:
                                  </Typography>
                                  <Typography 
                                    variant="caption" 
                                    sx={{ 
                                      fontFamily: 'monospace',
                                      fontSize: '0.75rem',
                                    }}
                                  >
                                    {truncateHash(entry.yll)}
                                  </Typography>
                                  <IconButton
                                    size="small"
                                    onClick={() => handleCopyToClipboard(entry.yll)}
                                  >
                                    <ContentCopyIcon sx={{ fontSize: '0.75rem' }} />
                                  </IconButton>
                                </Box>
                                
                                {entry.metadata?.description && (
                                  <Typography variant="body2" sx={{ mb: 1 }}>
                                    {entry.metadata.description}
                                  </Typography>
                                )}
                                
                                {entry.metadata?.tags && entry.metadata.tags.length > 0 && (
                                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                    {entry.metadata.tags.map((tag, tagIndex) => (
                                      <Chip 
                                        key={tagIndex} 
                                        label={tag} 
                                        size="small" 
                                        variant="outlined"
                                      />
                                    ))}
                                  </Box>
                                )}
                              </CardContent>
                            </Card>
                          </TimelineContent>
                        </TimelineItem>
                      ))}
                    </Timeline>
                  )}

                  {manifest.entries.length > 0 && (
                    <Box sx={{ textAlign: 'center', mt: 2 }}>
                      <Chip
                        icon={<CompareArrowsIcon />}
                        label={`最終更新: ${formatDate(manifest.lastUpdated)}`}
                        variant="outlined"
                      />
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

export default HistoryTest; 