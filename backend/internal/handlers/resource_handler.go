package handlers

import (
	"fmt"
	"net/http"

	"github.com/02Anmol/company-resource-allocator/internal/models"
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

func DeleteResource(c *gin.Context) {
	idStr := c.Param("id")

	//convert string to int
	var id int
	_, err := fmt.Sscanf(idStr, "%d", &id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID!"})
		return
	}

	err = repository.DeleteResource(id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Couldn't Delete Resource"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Resource Delete Successfully"})
}

func CreateSpecialRequest(c *gin.Context) {
	var req models.SpecialRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid Data"})
		return
	}
	err := repository.CreateSpecialRequest(req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save request"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Wishlist request send"})
}

func GetAllSpecialRequests(c *gin.Context) {
	requests, err := repository.GetAllSpecialRequests()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch requests"})
		return
	}
	c.JSON(http.StatusOK, requests)
}
