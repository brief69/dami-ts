package main

import (
    "context"
    "fmt"
    "log"
    "net/http"
    "github.com/gorilla/websocket"
    "github.com/libp2p/go-libp2p"
    "github.com/libp2p/go-libp2p/core/host"
    "strings"
)

    var clients = make(map[*websocket.Conn]bool) // 接続されたクライアントを管理
    var broadcast = make(chan []byte)            // ブロードキャスト用のチャネル

    var upgrader = websocket.Upgrader{
        CheckOrigin: func(r *http.Request) bool {
            return true
        },
    }


func handleConnections(w http.ResponseWriter, r *http.Request) {
    ws, err := upgrader.Upgrade(w, r, nil)
    if err != nil {
        log.Fatal(err)
    }
    defer ws.Close()
    clients[ws] = true

    for {
        _, msg, err := ws.ReadMessage()
        if err != nil {
            log.Printf("error: %v", err)
            delete(clients, ws)
            break
        }
        broadcast <- msg
    }
}

func handleMessages() {
    for {
        // ブロードキャストチャネルからメッセージを受け取る
        msg := <-broadcast
        // すべてのクライアントにメッセージを送信する
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

func startNode() host.Host {
    node, err := libp2p.New(
        context.Background(),
        libp2p.ListenAddrStrings("/ip4/0.0.0.0/tcp/0"),
    )
    if err != nil {
        panic(err)
    }
    }
    fmt.Println("Node started with addresses:", node.Addrs())
    return node
}

func setupDiscovery(node host.Host) {
    ser, _ := discovery.NewMdnsService(context.Background(), node, discovery.MdnsServiceTag)
    ser.RegisterNotifee(&discoveryNotifee{})
}

type discoveryNotifee struct{}

func (n *discoveryNotifee) HandlePeerFound(pi peer.AddrInfo) {
    fmt.Println("Found peer:", pi.ID)
}

// DispatchData は、データタイプに応じてデータを処理します。
func DispatchData(data string) {
    dataType := DetectDataType(data)

    switch dataType {
    case Text:
        segments := splitTextDataUsingNLP(data)
        processSegments(segments)
    case Image:
        segments := splitImageDataUsingImageRecognition(data)
        processSegments(segments)
    case Audio:
        segments := splitAudioDataUsingSpeechRecognition(data)
        processSegments(segments)
    // 他のデータタイプに対する処理をここに追加
    default:
        // 未知のデータタイプの処理
    }
}

// splitTextDataUsingNLP は、NLPを用いてテキストデータをセグメントに分割します。
func splitTextDataUsingNLP(data string) []string {
    // NLPによるテキスト分割の実装
    return strings.Split(data, " ") // 分割されたテキストセグメントのリストを返す
}


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