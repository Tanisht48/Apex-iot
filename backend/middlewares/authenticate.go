package middlewares

import (
	"net/http"
	"strings"

	"apex-iot-backend/Dtos"
	cerr "apex-iot-backend/Errors"
	"apex-iot-backend/services"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

func unauthenticated(c *gin.Context, message string) {
	c.Error(&cerr.CustomError{Code: http.StatusUnauthorized, Message: message})
	c.Abort()
}

// Authenticate requires a valid JWT, taken from the Authorization header
// (optionally prefixed with "Bearer ") or the jwt_token cookie.
func Authenticate(c *gin.Context) {
	tokenString := strings.TrimSpace(strings.TrimPrefix(c.GetHeader("Authorization"), "Bearer "))
	if tokenString == "" {
		if cookie, err := c.Cookie("jwt_token"); err == nil {
			tokenString = cookie
		}
	}
	if tokenString == "" {
		unauthenticated(c, "authentication token is missing")
		return
	}

	token, err := services.VerifyToken(tokenString)
	if err != nil {
		unauthenticated(c, "invalid or expired token")
		return
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		unauthenticated(c, "invalid token claims")
		return
	}
	id, _ := claims["sub"].(string)
	name, _ := claims["name"].(string)
	if id == "" {
		unauthenticated(c, "invalid token claims")
		return
	}

	c.Set("TokenUser", Dtos.TokenUser{Id: id, Name: name})
	c.Next()
}
