package routers

import (
	"apex-iot-backend/controllers"
	"apex-iot-backend/middlewares"

	"github.com/gin-gonic/gin"
)

func SetDeviceRecordRouter(router *gin.RouterGroup) {
	deviceRecordRouter := router.Group("/deviceRecord")
	{
		deviceRecordRouter.GET("/:deviceId", middlewares.Authenticate, controllers.GetDeviceRecords)
	}
}
