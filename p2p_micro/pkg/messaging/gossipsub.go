package messaging

import (
	"context"

	pubsub "github.com/libp2p/go-libp2p-pubsub"
	"github.com/libp2p/go-libp2p/core/host"
)

func main() {
	// ホストの初期化などのコード
	var node host.Host
	// node の初期化コードをここに追加

	ps := setupGossipSub(node) // setupGossipSub を使用してエラーを解決
	// ps を使用するコードをここに追加

	// 例えば、トピックを作成して購読するコードを追加
	topic, err := ps.Join("example-topic")
	if err != nil {
		panic(err)
	}
	sub, err := topic.Subscribe()
	if err != nil {
		panic(err)
	}
	_ = sub // sub を使用しない場合は、エラーを避けるためにこの行を追加
}

func setupGossipSub(node host.Host) *pubsub.PubSub {
	ps, err := pubsub.NewGossipSub(context.Background(), node)
	if err != nil {
		panic(err)
	}
	return ps
}
