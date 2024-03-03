package messaging

import (
    "context"
    "fmt"
    "github.com/libp2p/go-libp2p"
    "github.com/libp2p/go-libp2p/core/host"
    "github.com/libp2p/go-libp2p/p2p/protocol/pubsub"
)

func setupGossipSub(node host.Host) *pubsub.PubSub {
    ps, err := pubsub.NewGossipSub(context.Background(), node)
    if err != nil {
        panic(err)
    }
    return ps
}