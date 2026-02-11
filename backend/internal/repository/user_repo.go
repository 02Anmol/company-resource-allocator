package repository

import (
	"context"

	"github.com/02Anmol/company-resource-allocator/internal/database"
	"github.com/02Anmol/company-resource-allocator/internal/models"
)

func CreateUser(user models.User) error {
	query := `INSERT INTO users (email, password, role) VALUES ($1, $2, $3)`
	_, err := database.DB.Exec(context.Background(), query, user.Email, user.Password, user.Role)
	return err
}

func GetUserByEmail(email string) (models.User, error) {
	var user models.User
	query := `SELECT id, email, password, role FROM users WHERE email = $1`
	err := database.DB.QueryRow(context.Background(), query, email).Scan(&user.ID, &user.Email, &user.Password, &user.Role)
	return user, err
}
