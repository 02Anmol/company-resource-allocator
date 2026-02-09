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

func HandleRequestAction(c *gin.Context) {
	var body struct {
		ID     int    `json:"id" binding:"required"`
		Status string `json:"status" binding:"required"`
	}

	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(400, gin.H{"error": "Invalid request Body"})
		return
	}

	err := repository.UpdateRequestStatus(body.ID, body.Status)
	if err != nil {
		c.JSON(500, gin.H{"error": "Failed to update request: " + err.Error()})
		return
	}

	c.JSON(200, gin.H{"message": "Request " + body.Status + " successfully"})
}

func GetMyRequests(c *gin.Context) {
	// pulls "email" from the URL (?email=...)
	email := c.Query("email")

	if email == "" {
		c.JSON(400, gin.H{"error": "Email parameter is required"})
		return
	}

	req, err := repository.FetchRequestByMail(email)
	if err != nil {
		c.JSON(500, gin.H{"error": "Failed to fetch requests"})
		return
	}

	c.JSON(200, req)
}
