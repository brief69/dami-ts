// オーディオトラックの追加（例としてマイクからのオーディオ）
mediaEngine := webrtc.MediaEngine{}
mediaEngine.RegisterDefaultCodecs()
api := webrtc.NewAPI(webrtc.WithMediaEngine(&mediaEngine))

localTrack, err := webrtc.NewTrackLocalStaticSample(webrtc.RTPCodecCapability{MimeType: "audio/opus"}, "audio", "p2p_micro")
if err != nil {
    log.Fatal("Failed to create audio track:", err)
}

_, err = peerConnection.AddTrack(localTrack)
if err != nil {
    log.Fatal("Failed to add audio track:", err)
}

// トラックデータの送信（ここではサンプルとして静的なファイルをループで送信）
go func() {
    for {
        // トラックにデータを書き込む
        // 例: localTrack.Write(sampleData)
    }
}()