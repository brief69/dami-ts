package communication

import (
    "log"
    "net/http"
    "github.com/gorilla/websocket"
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
        msg := <-broadcast
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

func StartSignalingServer() {
    http.HandleFunc("/ws", handleConnections)
    go handleMessages()
    log.Println("signaling server started on :8000")
    err := http.ListenAndServe(":8000", nil)
    if err != nil {
        log.Fatal("ListenAndServe: ", err)
    }
}