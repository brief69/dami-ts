package dispatcher

import (
	"crypto/sha256"
	"encoding/hex"
	"strings"

	"github.com/brief69/p2p_micro/pkg/datatypes"
)

const (
	Text  = "text"
	Image = "image"
	Video = "video"
)

// DispatchData は、データタイプに応じてデータを処理します。
func DispatchData(data string) {
	dataType := datatypes.DetectDataType(data)

	switch dataType {
	case datatypes.Text:
		segments := splitTextData(data)
		processSegments(segments)
	case datatypes.Image:
		// 画像データの処理
	case datatypes.Video:
		// 動画データの処理
	// 他のデータタイプに対する処理をここに追加
	default:
		// 未知のデータタイプの処理
	}
}

// splitTextData は、テキストデータをセグメントに分割します。
func splitTextData(data string) []string {
	// この例では単純に空白で分割していますが、実際にはより複雑なパーサーが必要になる場合があります。
	return strings.Split(data, " ")
}

// processSegments は、分割されたデータセグメントを処理します。
func processSegments(segments []string) {
	for _, segment := range segments {
		hash := sha256.Sum256([]byte(segment))
		hashStr := hex.EncodeToString(hash[:])
		// ここでトークンIDとともにカプセル化するロジックを実装
		// 例: sendDataToNetwork(segment, hashStr)
		_ = hashStr // 暫定的に使用しない変数を無視
	}
}
