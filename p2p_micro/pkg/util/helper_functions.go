package util

import (
	"crypto/sha256"
	"fmt"
)

// HashDataはデータをSHA-256でハッシュ化します。
func HashData(data string) string {
	hash := sha256.Sum256([]byte(data))
	return fmt.Sprintf("%x", hash)
}
