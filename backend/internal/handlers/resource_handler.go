package handlers

import (
	"net/http"

	"github.com/02Anmol/company-resource-allocator/internal/repository"
	"github.com/gin-gonic/gin"
)

func GetResources(c *gin.Context) {
	res, err := repository.GetAllResource()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Unable to fetch resources"})
		return
	}
	c.JSON(http.StatusOK, res)
}

func CreateResource(c *gin.Context) {
	var body struct {
		Name     string `json:"name" binding:"required"`
		Quantity int    `json:"quantity" binding:"required"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(400, gin.H{"error": "Invalid data"})
		return
	}

	err := repository.AddResource(body.Name, body.Quantity)
	if err != nil {
		c.JSON(500, gin.H{"error": "Could not add Item"})
	}
	c.JSON(200, gin.H{"message": "Resource added to inventory"})
}
