package main

import (
	"log"

	"github.com/02Anmol/company-resource-allocator/internal/database"
	"github.com/02Anmol/company-resource-allocator/internal/handlers"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Println("Warning: No .env file found")
	}

	//database connection
	database.ConnectDB()
	defer database.DB.Close()

	//setup gin
	r := gin.Default()

	//cors configuration
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000", "http://localhost:5173"}, // Add your frontend URLs
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		AllowCredentials: true,
	}))

	r.GET("/ping", func(c *gin.Context) {
		c.JSON(200, gin.H{"messgae": "You are talking with Database"})
	})
	r.GET("/api/resources", handlers.GetResources)
	r.POST("/api/requests", handlers.SubmitRequest)
	r.GET("/api/requests/pending", handlers.GetPendingRequests)
	r.PATCH("/api/requests/action", handlers.HandleRequestAction)
	r.GET("/api/my-requests", handlers.GetMyRequests)

	r.Run(":8080")
}
