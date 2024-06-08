package dispatcher

import (
	"fmt"

	"github.com/libp2p/go-libp2p/core/host"
	"github.com/libp2p/go-libp2p/core/peer"
	"github.com/libp2p/go-libp2p/p2p/discovery/mdns"
)

// setupDiscoveryは、ノードの発見サービスを設定します。
func setupDiscovery(node host.Host) {
	// mDNSサービスを新規作成し、ノーティフィーを登録します。
	// ServiceTag は適切な文字列に置き換えてください。
	notifee := &discoveryNotifee{}
	ser := mdns.NewMdnsService(node, "適切なServiceTag", notifee)
	defer ser.Close() // 追加: serを使用してエラーを解決
}

// discoveryNotifeeは、ピア発見の通知を受け取るための構造体です。
type discoveryNotifee struct{}

// HandlePeerFoundは、新しいピアが発見されたときに呼び出されます。
func (n *discoveryNotifee) HandlePeerFound(pi peer.AddrInfo) {
	// 発見されたピアのIDを標準出力に出力します。
	fmt.Println("Found peer:", pi.ID)
}
