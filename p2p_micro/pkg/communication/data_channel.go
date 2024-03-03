// データチャネルの作成
dataChannel, err := peerConnection.CreateDataChannel("myDataChannel", nil)
if err != nil {
    log.Fatal("Failed to create data channel:", err)
}

// データチャネルの状態変更イベントをハンドル
dataChannel.OnOpen(func() {
    fmt.Println("Data channel is open")
})

// データチャネルでメッセージを受信
dataChannel.OnMessage(func(msg webrtc.DataChannelMessage) {
    fmt.Printf("Received message: %s\n", string(msg.Data))
})