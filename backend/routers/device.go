package routers

import (
	"apex-iot-backend/controllers"
	"apex-iot-backend/middlewares"

	"github.com/gin-gonic/gin"
)

func SetupDeviceRoutes(router *gin.RouterGroup) {
	deviceRouter := router.Group("/device")
	{
		deviceRouter.GET("/", middlewares.Authenticate, controllers.GetAllDevices)
		deviceRouter.GET("/:id", middlewares.Authenticate, controllers.GetDeviceById)
		deviceRouter.GET("/organization/:orgId", middlewares.Authenticate, controllers.GetAllDevicesForOrganizatio)
		deviceRouter.POST("/", middlewares.Authenticate, middlewares.Autherize, controllers.CreateDevice)
		deviceRouter.PUT("/", middlewares.Authenticate, middlewares.Autherize, controllers.UpdateDevice)
		deviceRouter.DELETE("/:id", middlewares.Authenticate, middlewares.Autherize, controllers.DeleteDevice)
	}
}
