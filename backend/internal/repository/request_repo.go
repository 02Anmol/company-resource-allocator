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
	query := `
		SELECT 
			r.id, r.employee_email, r.resource_id, res.name, r.reason, r.status, r.created_at 
		FROM requests r
		JOIN resources res ON r.resource_id = res.id
		WHERE r.status = 'pending'`

	rows, err := database.DB.Query(context.Background(), query)
	if err != nil {
		return nil, err
	}

	defer rows.Close()

	var req []models.Request
	for rows.Next() {
		var r models.Request
		if err := rows.Scan(&r.ID, &r.EmployeeEmail, &r.ResourceID, &r.ResourceName, &r.Reason, &r.Status, &r.CreatedAt); err != nil {
			return nil, err
		}
		req = append(req, r)
	}
	return req, nil
}

func UpdateRequestStatus(requestID int, newStatus string) error {
	ctx := context.Background()
	tx, err := database.DB.Begin(ctx) // start the transaction
	if err != nil {
		return err
	}

	defer tx.Rollback(ctx) // goback or rollback if any steps fails

	// get the resource ID associate with this request
	var resourceID int
	err = tx.QueryRow(ctx, "SELECT resource_id FROM requests WHERE id = $1", requestID).Scan(&resourceID)
	if err != nil {
		return err
	}

	// update the requets status
	_, err = tx.Exec(ctx, "UPDATE requests SET status = $1 WHERE id = $2", newStatus, requestID)
	if err != nil {
		return err
	}

	// request approved than decrease the inventory
	if newStatus == "Approved" {
		_, err = tx.Exec(ctx, "UPDATE resources SET available_quantity = available_quantity - 1 WHERE id = $1 AND available_quantity > 0", resourceID)
		if err != nil {
			return err
		}
	}

	return tx.Commit(ctx) // finalize both the changes

}

func FetchRequestByMail(email string) ([]models.Request, error) {
	query := `
		SELECT r.id, r.employee_email, res.name, r.reason, r.status, r.created_at 
		FROM requests r
		JOIN resources res ON r.resource_id = res.id
		WHERE r.employee_email = $1
		ORDER BY r.created_at DESC`

	rows, err := database.DB.Query(context.Background(), query, email)
	if err != nil {
		return nil, err
	}

	defer rows.Close()

	var req []models.Request
	for rows.Next() {
		var r models.Request
		err := rows.Scan(&r.ID, &r.EmployeeEmail, &r.ResourceName, &r.Reason, &r.Status, &r.CreatedAt)
		if err != nil {
			return nil, err
		}
		req = append(req, r)
	}
	return req, nil
}
