package handlers

import (
	"net/http"
	"os"
	"time"

	"github.com/02Anmol/company-resource-allocator/internal/models"
	"github.com/02Anmol/company-resource-allocator/internal/repository"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

var jwt_key = []byte(os.Getenv("JWT_SECRET"))

func Signup(c *gin.Context) {
	var user models.User
	if err := c.ShouldBindJSON(&user); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// hash pwd before saving it
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not process password"})
		return
	}

	user.Password = string(hashedPassword)

	//save to DB
	err = repository.CreateUser(user)
	if err != nil {
		c.JSON(http.StatusConflict, gin.H{"error": "Email already exist!"})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"message": "Account created Successfully."})

}

func Login(c *gin.Context) {
	var input models.LoginCredential
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Email and Password Required"})
		return
	}
	//fetch user from DB
	user, err := repository.GetUserByEmail(input.Email)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid Credentials"})
		return
	}

	//compare hash password
	err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(input.Password))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid Credentials"})
		return
	}

	//generate token(jwt)
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"user_id":   user.ID,
		"user_role": user.Role,
		"exp":       time.Now().Add(time.Hour * 24).Unix(),
	})

	tokenString, err := token.SignedString(jwt_key)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed tom create session"})
		return
	}

	// Send reponse
	c.JSON(http.StatusOK, gin.H{
		"token": tokenString,
		"user": gin.H{
			"email": user.Email,
			"role":  user.Role,
		},
	})

}
