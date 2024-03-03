package main

import (
	"crypto/sha256"
	"fmt"
)

type DataCapsule struct {
	TokenID      string
	Data         string
	HashedData   string
	SplittedData []string
}

// データを最小単位に分割し、それぞれのデータのハッシュ値とともにトークンIDでカプセル化する関数
func CapsulizeDataWithSplit(data string, tokenID string) DataCapsule {
	// ここでは例として、データを3文字ごとに分割する
	var splittedData []string
	for i := 0; i < len(data); i += 3 {
		if i+3 <= len(data) {
			splittedData = append(splittedData, data[i:i+3])
		} else {
			splittedData = append(splittedData, data[i:])
		}
	}

	// 分割したデータのハッシュ値を計算
	hashedData := sha256.Sum256([]byte(data))
	hashedDataStr := fmt.Sprintf("%x", hashedData)

	return DataCapsule{
		TokenID:      tokenID,
		Data:         data,
		HashedData:   hashedDataStr,
		SplittedData: splittedData,
	}
}

// 分割していない実際のデータとハッシュ化したデータをトークンIDでカプセル化する関数
func CapsulizeDataWithoutSplit(data string, tokenID string) DataCapsule {
	hashedData := sha256.Sum256([]byte(data))
	hashedDataStr := fmt.Sprintf("%x", hashedData)

	return DataCapsule{
		TokenID:    tokenID,
		Data:       data,
		HashedData: hashedDataStr,
	}
}