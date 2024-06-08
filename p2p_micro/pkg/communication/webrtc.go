package communication

import (
	"fmt"
	"os"
	"os/signal"
	"syscall"

	"github.com/pion/webrtc/v3"
)

// createPeerConnection は、WebRTCのPeerConnectionを作成します。
func createPeerConnection() (*webrtc.PeerConnection, error) {
	// WebRTCの設定
	config := webrtc.Configuration{
		ICEServers: []webrtc.ICEServer{
			{
				URLs: []string{"stun:stun.l.google.com:19302"},
			},
		},
	}

	// PeerConnectionの作成
	peerConnection, err := webrtc.NewPeerConnection(config)
	if err != nil {
		return nil, err
	}

	return peerConnection, nil
}

// handleDataChannel は、データチャネルからのメッセージを処理します。
func handleDataChannel(d *webrtc.DataChannel) {
	fmt.Printf("New DataChannel %s %d\n", d.Label(), d.ID())

	// メッセージ受信時のコールバック関数を設定
	d.OnMessage(func(msg webrtc.DataChannelMessage) {
		fmt.Printf("Message from DataChannel '%s': '%s'\n", d.Label(), string(msg.Data))
	})
}

func setupDataChannel(peerConnection *webrtc.PeerConnection) {
	// データチャネルの作成
	dataChannel, err := peerConnection.CreateDataChannel("data", nil)
	if err != nil {
		panic(err)
	}

	// データチャネルのイベントハンドラを設定
	handleDataChannel(dataChannel)

	// setupCustomLogic関数を呼び出す
	setupCustomLogic(dataChannel)
}

func main() {
	// PeerConnectionの作成
	peerConnection, err := createPeerConnection()
	if err != nil {
		panic(err)
	}

	// データチャネルの設定
	setupDataChannel(peerConnection)

	// シグナルを待機
	c := make(chan os.Signal, 1)
	signal.Notify(c, os.Interrupt, syscall.SIGTERM)
	<-c

	// 終了時の処理
	fmt.Println("Exiting")
	peerConnection.Close()
}
