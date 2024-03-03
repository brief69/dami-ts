package communication

import (
    "context"
    "fmt"
    "log"
    "net/url"
    "github.com/gorilla/websocket"
    "github.com/pion/webrtc/v3"
)

// connectToSignalingServer は、シグナリングサーバーへのWebSocket接続を確立します。
func connectToSignalingServer() *websocket.Conn {
    u := url.URL{Scheme: "ws", Host: "localhost:8000", Path: "/ws"}
    c, _, err := websocket.DefaultDialer.Dial(u.String(), nil)
    if err != nil {
        log.Fatal("dial:", err)
    }
    return c
}

// sendOffer は、SDPオファーをシグナリングサーバーに送信します。
func sendOffer(conn *websocket.Conn, offer webrtc.SessionDescription) {
    err := conn.WriteJSON(offer)
    if err != nil {
        log.Fatal("write:", err)
    }
}

// receiveAnswer は、シグナリングサーバーからSDPアンサーを受信します。
func receiveAnswer(conn *websocket.Conn) webrtc.SessionDescription {
    var answer webrtc.SessionDescription
    err := conn.ReadJSON(&answer)
    if err != nil {
        log.Fatal("read:", err)
    }
    return answer
}

// StartWebRTCClient は、WebRTCクライアントを起動し、シグナリングサーバーとの通信を行います。
func StartWebRTCClient() {
    // WebRTCのPeerConnectionを作成
    peerConnection, err := webrtc.NewPeerConnection(webrtc.Configuration{})
    if err != nil {
        log.Fatal("Failed to create PeerConnection:", err)
    }

    // シグナリングサーバーに接続
    conn := connectToSignalingServer()
    defer conn.Close()

    // SDPオファーを作成して送信
    offer, err := peerConnection.CreateOffer(nil)
    if err != nil {
        log.Fatal("Failed to create offer:", err)
    }
    peerConnection.SetLocalDescription(offer)
    sendOffer(conn, offer)

    // SDPアンサーを受信して設定
    answer := receiveAnswer(conn)
    if err := peerConnection.SetRemoteDescription(answer); err != nil {
        log.Fatal("Failed to set remote description:", err)
    }

    // ICE候補の交換
    peerConnection.OnICECandidate(func(c *webrtc.ICECandidate) {
        if c != nil {
            fmt.Println("New ICE candidate:", c.ToJSON())
            // ここでICE候補をシグナリングサーバーに送信する処理を実装します。
        }
    })

    // データチャネルの設定やメディアトラックの追加など、その他の設定を行います。

    // アプリケーションの終了を待機
    select {}
}