package routes

import (
	"backend/controller"

	"github.com/gin-gonic/gin"
)

func TaskRoute(route *gin.Engine) {
	route.POST("/task", controller.CreateTask())
	route.GET("/task", controller.GetTasks())
	route.GET("/task/:id", controller.GetTaskById())
	route.PUT("/task/:id", controller.UpdateTask())
	route.DELETE("/task/:id", controller.DeleteTask())
	route.PUT("/task-update-status/:taskID", controller.UpdateStatusOfTask())
	route.GET("/all-tasks-in-project/:projectID", controller.GetAllTasksInProject())
	// route.GET("/task", controllers.GetTasks())
	// route.GET("/task/:id", controllers.GetTask())
	// route.PUT("/task/:id", controllers.UpdateTask())
	// route.DELETE("/task/:id", controllers.DeleteTask())
}
