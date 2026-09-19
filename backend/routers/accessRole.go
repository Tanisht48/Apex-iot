package routers

import (
	"apex-iot-backend/controllers"
	"apex-iot-backend/middlewares"

	"github.com/gin-gonic/gin"
)

func SetupAcessRoleRoutes(router *gin.RouterGroup) {
	accessRoleRouter := router.Group("/role")
	{
		accessRoleRouter.GET("/", middlewares.Authenticate, controllers.GetAllAccessRoles)
		accessRoleRouter.GET("/:id", middlewares.Authenticate, controllers.GetAccessRoleById)
		accessRoleRouter.POST("/", middlewares.Authenticate, middlewares.Autherize, controllers.CreateAccessRole)
		accessRoleRouter.PUT("/:id", middlewares.Authenticate, middlewares.Autherize, controllers.UpdateAccessRole)
		accessRoleRouter.DELETE("/:id", middlewares.Authenticate, middlewares.Autherize, controllers.DeleteAccessRole)
	}
}
