package models

import "time"

type Resource struct {
	ID                int    `json:"id"`
	Name              string `json:"name"`
	TotalQuantity     int    `json:"total_quantity"`
	AvailableQuantity int    `json:"available_quantity"`
}

type Request struct {
	ID            int       `json:"id"`
	EmployeeEmail string    `json:"employee_email"`
	ResourceID    int       `json:"resource_id" binding:"required"`
	ResourceName  string    `json:"resource_name"`
	Reason        string    `json:"reason" binding:"required"`
	Status        string    `json:"status"`
	CreatedAt     time.Time `json:"created_at"`
}

type User struct {
	ID       int    `json:"id"`
	Email    string `json:"email" binding:"required"`
	Password string `json:"password,omitempty" binding:"required"`
	Role     string `json:"role"`
}

type LoginCredential struct {
	Email    string `json:"email" binding:"required"`
	Password string `json:"password" binding:"required"`
}
