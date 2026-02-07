// package handlers

// import (
// 	"company-resource-portal/internal/repository"
// 	"net/http"

// 	"github.com/gin-gonic/gin"
// )

// func GetResources(c *gin.Context) {
// 	items, err := repository.GetAllResources()
// 	if err != nil {
// 		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch resources"})
// 		return
// 	}
// 	c.JSON(http.StatusOK, items)
// }
