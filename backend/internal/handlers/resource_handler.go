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
