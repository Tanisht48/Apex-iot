package routers

import (
	"apex-iot-backend/controllers"
	"apex-iot-backend/middlewares"

	"github.com/gin-gonic/gin"
)

func SetupNotificationRoutes(router *gin.RouterGroup) {
	notificationRouter := router.Group("/notification")
	{
		notificationRouter.GET("/device", middlewares.Authenticate, controllers.GetAllDeviceNotifications)
		notificationRouter.GET("/device/:deviceId", middlewares.Authenticate, controllers.GetNotificationsForDevice)
		notificationRouter.PUT("/:id", middlewares.Authenticate, middlewares.Autherize, controllers.UpdateNotificationStatus)
		notificationRouter.DELETE("/:id", middlewares.Authenticate, middlewares.Autherize, controllers.DeleteNotification)
	}
}
