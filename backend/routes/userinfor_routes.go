package routes

import (
	"backend/controller"

	"github.com/gin-gonic/gin"
)

func UserInforRoute(route *gin.Engine) {
	route.GET("/get-all-userinfor", controller.UserInforGetAll())
	route.PUT("/user-infor-update/:id", controller.UpdateUserInfor())
}
