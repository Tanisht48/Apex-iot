package routers

import (
	"apex-iot-backend/controllers"
	"apex-iot-backend/middlewares"

	"github.com/gin-gonic/gin"
)

func SetupUserRoutes(router *gin.RouterGroup) {
	userRoutes := router.Group("/user")
	{
		// Public: the OTP login flow.
		userRoutes.GET("/otp", controllers.SendOtp)
		userRoutes.POST("/otp/verify", controllers.VerifyOtp)

		userRoutes.GET("/", middlewares.Authenticate, controllers.GetAllUsers)
		userRoutes.GET("/:id", middlewares.Authenticate, controllers.GetUserById)
		userRoutes.GET("/organization/:orgId", middlewares.Authenticate, controllers.GetAllUsersForOrganization)
		userRoutes.POST("/", middlewares.Authenticate, middlewares.Autherize, controllers.CreateUser)
		userRoutes.PUT("/:id", middlewares.Authenticate, middlewares.Autherize, controllers.UpdateUser)
		userRoutes.DELETE("/:id", middlewares.Authenticate, middlewares.Autherize, controllers.DeleteUser)
	}
}
