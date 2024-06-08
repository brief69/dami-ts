package main

import (
	"context"
	"log"

	"github.com/libp2p/go-libp2p-core/host"
	"github.com/libp2p/go-libp2p-core/routing"
	discovery "github.com/libp2p/go-libp2p-discovery"
	dht "github.com/libp2p/go-libp2p-kad-dht"
)
// initializeDiscoveryは、ピア発見のための設定を行います。
func initializeDiscovery(h host.Host, rendezvousString string, kadDHT *dht.IpfsDHT) {
	// kadDHTをContentRoutingインターフェースとして扱えるようにキャストします。
	var contentRouting interface{} = kadDHT
	if cr, ok := contentRouting.(routing.ContentRouting); ok {
		// ディスカバリーサービスをkadDHTを使って初期化します。
		routingDiscovery := discovery.NewRoutingDiscovery(cr)
		// ディスカバリーサービスを使って、他のピアを見つけるための広告を行います。
		ctx := context.Background()
		discovery.Advertise(ctx, routingDiscovery, rendezvousString)
		// rendezvousStringを使って他のピアを探します。
		peerChan, err := routingDiscovery.FindPeers(ctx, rendezvousString)
		if err != nil {
			log.Fatalf("Failed to find peers: %s", err)
		}

		// 探し出したピアを一つずつ処理します。
		for peer := range peerChan {
			// 自分自身またはアドレスがないピアは無視します。
			if peer.ID == h.ID() || len(peer.Addrs) == 0 {
				continue
			}

			// ピアに接続を試みます。
			err := connectToPeer(h, peer.Addrs[0].String())
			if err != nil {
				log.Fatalf("Failed to connect to peer: %s", err)
			}
		}
	} else {
		log.Fatalf("kadDHTはContentRoutingインターフェースを実装していません")
	}
}

// connectToPeerは、指定されたアドレスのピアに接続を試みます。
func connectToPeer(h host.Host, peerAddr string) error {
	// ここにピアに接続するためのロジックを実装します。
	// 例: h.Connect(context.Background(), peerInfo)
	return nil
}

