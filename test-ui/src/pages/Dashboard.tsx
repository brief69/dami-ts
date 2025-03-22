import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Grid, 
  Paper, 
  Box, 
  Card, 
  CardContent,
  CardActions,
  Button,
  Toolbar
} from '@mui/material';
import { Link } from 'react-router-dom';
import StorageIcon from '@mui/icons-material/Storage';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import HistoryIcon from '@mui/icons-material/History';
import RouterIcon from '@mui/icons-material/Router';
import VideocamIcon from '@mui/icons-material/Videocam';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

const Dashboard: React.FC = () => {
  const [ipfsStatus, setIpfsStatus] = useState<'connected' | 'disconnected'>('disconnected');
  const [p2pStatus, setP2pStatus] = useState<'connected' | 'disconnected'>('disconnected');

  useEffect(() => {
    // ダミーデータ - 実際にはバックエンドからステータスを取得
    const checkStatus = () => {
      setTimeout(() => {
        setIpfsStatus('connected');
        setP2pStatus('connected');
      }, 1500);
    };

    checkStatus();
  }, []);

  const storageData = {
    labels: ['JSON', 'Image', 'Video', 'Other'],
    datasets: [
      {
        label: 'ストレージ使用量',
        data: [30, 25, 40, 5],
        backgroundColor: [
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(255, 99, 132, 0.6)',
          'rgba(75, 192, 192, 0.6)',
        ],
        borderColor: [
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(255, 99, 132, 1)',
          'rgba(75, 192, 192, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const testModules = [
    { 
      title: 'チャンクテスト', 
      icon: <StorageIcon fontSize="large" color="primary" />, 
      description: 'データチャンクの分割・結合と管理をテスト',
      link: '/chunk-test' 
    },
    { 
      title: 'レシピテスト', 
      icon: <MenuBookIcon fontSize="large" color="primary" />, 
      description: 'チャンク配列によるデータ再構築をテスト',
      link: '/recipe-test' 
    },
    { 
      title: '履歴テスト', 
      icon: <HistoryIcon fontSize="large" color="primary" />, 
      description: 'データ履歴の管理と操作をテスト',
      link: '/history-test' 
    },
    { 
      title: 'P2Pテスト', 
      icon: <RouterIcon fontSize="large" color="primary" />, 
      description: 'ピア同士の通信とデータ共有をテスト',
      link: '/p2p-test' 
    },
    { 
      title: 'メディアテスト', 
      icon: <VideocamIcon fontSize="large" color="primary" />, 
      description: '画像・動画の処理とストリーミングをテスト',
      link: '/media-test' 
    },
  ];

  return (
    <>
      <Toolbar />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          DAMI プロトコル機能テストUI
        </Typography>
        <Typography variant="subtitle1" gutterBottom>
          代替次元システムのコア機能を視覚的にテストするためのインターフェース
        </Typography>

        <Grid container spacing={3} sx={{ mt: 2 }}>
          {/* ステータス表示 */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 240 }}>
              <Typography component="h2" variant="h6" color="primary" gutterBottom>
                システムステータス
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                <Box>
                  <Typography variant="body1">IPFS接続:</Typography>
                  <Box 
                    sx={{ 
                      display: 'flex',
                      alignItems: 'center',
                      mt: 1
                    }}
                  >
                    <Box 
                      sx={{ 
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        bgcolor: ipfsStatus === 'connected' ? 'success.main' : 'error.main',
                        mr: 1
                      }}
                    />
                    <Typography>
                      {ipfsStatus === 'connected' ? '接続済み' : '未接続'}
                    </Typography>
                  </Box>
                </Box>
                <Box>
                  <Typography variant="body1">P2Pネットワーク:</Typography>
                  <Box 
                    sx={{ 
                      display: 'flex',
                      alignItems: 'center',
                      mt: 1
                    }}
                  >
                    <Box 
                      sx={{ 
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        bgcolor: p2pStatus === 'connected' ? 'success.main' : 'error.main',
                        mr: 1
                      }}
                    />
                    <Typography>
                      {p2pStatus === 'connected' ? '接続済み' : '未接続'}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Paper>
          </Grid>

          {/* ストレージ使用状況 */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 240 }}>
              <Typography component="h2" variant="h6" color="primary" gutterBottom>
                ストレージ使用状況
              </Typography>
              <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                <Box sx={{ width: '60%', height: '100%' }}>
                  <Doughnut data={storageData} options={{ maintainAspectRatio: false }} />
                </Box>
              </Box>
            </Paper>
          </Grid>

          {/* テストモジュール */}
          <Grid item xs={12}>
            <Typography component="h2" variant="h6" color="primary" gutterBottom sx={{ mt: 2 }}>
              機能テストモジュール
            </Typography>
            <Grid container spacing={2}>
              {testModules.map((module, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                        {module.icon}
                      </Box>
                      <Typography variant="h6" component="div" sx={{ textAlign: 'center' }}>
                        {module.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        {module.description}
                      </Typography>
                    </CardContent>
                    <CardActions>
                      <Button 
                        component={Link} 
                        to={module.link} 
                        fullWidth 
                        variant="contained"
                        color="primary"
                      >
                        テストを開始
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>
      </Container>
    </>
  );
};

export default Dashboard; 