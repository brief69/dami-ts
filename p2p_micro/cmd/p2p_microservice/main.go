package main

import (
	"fmt"
	"log"
	"net/http"
	"strings"

	"github.com/gorilla/websocket"
	"github.com/libp2p/go-libp2p"
	"github.com/libp2p/go-libp2p/core/host"
	"github.com/libp2p/go-libp2p/core/peer"
	"github.com/libp2p/go-libp2p/p2p/discovery/mdns"
)

// 接続されたクライアントを管理するためのマップ
var clients = make(map[*websocket.Conn]bool)

// ブロードキャスト用のチャネル
var broadcast = make(chan []byte)

// WebSocket接続をアップグレードするための設定
var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

// WebSocket接続を処理する関数
func handleConnections(w http.ResponseWriter, r *http.Request) {
	// HTTP接続をWebSocket接続にアップグレード
	ws, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Fatal(err)
	}
	defer ws.Close()
	clients[ws] = true

	// クライアントからのメッセージを読み取るループ
	for {
		_, msg, err := ws.ReadMessage()
		if err != nil {
			log.Printf("error: %v", err)
			delete(clients, ws)
			break
		}
		// メッセージをブロードキャストチャネルに送信
		broadcast <- msg
	}
}

// ブロードキャストメッセージを処理する関数
func handleMessages() {
	for {
		// ブロードキャストチャネルからメッセージ受け取る
		msg := <-broadcast
		// すべてのクラアントにメッセージを送信する
		for client := range clients {
			err := client.WriteMessage(websocket.TextMessage, msg)
			if err != nil {
				log.Printf("error: %v", err)
				client.Close()
				delete(clients, client)
			}
		}
	}
}

// libp2pノードを開始する関数
func startNode() host.Host {
	node, err := libp2p.New(
		libp2p.ListenAddrStrings("/ip4/0.0.0.0/tcp/0"),
	)
	if err != nil {
		panic(err)
	}
	fmt.Println("Node started with addresses:", node.Addrs())
	return node
}

// Start of Selection
// ノードのディスカバリーを設定する関数
func setupDiscovery(node host.Host) {
	ser := mdns.NewMdnsService(node, "rendezvous", &discoveryNotifee{})
	if ser == nil {
		log.Fatal("Failed to create mDNS service")
	}
}

// ピアが見つかったときのハンドラー
type discoveryNotifee struct{}

func (n *discoveryNotifee) HandlePeerFound(pi peer.AddrInfo) {
	fmt.Println("Found peer:", pi.ID)
}

// データタイプを検出する関数を追加
func DetectDataType(data string) string {
	if strings.HasPrefix(data, "text:") {
		return "Text"
	} else if strings.HasPrefix(data, "image:") {
		return "Image"
	} else if strings.HasPrefix(data, "audio:") {
		return "Audio"
	}
	return "Unknown"
}

// 音声認識を用いて音声データをセグメントに分割する関数
func splitAudioDataUsingSpeechRecognition(data string) []string {
	// 音声認識による音声分割の実装
	return []string{"segment1", "segment2"} // 分割された音声セグメントのリストを返す
}

// データタイプに応じてデータを処理する関数
func DispatchData(data string) {
	dataType := DetectDataType(data)

	switch dataType {
	case "Text":
		segments := splitTextDataUsingNLP(data)
		processSegments(segments)
	case "Image":
		segments := splitImageDataUsingImageRecognition(data)
		processSegments(segments)
	case "Audio":
		segments := splitAudioDataUsingSpeechRecognition(data)
		processSegments(segments)
	default:
		// 未知のデータタイプの処理
	}
}

// セグメントを処理する関数
func processSegments(segments []string) {
	for _, segment := range segments {
		fmt.Println("Processing segment:", segment)
	}
}

// NLPを用いてテキストデータをセグメントに分割する関数
func splitTextDataUsingNLP(data string) []string {
	// NLPによるテキスト分割の実装
	return strings.Split(data, " ") // 分割されたテキストセグメントのリストを返す
}

// 画像認識を用いて画像データをセグメントに分割する関数
func splitImageDataUsingImageRecognition(data string) []string {
	// 画像認識による画像分割の実装
	return []string{"segment1", "segment2"} // 分割された画像セグメントのリストを返す
}

// メイン関数
func main() {
	// libp2pノードをデフォルト設定で開始
	node, err := libp2p.New()
	if err != nil {
		panic(err)
	}

	// ノードのリスニングアドレスを出力
	fmt.Println("Listen addresses:", node.Addrs())

	// ノードをシャットダウン
	if err := node.Close(); err != nil {
		panic(err)
	}
}
