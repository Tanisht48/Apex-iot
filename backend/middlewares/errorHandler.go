package middlewares

import (
	"apex-iot-backend/Errors"
	"log"
	"net/http"
	"time"

	"apex-iot-backend/Dtos"

	"github.com/gin-gonic/gin"
)

func ErrorHandlingMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Next() // Process request

		// Check for errors in the context
		if len(c.Errors) > 0 {
			for _, e := range c.Errors {
				log.Printf("Handled error: %v", e.Err)
				// Customize the response based on the error type
				var status int
				var message string

				if customErr, ok := e.Err.(*errors.CustomError); ok {
					status = customErr.Code
					message = customErr.Message
				} else {
					status = http.StatusInternalServerError
					message = "Internal Server Error"
				}

				c.JSON(status, Dtos.ErrorOutPut{
					Status:    status,
					Message:   message,
					Api_path:  c.Request.RequestURI,
					Timestamp: time.Now(),
				})
			}
		}
	}
}
