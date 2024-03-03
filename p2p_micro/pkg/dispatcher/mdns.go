package dispatcher

import (
    "context" // コンテキストを管理するためのパッケージ
    "fmt" // 標準出力に出力するためのパッケージ
    "github.com/libp2p/go-libp2p" // libp2pライブラリのインポート
    "github.com/libp2p/go-libp2p/p2p/discovery" // libp2pの発見機能を利用するためのパッケージ
    "github.com/libp2p/go-libp2p/core/host" // libp2pのホスト機能を利用するためのパッケージ
)

// setupDiscoveryは、ノードの発見サービスを設定します。
func setupDiscovery(node host.Host) {
    // mDNSサービスを新規作成し、ノーティフィーを登録します。
    ser, _ := discovery.NewMdnsService(context.Background(), node, discovery.MdnsServiceTag)
    ser.RegisterNotifee(&discoveryNotifee{})
}

// discoveryNotifeeは、ピア発見の通知を受け取るための構造体です。
type discoveryNotifee struct{}

// HandlePeerFoundは、新しいピアが発見されたときに呼び出されます。
func (n *discoveryNotifee) HandlePeerFound(pi peer.AddrInfo) {
    // 発見されたピアのIDを標準出力に出力します。
    fmt.Println("Found peer:", pi.ID)
}