package authentication

import (
	"time"

	"github.com/golang-jwt/jwt"
)

var jwtKey = []byte("your-secret-key")

type User struct {
	// ユーザー構造体の定義
	Username string
}

func GenerateJWT(user User) (string, error) {
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"username": user.Username,
		"exp":      time.Now().Add(time.Hour * 72).Unix(),
	})

	tokenString, err := token.SignedString(jwtKey)
	if err != nil {
		return "", err
	}

	return tokenString, nil
}
