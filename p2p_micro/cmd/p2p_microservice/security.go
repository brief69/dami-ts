package main

import (
	"context"
	"log"
	"net"

	"github.com/libp2p/go-libp2p-core/host"
	"github.com/libp2p/go-libp2p-core/network"
	"github.com/libp2p/go-libp2p-core/sec"
)

func setupSecurity(h host.Host, secTransport sec.SecureTransport) {
	// セキュリティプロトコルの設定
	h.SetStreamHandler("/my_protocol", func(s network.Stream) {
		// `s.Conn()` を使用して `network.Conn` 型を取得し、それを `net.Conn` 型に変換
		netConn := s.Conn().(network.Conn)
		rawConn, ok := netConn.(net.Conn)
		if !ok {
			log.Println("net.Conn への変換に失敗しました")
			return
		}
		secureConn, err := secTransport.SecureInbound(context.Background(), rawConn)
		if err != nil {
			// エラー処理をここに記述
			log.Println("セキュアな接続の確立に失敗しました:", err)
			return
		}
		// セキュアな接続が確立された場合の処理をここに記述
		log.Println("セキュアな接続が確立されました:", secureConn)
		// ここでセキュアなコネクションを使用する処理を記述
	})
}
