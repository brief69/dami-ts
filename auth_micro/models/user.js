const mongoose = require('mongoose');

// ユーザースキーマの定義
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  // 必要に応じて他のフィールドを追加
}, { timestamps: true }); // createdAtとupdatedAtのタイムスタンプを自動生成

// ユーザーモデルの作成
const User = mongoose.model('User', userSchema);

module.exports = User;
