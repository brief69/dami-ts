package main

import (
	"bytes"
	"context"
	"crypto/sha256"
	"fmt"
	"io/ioutil"
	"net/http"
	"os"
	"os/signal"
	"syscall"

	"github.com/libp2p/go-libp2p"
	dht "github.com/libp2p/go-libp2p-kad-dht"
)

func main() {
	// libp2pノードの初期化
	node, err := libp2p.New(context.Background())
	if err != nil {
		panic(err)
	}
	defer node.Close()

	// DHTの初期化
	kademliaDHT, err := dht.New(context.Background(), node)
	if err != nil {
		panic(err)
	}

	// データのハッシュ化
	data := "このデータをハッシュ化"
	hash := sha256.Sum256([]byte(data))
	hashStr := fmt.Sprintf("%x", hash)

	// DHTを使用してデータの存在確認
	ctx := context.Background()
	val, err := kademliaDHT.GetValue(ctx, hashStr)
	if err != nil {
		fmt.Println("データが存在しません。ネットワークにデータを送信します。")
		err = kademliaDHT.PutValue(ctx, hashStr, []byte(data))
		if err != nil {
			panic(err)
		}
	} else {
		fmt.Println("データが既に存在します。内容:", string(val))
		query := generateGraphQLQuery(hashStr)
		sendQueryToGqlMicro(query)
	}

	// プログラムを終了する前にシグナルを待機
	fmt.Println("Ctrl+Cを押して終了...")
	sigCh := make(chan os.Signal, 1)
	signal.Notify(sigCh, syscall.SIGINT, syscall.SIGTERM)
	<-sigCh
	fmt.Println("Received signal, shutting down...")
}

func generateGraphQLQuery(dataIdentifier string) string {
	// この関数は、データ識別子に基づいてGraphQLクエリを生成します。
	// 実際のクエリはgql_microサービスのAPI仕様に依存します。
	query := fmt.Sprintf(`{ "query": "query { findData(id: \"%s\") { id content } }" }`, dataIdentifier)
	return query
}

func sendQueryToGqlMicro(query string) {
	// gql_microサービスのエンドポイント
	gqlMicroEndpoint := "http://localhost:4000/graphql"

	// GraphQLクエリをJSON形式で送信
	var jsonStr = []byte(query)
	req, err := http.NewRequest("POST", gqlMicroEndpoint, bytes.NewBuffer(jsonStr))
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		panic(err)
	}
	defer resp.Body.Close()

	body, _ := ioutil.ReadAll(resp.Body)
	fmt.Println("gql_microからの応答:", string(body))
}
