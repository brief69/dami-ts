// アクセス制御のためのミドルウェア関数定義
// 指定された役割を持つユーザーのみがアクセスを許可されます。
function authorizeRole(role) {
    // リクエストを受け取り、レスポンスを返すか、次のミドルウェアに進む関数を返します。
    return (req, res, next) => {
      // ユーザーの役割が指定された役割と一致しない場合、403エラーを返します。
      if (req.user.role !== role) {
        return res.status(403).send('Not authorized');
      }
      // 役割が一致する場合、次のミドルウェアに進みます。
      next();
    };
  }
