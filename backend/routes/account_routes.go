package routes

import (
	"backend/controller"

	"github.com/gin-gonic/gin"
)

func AccountRoute(route *gin.Engine) {
	route.POST("/login", controller.Login())
	route.GET("/logout", controller.LogOut())
	route.GET("/isAuthorized", controller.IsAuthorized())
	route.GET("/reset-password/:id", controller.ResetPassword())
	route.POST("/change-password/:id", controller.ChangePassword())
}
