// アプリケーション固有のロジックの例
// ピアからの特定のメッセージに基づいてアクションを実行
dataChannel.OnMessage(func(msg webrtc.DataChannelMessage) {
    if string(msg.Data) == "特定のコマンド" {
        // 特定のアクションを実行
    }
})