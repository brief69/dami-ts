// トークン検証ミドルウェア
function authenticateToken(req, res, next) {
    // 認証ヘッダーからトークンを取得
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    // トークンがなければ401 Unauthorizedを返す
    if (token == null) return res.sendStatus(401);
  
    // トークンを検証
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      // トークンが無効なら403 Forbiddenを返す
      if (err) return res.sendStatus(403);
      // トークンが有効ならリクエストオブジェクトにユーザー情報を追加して次の処理へ
      req.user = user;
      next();
    });
  }
  