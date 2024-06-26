package main

import (
	"backend/middleware"
	"backend/routes"
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/rs/cors"
)

func main() {
	// Routers
	router := gin.Default()

	// Middleware
	router.Use(middleware.CookieAuth())
	
	routes.TaskRoute(router)
	routes.ProjectRoute(router)
	routes.EpicRoute(router)
	routes.AuthRoute(router)
	routes.AccountRoute(router)
	routes.UserInforRoute(router)
	routes.EmployeeRoute(router)
	routes.MessageRoute(router)

	// CORS settings
	corsOptions := cors.New(cors.Options{
		AllowedOrigins:   []string{"http://127.0.0.1:5173", "http://localhost:5173"},
		AllowedMethods:   []string{http.MethodGet, http.MethodPost, http.MethodDelete, http.MethodPatch, http.MethodPut},
		AllowedHeaders:   []string{"*"},
		AllowCredentials: true,
	})
	handler := corsOptions.Handler(router)

	// Server
	err := http.ListenAndServe("localhost:8080", handler)
	if err != nil {
		log.Fatal(err)
		return
	}
}
