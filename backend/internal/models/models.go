// package models

// import "time"

// // Resource represents an item in the company store
// type Resource struct {
// 	ID                int    `json:"id"`
// 	Name              string `json:"name"`
// 	TotalQuantity     int    `json:"total_quantity"`
// 	AvailableQuantity int    `json:"available_quantity"`
// }

// // Request represents an employee's request for a resource
// type Request struct {
// 	ID            int       `json:"id"`
// 	EmployeeEmail string    `json:"employee_email"`
// 	ResourceID    int       `json:"resource_id"`
// 	Reason        string    `json:"reason"`
// 	Status        string    `json:"status"` // pending, approved, rejected, issued
// 	CreatedAt     time.Time `json:"created_at"`
// }
