package routers

import (
	"apex-iot-backend/controllers"
	"apex-iot-backend/middlewares"

	"github.com/gin-gonic/gin"
)

func SetupGroupRoutes(router *gin.RouterGroup) {
	groupRouter := router.Group("/group")
	{
		groupRouter.GET("/", middlewares.Authenticate, controllers.GetAllGroups)
		groupRouter.GET("/:id", middlewares.Authenticate, controllers.GetGroupById)
		groupRouter.POST("/", middlewares.Authenticate, middlewares.Autherize, controllers.CreateGroup)
		groupRouter.PUT("/:id", middlewares.Authenticate, middlewares.Autherize, controllers.UpdateGroup)
		groupRouter.DELETE("/:id", middlewares.Authenticate, middlewares.Autherize, controllers.DeleteGroup)
	}
}
