package middlewares

import (
	"net/http"
	"strings"

	"apex-iot-backend/Dtos"
	cerr "apex-iot-backend/Errors"
	models "apex-iot-backend/Models"
	"apex-iot-backend/services"

	"github.com/gin-gonic/gin"
)

// superRole is the platform-wide role that may do anything.
const superRole = "god"

// actionForMethod maps an HTTP method to the RBAC action it requires.
var actionForMethod = map[string]models.ActionType{
	http.MethodGet:    "READ",
	http.MethodPost:   "CREATE",
	http.MethodPut:    "UPDATE",
	http.MethodDelete: "DELETE",
}

func forbidden(c *gin.Context) {
	c.Error(&cerr.CustomError{Code: http.StatusForbidden, Message: "you are not allowed to perform this action"})
	c.Abort()
}

func hasAction(actions []models.ActionType, wanted models.ActionType) bool {
	for _, action := range actions {
		if action == wanted {
			return true
		}
	}
	return false
}

// Autherize checks the authenticated user's access role against the request.
// Organisation routes are reserved for the super role; device routes use the
// role's DeviceActions; every other route uses its UserActions. It must run
// after Authenticate.
func Autherize(c *gin.Context) {
	tokenUser, ok := c.MustGet("TokenUser").(Dtos.TokenUser)
	if !ok {
		forbidden(c)
		return
	}
	user, err := services.GetUserById(tokenUser.Id)
	if err != nil {
		forbidden(c)
		return
	}
	role, err := services.GetAccessRoleById(user.AccessRole)
	if err != nil {
		forbidden(c)
		return
	}

	if strings.EqualFold(string(role.Name), superRole) {
		c.Next()
		return
	}

	action, known := actionForMethod[c.Request.Method]
	path := c.Request.URL.Path
	switch {
	case !known, strings.HasPrefix(path, "/api/v0/organization"):
		forbidden(c)
		return
	case strings.HasPrefix(path, "/api/v0/device"):
		if !hasAction(role.DeviceActions, action) {
			forbidden(c)
			return
		}
	default:
		if !hasAction(role.UserActions, action) {
			forbidden(c)
			return
		}
	}
	c.Next()
}
