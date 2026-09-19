package config

import (
	"log"

	"github.com/joho/godotenv"
)

// InitConfig loads optional local overrides from .env.local, then .env.
// Real environment variables always win, and both files are optional.
func InitConfig() {
	for _, file := range []string{".env.local", ".env"} {
		if err := godotenv.Load(file); err == nil {
			log.Println("loaded configuration from", file)
		}
	}
}
