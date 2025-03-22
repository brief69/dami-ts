import React, { useState } from 'react';
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
} from '@mui/material';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import AddIcon from '@mui/icons-material/Add';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteIcon from '@mui/icons-material/Delete';

interface ChunkRef {
  cid: string;
  order: number;
  type: string;
}

interface Recipe {
  id: string;
  name: string;
  description: string;
  chunks: ChunkRef[];
  timestamp: string;
}

const RecipeTest: React.FC = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [currentRecipe, setCurrentRecipe] = useState<Recipe>({
    id: '',
    name: '',
    description: '',
    chunks: [],
    timestamp: '',
  });
  const [newChunkCid, setNewChunkCid] = useState('');
  const [newChunkType, setNewChunkType] = useState('IMAGE');
  const [alert, setAlert] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  const handleNewRecipe = () => {
    setCurrentRecipe({
      id: `recipe_${Date.now()}`,
      name: '',
      description: '',
      chunks: [],
      timestamp: new Date().toISOString(),
    });
    setAlert({
      type: 'info',
      message: '新しいレシピを作成中です。必要な情報を入力してください。',
    });
  };

  const handleAddChunk = () => {
    if (!newChunkCid) {
      setAlert({
        type: 'error',
        message: 'チャンクCIDを入力してください。',
      });
      return;
    }

    const updatedChunks = [
      ...currentRecipe.chunks,
      {
        cid: newChunkCid,
        order: currentRecipe.chunks.length,
        type: newChunkType,
      },
    ];

    setCurrentRecipe({
      ...currentRecipe,
      chunks: updatedChunks,
    });

    setNewChunkCid('');
    setAlert({
      type: 'success',
      message: 'チャンクをレシピに追加しました。',
    });

    setTimeout(() => setAlert(null), 3000);
  };

  const handleRemoveChunk = (index: number) => {
    const updatedChunks = currentRecipe.chunks.filter((_, i) => i !== index);
    const reorderedChunks = updatedChunks.map((chunk, i) => ({
      ...chunk,
      order: i,
    }));

    setCurrentRecipe({
      ...currentRecipe,
      chunks: reorderedChunks,
    });
  };

  const handleSaveRecipe = () => {
    if (!currentRecipe.name) {
      setAlert({
        type: 'error',
        message: 'レシピ名を入力してください。',
      });
      return;
    }

    if (currentRecipe.chunks.length === 0) {
      setAlert({
        type: 'error',
        message: '少なくとも1つのチャンクを追加してください。',
      });
      return;
    }

    const recipeExists = recipes.some((recipe) => recipe.id === currentRecipe.id);
    let updatedRecipes;

    if (recipeExists) {
      updatedRecipes = recipes.map((recipe) =>
        recipe.id === currentRecipe.id ? currentRecipe : recipe
      );
    } else {
      updatedRecipes = [...recipes, currentRecipe];
    }

    setRecipes(updatedRecipes);
    setCurrentRecipe({
      id: '',
      name: '',
      description: '',
      chunks: [],
      timestamp: '',
    });

    setAlert({
      type: 'success',
      message: 'レシピを保存しました！',
    });
  };

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setAlert({
      type: 'success',
      message: 'クリップボードにコピーしました！',
    });
    setTimeout(() => setAlert(null), 3000);
  };

  return (
    <>
      <Toolbar />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Paper sx={{ p: 3, mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <MenuBookIcon color="primary" sx={{ mr: 1 }} />
            <Typography variant="h5" component="h1">
              レシピ管理テスト
            </Typography>
          </Box>
          <Typography variant="body1" sx={{ mb: 3 }}>
            チャンク配列によるデータ再構築のレシピを作成・管理・テストします。
          </Typography>

          {alert && (
            <Alert severity={alert.type} sx={{ mb: 3 }} onClose={() => setAlert(null)}>
              {alert.message}
            </Alert>
          )}

          <Grid container spacing={3}>
            {/* レシピ作成フォーム */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    レシピ作成
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  <Box sx={{ mb: 3 }}>
                    <TextField
                      fullWidth
                      label="レシピ名"
                      value={currentRecipe.name}
                      onChange={(e) =>
                        setCurrentRecipe({ ...currentRecipe, name: e.target.value })
                      }
                      sx={{ mb: 2 }}
                    />
                    <TextField
                      fullWidth
                      label="説明"
                      multiline
                      rows={2}
                      value={currentRecipe.description}
                      onChange={(e) =>
                        setCurrentRecipe({ ...currentRecipe, description: e.target.value })
                      }
                    />
                  </Box>

                  <Typography variant="subtitle1" gutterBottom>
                    チャンクの追加
                  </Typography>
                  <Box sx={{ display: 'flex', mb: 2 }}>
                    <TextField
                      fullWidth
                      label="チャンクCID"
                      value={newChunkCid}
                      onChange={(e) => setNewChunkCid(e.target.value)}
                      sx={{ mr: 1 }}
                    />
                    <TextField
                      select
                      label="タイプ"
                      value={newChunkType}
                      onChange={(e) => setNewChunkType(e.target.value)}
                      SelectProps={{
                        native: true,
                      }}
                      sx={{ width: '30%' }}
                    >
                      <option value="IMAGE">画像</option>
                      <option value="VIDEO">動画</option>
                      <option value="JSON">JSON</option>
                      <option value="OTHER">その他</option>
                    </TextField>
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<AddIcon />}
                      onClick={handleAddChunk}
                      sx={{ ml: 1, whiteSpace: 'nowrap' }}
                    >
                      追加
                    </Button>
                  </Box>

                  <Typography variant="subtitle1" gutterBottom>
                    登録されたチャンク
                  </Typography>
                  <List>
                    {currentRecipe.chunks.map((chunk, index) => (
                      <ListItem
                        key={index}
                        secondaryAction={
                          <IconButton
                            edge="end"
                            aria-label="delete"
                            onClick={() => handleRemoveChunk(index)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        }
                      >
                        <ListItemIcon>
                          <Chip
                            label={index + 1}
                            color="primary"
                            size="small"
                            sx={{ minWidth: '30px' }}
                          />
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Typography
                                variant="body2"
                                component="span"
                                sx={{
                                  fontFamily: 'monospace',
                                  fontSize: '0.8rem',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  maxWidth: '150px',
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
                          }
                          secondary={chunk.type}
                        />
                      </ListItem>
                    ))}
                  </List>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                    <Button
                      variant="outlined"
                      color="primary"
                      onClick={handleNewRecipe}
                      startIcon={<AddIcon />}
                    >
                      新規作成
                    </Button>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleSaveRecipe}
                      disabled={!currentRecipe.name || currentRecipe.chunks.length === 0}
                    >
                      保存
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* レシピの説明 */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
                <Typography variant="h6" gutterBottom>
                  レシピとは？
                </Typography>
                <Typography variant="body2">
                  レシピは、複数のチャンクを正しい順序で組み合わせて、元のデータを再構築するための設計図です。
                  各チャンクは特定のCIDで参照され、順序情報と共に管理されます。
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    レシピの利点:
                  </Typography>
                  <ul>
                    <li>複数のチャンクから元データを復元</li>
                    <li>部分的なデータの取得と表示が可能</li>
                    <li>データの再利用性を向上</li>
                    <li>さまざまな組み合わせでの新しいコンテンツ作成</li>
                  </ul>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Paper>
      </Container>
    </>
  );
};

export default RecipeTest; 