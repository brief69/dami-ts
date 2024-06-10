var express = require('express');
var router = express.Router();
const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authenticateToken = require('../middleware/authenticateToken');

// ユーザー一覧を取得するエンドポイント
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/register', async (req, res) => {
  try {
    // パスワードをハッシュ化
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    
    // 新しいユーザーインスタンスの作成
    const user = new User({
      username: req.body.username,
      email: req.body.email,
      password: hashedPassword
    });
    
    // ユーザーをデータベースに保存
    const newUser = await user.save();
    
    // 登録成功のレスポンスを返す
    res.status(201).json({ message: 'User created', userId: newUser._id });
  } catch (error) {
    // エラー発生時は500 Internal Server Errorを返す
    res.status(500).json({ message: 'Error creating user', error: error });
  }
});

// ログイン機能
router.post('/login', async (req, res) => {
  try {
    // ユーザー名でユーザーを検索
    const user = await User.findOne({ username: req.body.username });
    if (user == null) {
      // ユーザーが見つからない場合は401 Unauthorizedを返す
      return res.status(401).json({ message: 'Cannot find user' });
    }
    
    // パスワードの検証
    if (await bcrypt.compare(req.body.password, user.password)) {
      // JWTトークンの生成
      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '24h' });
      res.json({ token: token });
    } else {
      // パスワードが一致しない場合は401 Unauthorizedを返す
      res.status(401).json({ message: 'Incorrect password' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error logging in', error: error });
  }
});

// ユーザー情報の更新機能
router.put('/:id', authenticateToken, (req, res) => {
  // TODO: ユーザー情報の更新ロジックを実装
});

// ユーザー削除機能
router.delete('/:id', authenticateToken, (req, res) => {
  // TODO: ユーザーの削除ロジックを実装
});

module.exports = router;
