// 必要なモジュールをインポート
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var morgan = require('morgan');
var mongoose = require('mongoose');
var dotenv = require('dotenv');
var helmet = require('helmet');
var cors = require('cors');

// ルーターモジュールをインポート
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

// Expressアプリケーションのインスタンスを作成
var app = express();

// ビューエンジンの設定
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// ミドルウェアの設定
app.use(morgan('dev'));
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

// セキュリティ強化のためのミドルウェアを設定
app.use(helmet());
app.use(cors());

// データベースの接続
dotenv.config();
const mongoDB = process.env.MONGODB_URI || 'mongodb://localhost:27017/auth_micro';

mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDBに接続しました。'))
  .catch(err => console.error('MongoDBへの接続に失敗しました。', err));

// Mongooseのデフォルト接続を取得
const db = mongoose.connection;

// 接続エラーの場合にコンソールにエラーを表示
db.on('error', console.error.bind(console, 'MongoDB接続エラー:'));