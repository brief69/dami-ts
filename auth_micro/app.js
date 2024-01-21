// 必要なモジュールをインポート
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

// ルーターモジュールをインポート
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

// Expressアプリケーションのインスタンスを作成
var app = express();

// ビューエンジンの設定
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// ミドルウェアの設定
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// ルートハンドラの設定
app.use('/', indexRouter);
app.use('/users', usersRouter);

// 404エラーを処理するミドルウェア
app.use(function(req, res, next) {
  next(createError(404));
});

// エラーハンドラミドルウェア
app.use(function(err, req, res, next) {
  // 開発環境のみエラー情報を提供
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // エラーページをレンダリング
  res.status(err.status || 500);
  res.render('error');
});

// アプリケーションをエクスポート
module.exports = app;

// セキュリティ強化のためのミドルウェアを設定
const helmet = require('helmet');
const cors = require('cors');

app.use(helmet());
app.use(cors());