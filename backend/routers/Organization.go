package routers

import (
	"apex-iot-backend/controllers"
	"apex-iot-backend/middlewares"

	"github.com/gin-gonic/gin"
)

func SetupOrganizationRoutes(router *gin.RouterGroup) {
	organizationRoutes := router.Group("/organization")
	{
		organizationRoutes.GET("/", middlewares.Authenticate, controllers.GetAllOrganizations)
		organizationRoutes.GET("/:id", middlewares.Authenticate, controllers.GetOrganizationById)
		organizationRoutes.POST("/", middlewares.Authenticate, middlewares.Autherize, controllers.CreateOrganization)
		organizationRoutes.PUT("/:id", middlewares.Authenticate, middlewares.Autherize, controllers.UpdateOrganization)
		organizationRoutes.DELETE("/:id", middlewares.Authenticate, middlewares.Autherize, controllers.DeleteOrganization)
	}
}
