package handlers

import (
	"net/http"

	"github.com/02Anmol/company-resource-allocator/internal/models"
	"github.com/02Anmol/company-resource-allocator/internal/repository"
	"github.com/gin-gonic/gin"
)

func SubmitRequest(c *gin.Context) {
	var req models.Request

	//validate the incomeing json data
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
	}
	err := repository.CreateRequest(req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to submit request"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Requets submit successsful"})

}

func GetPendingRequests(c *gin.Context) {
	requests, err := repository.GetPendingRequest()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch pending requets"})
		return
	}
	c.JSON(http.StatusOK, requests)

}
