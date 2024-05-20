package routes

import (
	"backend/controller"

	"github.com/gin-gonic/gin"
)

func EpicRoute(route *gin.Engine) {
	route.POST("/epic", controller.CreateEpic())
	route.GET("/epic/:id", controller.GetEpicById())
	route.GET("/epic-for-project/:id", controller.GetEpicForProject())
	route.PUT("/epic/:id", controller.UpdateEpic())
	route.DELETE("/epic", controller.DeleteEpic())
	route.DELETE("/epic/:epic_id", controller.DeleteOneEpic())
	route.GET("/get-leader-for-epic/:id", controller.GetLeaderForEpic())
}
