package main

import (
	"github.com/libp2p/go-libp2p-core/host"
	"github.com/libp2p/go-libp2p-core/network"
)

// handleFileSharingは、ファイルを受信したときに呼び出されるハンドラーです。
func handleFileSharing(stream network.Stream) {
	// ここにファイル共有のロジックを実装します。
}

// setupFileSharingは、ファイル共有のためのハンドラーを設定します。
func setupFileSharing(h host.Host) {
	// ファイル共有用のハンドラーを"/p2p_microservice/filesharing/1.0.0"のパスで設定します。
	h.SetStreamHandler("/p2p_microservice/filesharing/1.0.0", handleFileSharing)
}
