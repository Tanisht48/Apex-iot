package main

import (
	"log"
	"os"

	"apex-iot-backend/config"
	"apex-iot-backend/middlewares"
	"apex-iot-backend/routers"
	"apex-iot-backend/seed"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	config.InitConfig()
	seed.Load()

	r := gin.Default()

	frontendURL := "http://localhost:3000"
	if customURL := os.Getenv("FRONTEND_URL"); customURL != "" {
		frontendURL = customURL
	}
	corsConfig := cors.DefaultConfig()
	corsConfig.AllowOrigins = []string{frontendURL, "http://localhost:3000"}
	corsConfig.AllowCredentials = true
	corsConfig.AllowHeaders = []string{"Origin", "Content-Type", "Authorization"}
	corsConfig.ExposeHeaders = []string{"Authorization"}
	r.Use(cors.New(corsConfig))
	r.Use(middlewares.ErrorHandlingMiddleware())

	v0 := r.Group("/api/v0")
	routers.SetupUserRoutes(v0)
	routers.SetupOrganizationRoutes(v0)
	routers.SetupGroupRoutes(v0)
	routers.SetupAcessRoleRoutes(v0)
	routers.SetupDeviceRoutes(v0)
	routers.SetDeviceRecordRouter(v0)
	routers.SetupNotificationRoutes(v0)

	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})

	// Listens on :8080, or on the PORT environment variable when set.
	if err := r.Run(); err != nil {
		log.Fatal(err)
	}
}
