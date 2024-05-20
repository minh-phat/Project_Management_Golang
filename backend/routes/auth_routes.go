package routes

import (
	"backend/controller"

	"github.com/gin-gonic/gin"
)

func AuthRoute(route *gin.Engine) {
	//Authorization
	route.POST("/authorization-add", controller.AuthorizationAdd())
	route.GET("/authorization-get-all", controller.AuthorizationGetAll())
	route.DELETE("/authorization/:id", controller.AuthorizationDelete())
	route.GET("/authorization/:id", controller.GetAuthorizationById())
	route.PUT("/authorization/:id", controller.UpdateAuthorization())
}
