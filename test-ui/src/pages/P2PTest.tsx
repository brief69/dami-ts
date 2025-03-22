import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  Box,
  Button,
  TextField,
  Grid,
  Card,
  CardContent,
  Divider,
  Chip,
  Toolbar,
  Alert,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemAvatar,
  Avatar,
  Switch,
  FormControlLabel,
  CircularProgress,
  LinearProgress,
} from '@mui/material';
import RouterIcon from '@mui/icons-material/Router';
import CloudIcon from '@mui/icons-material/Cloud';
import PersonIcon from '@mui/icons-material/Person';
import ShareIcon from '@mui/icons-material/Share';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import SendIcon from '@mui/icons-material/Send';
import DownloadIcon from '@mui/icons-material/Download';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

interface Peer {
  id: string;
  nickname: string;
  address: string;
  connected: boolean;
  latency: number;
}

interface Message {
  id: string;
  from: string;
  to: string;
  content: string;
  timestamp: string;
  status: 'sent' | 'received' | 'error';
}

interface SharedContent {
  cid: string;
  name: string;
  size: number;
  sharedBy: string;
  timestamp: string;
  status: 'available' | 'downloading' | 'complete' | 'error';
  progress?: number;
}

const P2PTest: React.FC = () => {
  const [nodeRunning, setNodeRunning] = useState(false);
  const [nodeStarting, setNodeStarting] = useState(false);
  const [peerId, setPeerId] = useState('');
  const [nickname, setNickname] = useState('DAMI Node');
  const [peers, setPeers] = useState<Peer[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [sharedContent, setSharedContent] = useState<SharedContent[]>([]);
  const [newPeerAddress, setNewPeerAddress] = useState('');
  const [newMessageContent, setNewMessageContent] = useState('');
  const [selectedPeer, setSelectedPeer] = useState<string | null>(null);
  const [alert, setAlert] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);
  const [autoAccept, setAutoAccept] = useState(true);

  // ノード起動シミュレーション
  const handleStartNode = () => {
    setNodeStarting(true);
    setAlert({
      type: 'info',
      message: 'P2Pノードを起動中...',
    });

    // ノード起動のシミュレーション
    setTimeout(() => {
      const generatedPeerId = `12D3KooW${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 10)}`;
      setPeerId(generatedPeerId);
      setNodeRunning(true);
      setNodeStarting(false);
      
      setAlert({
        type: 'success',
        message: 'P2Pノードが正常に起動しました！',
      });
      
      // ダミーのピア接続をシミュレート
      simulateRandomPeerConnections();
      
      setTimeout(() => setAlert(null), 3000);
    }, 2500);
  };

  // ノード停止
  const handleStopNode = () => {
    setNodeRunning(false);
    setPeerId('');
    setPeers([]);
    setMessages([]);
    setSharedContent([]);
    setSelectedPeer(null);
    
    setAlert({
      type: 'info',
      message: 'P2Pノードを停止しました。',
    });
    setTimeout(() => setAlert(null), 3000);
  };

  // ピア接続
  const handleConnectToPeer = () => {
    if (!newPeerAddress) {
      setAlert({
        type: 'error',
        message: 'ピアアドレスを入力してください。',
      });
      return;
    }

    // 接続中の表示
    setAlert({
      type: 'info',
      message: `${newPeerAddress} に接続中...`,
    });

    // 接続シミュレーション
    setTimeout(() => {
      const success = Math.random() > 0.2; // 80%の確率で成功
      
      if (success) {
        const newPeer: Peer = {
          id: `12D3KooW${Math.random().toString(36).substring(2, 10)}`,
          nickname: `Peer-${Math.floor(Math.random() * 1000)}`,
          address: newPeerAddress,
          connected: true,
          latency: Math.floor(Math.random() * 100) + 10,
        };
        
        setPeers([...peers, newPeer]);
        
        setAlert({
          type: 'success',
          message: `${newPeerAddress} に接続しました！`,
        });
      } else {
        setAlert({
          type: 'error',
          message: `${newPeerAddress} への接続に失敗しました。`,
        });
      }
      
      setNewPeerAddress('');
      setTimeout(() => setAlert(null), 3000);
    }, 1500);
  };

  // メッセージ送信
  const handleSendMessage = () => {
    if (!selectedPeer || !newMessageContent) {
      setAlert({
        type: 'error',
        message: 'メッセージとピアを選択してください。',
      });
      return;
    }

    const messageId = `msg_${Date.now()}`;
    const newMessage: Message = {
      id: messageId,
      from: peerId,
      to: selectedPeer,
      content: newMessageContent,
      timestamp: new Date().toISOString(),
      status: 'sent',
    };
    
    setMessages([...messages, newMessage]);
    setNewMessageContent('');
    
    // 応答シミュレーション
    setTimeout(() => {
      // 選択されたピア情報
      const peer = peers.find(p => p.id === selectedPeer);
      
      if (peer && Math.random() > 0.1) { // 90%の確率で応答
        const responseMessage: Message = {
          id: `msg_resp_${Date.now()}`,
          from: selectedPeer,
          to: peerId,
          content: `こんにちは！メッセージを受け取りました: "${newMessageContent.substring(0, 20)}${newMessageContent.length > 20 ? '...' : ''}"`,
          timestamp: new Date().toISOString(),
          status: 'received',
        };
        
        setMessages(prev => [...prev, responseMessage]);
      }
    }, 2000);
  };

  // コンテンツ共有シミュレーション
  const handleShareContent = () => {
    if (!selectedPeer) {
      setAlert({
        type: 'error',
        message: 'コンテンツを共有するピアを選択してください。',
      });
      return;
    }

    const contentCid = `Qm${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
    const selectedPeerInfo = peers.find(p => p.id === selectedPeer);
    
    const newContent: SharedContent = {
      cid: contentCid,
      name: `shared-content-${Math.floor(Math.random() * 100)}.dat`,
      size: Math.floor(Math.random() * 100000000) + 1000000, // 1MB - 100MB
      sharedBy: peerId,
      timestamp: new Date().toISOString(),
      status: 'available',
    };
    
    setSharedContent([...sharedContent, newContent]);
    
    setAlert({
      type: 'success',
      message: `コンテンツを ${selectedPeerInfo?.nickname || selectedPeer} と共有しました！`,
    });
    setTimeout(() => setAlert(null), 3000);
  };

  // コンテンツダウンロード
  const handleDownloadContent = (contentIndex: number) => {
    const content = sharedContent[contentIndex];
    
    if (!content) return;
    
    // ダウンロード中に更新
    const updatedContent = { ...content, status: 'downloading', progress: 0 };
    const updatedSharedContent = [...sharedContent];
    updatedSharedContent[contentIndex] = updatedContent;
    setSharedContent(updatedSharedContent);
    
    // ダウンロード進行状況のシミュレーション
    const downloadInterval = setInterval(() => {
      setSharedContent(prev => {
        const updated = [...prev];
        const current = updated[contentIndex];
        
        if (current && current.progress !== undefined) {
          const newProgress = Math.min(100, (current.progress + Math.random() * 10));
          
          if (newProgress >= 100) {
            clearInterval(downloadInterval);
            updated[contentIndex] = { ...current, status: 'complete', progress: 100 };
          } else {
            updated[contentIndex] = { ...current, progress: newProgress };
          }
        }
        
        return updated;
      });
    }, 500);
  };

  // ランダムピア接続シミュレーション
  const simulateRandomPeerConnections = () => {
    const numPeers = Math.floor(Math.random() * 3) + 2; // 2-4ピア
    const dummyPeers: Peer[] = [];
    
    for (let i = 0; i < numPeers; i++) {
      dummyPeers.push({
        id: `12D3KooW${Math.random().toString(36).substring(2, 10)}`,
        nickname: `Peer-${Math.floor(Math.random() * 1000)}`,
        address: `/ip4/192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}/tcp/4001`,
        connected: true,
        latency: Math.floor(Math.random() * 100) + 10,
      });
    }
    
    setPeers(dummyPeers);
  };

  // コピー
  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setAlert({
      type: 'success',
      message: 'クリップボードにコピーしました！',
    });
    setTimeout(() => setAlert(null), 3000);
  };

  // バイトサイズのフォーマット
  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  return (
    <>
      <Toolbar />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Paper sx={{ p: 3, mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <RouterIcon color="primary" sx={{ mr: 1 }} />
            <Typography variant="h5" component="h1">
              P2Pネットワークテスト
            </Typography>
          </Box>
          <Typography variant="body1" sx={{ mb: 3 }}>
            DAMIのP2Pネットワーク機能をテストします。ピア同士の接続、メッセージング、コンテンツ共有などが可能です。
          </Typography>

          {alert && (
            <Alert severity={alert.type} sx={{ mb: 3 }} onClose={() => setAlert(null)}>
              {alert.message}
            </Alert>
          )}

          <Grid container spacing={3}>
            {/* ノードコントロール */}
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    ノード制御
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  <Box sx={{ mb: 3 }}>
                    <TextField
                      fullWidth
                      label="ニックネーム"
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value)}
                      disabled={nodeRunning}
                      sx={{ mb: 2 }}
                    />
                    
                    {nodeRunning && (
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          ピアID:
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <TextField
                            fullWidth
                            value={peerId}
                            size="small"
                            InputProps={{ readOnly: true }}
                          />
                          <IconButton
                            size="small"
                            onClick={() => handleCopyToClipboard(peerId)}
                            sx={{ ml: 1 }}
                          >
                            <ContentCopyIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </Box>
                    )}
                    
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                      {!nodeRunning ? (
                        <Button
                          variant="contained"
                          color="primary"
                          startIcon={<PlayArrowIcon />}
                          onClick={handleStartNode}
                          disabled={nodeStarting}
                          fullWidth
                        >
                          {nodeStarting ? (
                            <>
                              <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
                              ノード起動中...
                            </>
                          ) : (
                            'ノードを起動'
                          )}
                        </Button>
                      ) : (
                        <Button
                          variant="outlined"
                          color="error"
                          startIcon={<StopIcon />}
                          onClick={handleStopNode}
                          fullWidth
                        >
                          ノードを停止
                        </Button>
                      )}
                    </Box>
                  </Box>

                  {nodeRunning && (
                    <>
                      <Typography variant="subtitle1" gutterBottom sx={{ mt: 3 }}>
                        ピア接続
                      </Typography>
                      <Box sx={{ display: 'flex', mb: 2 }}>
                        <TextField
                          fullWidth
                          label="ピアアドレス"
                          placeholder="/ip4/192.168.1.1/tcp/4001/p2p/..."
                          value={newPeerAddress}
                          onChange={(e) => setNewPeerAddress(e.target.value)}
                          size="small"
                          sx={{ mr: 1 }}
                        />
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={handleConnectToPeer}
                          disabled={!newPeerAddress}
                        >
                          接続
                        </Button>
                      </Box>
                      
                      <FormControlLabel
                        control={
                          <Switch
                            checked={autoAccept}
                            onChange={(e) => setAutoAccept(e.target.checked)}
                            color="primary"
                          />
                        }
                        label="接続要求を自動承認"
                      />
                    </>
                  )}
                </CardContent>
              </Card>
              
              {/* P2Pの説明 */}
              <Paper sx={{ p: 2, bgcolor: 'background.default', mt: 2 }}>
                <Typography variant="h6" gutterBottom>
                  P2Pネットワークとは？
                </Typography>
                <Typography variant="body2">
                  DAMIプロトコルは分散型P2Pネットワークを利用してデータを共有します。
                  中央サーバーに依存せず、ピア同士が直接通信することで、耐障害性が高く、
                  検閲耐性のあるシステムを実現します。
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    P2Pの利点:
                  </Typography>
                  <ul>
                    <li>中央サーバーが不要</li>
                    <li>耐障害性と可用性の向上</li>
                    <li>帯域幅の効率的な利用</li>
                    <li>ネットワーク全体でのデータ冗長性</li>
                  </ul>
                </Box>
              </Paper>
            </Grid>

            {/* 接続済みピア */}
            <Grid item xs={12} md={8}>
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    接続済みピア
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  {!nodeRunning ? (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <Typography variant="body1" color="text.secondary">
                        ノードを起動してP2Pネットワークに参加してください。
                      </Typography>
                    </Box>
                  ) : peers.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <Typography variant="body1" color="text.secondary">
                        接続中のピアがありません。
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        ピアアドレスを入力して接続するか、他のピアからの接続を待ちます。
                      </Typography>
                    </Box>
                  ) : (
                    <List>
                      {peers.map((peer) => (
                        <ListItem
                          key={peer.id}
                          selected={selectedPeer === peer.id}
                          onClick={() => setSelectedPeer(peer.id)}
                          sx={{ 
                            cursor: 'pointer',
                            '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.04)' },
                            borderRadius: 1,
                            mb: 1
                          }}
                        >
                          <ListItemAvatar>
                            <Avatar sx={{ bgcolor: peer.connected ? 'success.main' : 'error.main' }}>
                              <PersonIcon />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Typography variant="body1">{peer.nickname}</Typography>
                                <Chip
                                  size="small"
                                  label={`${peer.latency}ms`}
                                  color={
                                    peer.latency < 50 ? 'success' :
                                    peer.latency < 100 ? 'warning' : 'error'
                                  }
                                  sx={{ ml: 1 }}
                                />
                              </Box>
                            }
                            secondary={
                              <Typography 
                                variant="body2" 
                                sx={{ 
                                  fontFamily: 'monospace',
                                  fontSize: '0.75rem',
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis'
                                }}
                              >
                                {peer.id}
                              </Typography>
                            }
                          />
                        </ListItem>
                      ))}
                    </List>
                  )}
                </CardContent>
              </Card>

              {/* P2P機能テスト */}
              {nodeRunning && peers.length > 0 && (
                <Grid container spacing={2}>
                  {/* メッセージング */}
                  <Grid item xs={12} md={6}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          メッセージング
                        </Typography>
                        <Divider sx={{ mb: 2 }} />

                        {!selectedPeer ? (
                          <Box sx={{ textAlign: 'center', py: 2 }}>
                            <Typography variant="body2" color="text.secondary">
                              左側のリストからピアを選択してください。
                            </Typography>
                          </Box>
                        ) : (
                          <Box>
                            <Box sx={{ mb: 2 }}>
                              <TextField
                                fullWidth
                                label="メッセージ"
                                placeholder="メッセージを入力..."
                                value={newMessageContent}
                                onChange={(e) => setNewMessageContent(e.target.value)}
                                multiline
                                rows={2}
                                sx={{ mb: 1 }}
                              />
                              <Button
                                variant="contained"
                                color="primary"
                                endIcon={<SendIcon />}
                                onClick={handleSendMessage}
                                disabled={!newMessageContent}
                                fullWidth
                              >
                                送信
                              </Button>
                            </Box>

                            <Typography variant="subtitle2" gutterBottom>
                              メッセージ履歴:
                            </Typography>
                            <Box 
                              sx={{ 
                                maxHeight: 200, 
                                overflowY: 'auto',
                                bgcolor: 'background.default',
                                p: 1,
                                borderRadius: 1
                              }}
                            >
                              {messages.filter(m => 
                                (m.from === selectedPeer && m.to === peerId) || 
                                (m.from === peerId && m.to === selectedPeer)
                              ).length === 0 ? (
                                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                                  メッセージはまだありません。
                                </Typography>
                              ) : (
                                messages
                                  .filter(m => 
                                    (m.from === selectedPeer && m.to === peerId) || 
                                    (m.from === peerId && m.to === selectedPeer)
                                  )
                                  .map((message) => (
                                    <Box 
                                      key={message.id}
                                      sx={{ 
                                        mb: 1,
                                        p: 1,
                                        bgcolor: message.from === peerId ? 'primary.light' : 'grey.100',
                                        color: message.from === peerId ? 'white' : 'text.primary',
                                        borderRadius: 1,
                                        maxWidth: '80%',
                                        ml: message.from === peerId ? 'auto' : 0,
                                      }}
                                    >
                                      <Typography variant="body2">
                                        {message.content}
                                      </Typography>
                                      <Typography 
                                        variant="caption" 
                                        sx={{ 
                                          display: 'block', 
                                          textAlign: 'right',
                                          opacity: 0.7
                                        }}
                                      >
                                        {new Date(message.timestamp).toLocaleTimeString()}
                                      </Typography>
                                    </Box>
                                  ))
                              )}
                            </Box>
                          </Box>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* コンテンツ共有 */}
                  <Grid item xs={12} md={6}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          コンテンツ共有
                        </Typography>
                        <Divider sx={{ mb: 2 }} />

                        {!selectedPeer ? (
                          <Box sx={{ textAlign: 'center', py: 2 }}>
                            <Typography variant="body2" color="text.secondary">
                              左側のリストからピアを選択してください。
                            </Typography>
                          </Box>
                        ) : (
                          <Box>
                            <Button
                              variant="contained"
                              color="primary"
                              startIcon={<ShareIcon />}
                              onClick={handleShareContent}
                              fullWidth
                              sx={{ mb: 2 }}
                            >
                              コンテンツを共有
                            </Button>

                            <Typography variant="subtitle2" gutterBottom>
                              共有コンテンツ:
                            </Typography>
                            <Box 
                              sx={{ 
                                maxHeight: 200, 
                                overflowY: 'auto',
                                bgcolor: 'background.default',
                                p: 1,
                                borderRadius: 1
                              }}
                            >
                              {sharedContent.length === 0 ? (
                                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                                  共有されたコンテンツはありません。
                                </Typography>
                              ) : (
                                <List dense>
                                  {sharedContent.map((content, index) => (
                                    <ListItem
                                      key={content.cid}
                                      secondaryAction={
                                        content.status === 'available' ? (
                                          <IconButton 
                                            edge="end" 
                                            onClick={() => handleDownloadContent(index)}
                                            color="primary"
                                          >
                                            <DownloadIcon />
                                          </IconButton>
                                        ) : content.status === 'complete' ? (
                                          <CheckCircleIcon color="success" />
                                        ) : content.status === 'error' ? (
                                          <ErrorIcon color="error" />
                                        ) : null
                                      }
                                    >
                                      <ListItemIcon>
                                        <CloudIcon color="primary" />
                                      </ListItemIcon>
                                      <ListItemText
                                        primary={content.name}
                                        secondary={formatBytes(content.size)}
                                      />
                                    </ListItem>
                                    
                                    {content.status === 'downloading' && content.progress !== undefined && (
                                      <Box sx={{ px: 2, pb: 1 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                          <Box sx={{ width: '100%', mr: 1 }}>
                                            <LinearProgress 
                                              variant="determinate" 
                                              value={content.progress} 
                                            />
                                          </Box>
                                          <Box minWidth={35}>
                                            <Typography variant="body2" color="text.secondary">
                                              {`${Math.round(content.progress)}%`}
                                            </Typography>
                                          </Box>
                                        </Box>
                                      </Box>
                                    )}
                                  </List>
                                </List>
                              )}
                            </Box>
                          </Box>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              )}
            </Grid>
          </Grid>
        </Paper>
      </Container>
    </>
  );
};

export default P2PTest; 