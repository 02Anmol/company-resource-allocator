package main

import (
	"log"

	"github.com/02Anmol/company-resource-allocator/internal/database"
	"github.com/02Anmol/company-resource-allocator/internal/handlers"
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

	r.GET("/ping", func(c *gin.Context) {
		c.JSON(200, gin.H{"messgae": "You are talking with Database"})
	})
	r.GET("/api/resources", handlers.GetResources)
	r.POST("/api/requests", handlers.SubmitRequest)
	r.GET("/api/requests/pending", handlers.GetPendingRequests)

	r.Run(":8080")
}
