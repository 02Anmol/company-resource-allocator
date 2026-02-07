package repository

import (
	"context"

	"github.com/02Anmol/company-resource-allocator/internal/database"
	"github.com/02Anmol/company-resource-allocator/internal/models"
)

func CreateRequest(req models.Request) error {
	query := `INSERT INTO requests (employee_email, resource_id, reason, status)
		VALUES ($1, $2, $3, 'pending')
	`

	_, err := database.DB.Exec(context.Background(), query, req.EmployeeEmail, req.ResourceID, req.Reason)
	return err
}

func GetPendingRequest() ([]models.Request, error) {
	query := `SELECT id, employee_email, resource_id, reason, status, created_at FROM requests WHERE status = 'pending'`

	rows, err := database.DB.Query(context.Background(), query)
	if err != nil {
		return nil, err
	}

	defer rows.Close()

	var req []models.Request
	for rows.Next() {
		var r models.Request
		if err := rows.Scan(&r.ID, &r.EmployeeEmail, &r.ResourceID, &r.Reason, &r.Status, &r.CreatedAt); err != nil {
			return nil, err
		}
		req = append(req, r)
	}
	return req, nil
}
