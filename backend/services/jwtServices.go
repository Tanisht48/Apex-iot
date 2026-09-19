package services

import (
	"fmt"
	"log"
	"os"
	"sync"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

const tokenLifetime = 24 * time.Hour

// devSecret is used only when JWT_SECRET is not configured, so the demo runs out of the box.
const devSecret = "apex-iot-local-dev-secret-change-me"

var warnOnce sync.Once

// jwtSecret is read lazily so values loaded from .env files are picked up.
func jwtSecret() []byte {
	if secret := os.Getenv("JWT_SECRET"); secret != "" {
		return []byte(secret)
	}
	warnOnce.Do(func() {
		log.Println("JWT_SECRET is not set; using an insecure development secret")
	})
	return []byte(devSecret)
}

func CreateToken(id string, name string) (string, error) {
	now := time.Now()
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"sub":  id,
		"name": name,
		"iss":  "apex-iot",
		"iat":  now.Unix(),
		"exp":  now.Add(tokenLifetime).Unix(),
	})
	return token.SignedString(jwtSecret())
}

func VerifyToken(tokenString string) (*jwt.Token, error) {
	token, err := jwt.Parse(tokenString, func(t *jwt.Token) (interface{}, error) {
		if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method %v", t.Header["alg"])
		}
		return jwtSecret(), nil
	})
	if err != nil {
		return nil, err
	}
	if !token.Valid {
		return nil, fmt.Errorf("invalid token")
	}
	return token, nil
}
