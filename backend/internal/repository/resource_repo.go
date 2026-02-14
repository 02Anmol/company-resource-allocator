package repository

import (
	"context"
	"strings"

	"github.com/02Anmol/company-resource-allocator/internal/database"
	"github.com/02Anmol/company-resource-allocator/internal/models"
)

func GetAllResource() ([]models.Resource, error) {
	//Query for the table
	rows, err := database.DB.Query(context.Background(), "SELECT id, name, total_quantity, available_quantity FROM resources")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var res []models.Resource
	for rows.Next() {
		var r models.Resource
		if err := rows.Scan(&r.ID, &r.Name, &r.TotalQuantity, &r.AvailableQuantity); err != nil {
			return nil, err
		}
		res = append(res, r)
	}
	return res, nil
}

func AddResource(name string, qty int) error {

	formattedName := strings.Title(strings.ToLower(strings.TrimSpace(name)))

	query := `
		INSERT INTO resources (name, total_quantity, available_quantity) 
		VALUES ($1, $2, $2)
		ON CONFLICT (name) 
		DO UPDATE SET 
			total_quantity = resources.total_quantity + EXCLUDED.total_quantity,
			available_quantity = resources.available_quantity + EXCLUDED.available_quantity
	`
	_, err := database.DB.Exec(context.Background(), query, formattedName, qty)
	return err
}

func DeleteResource(id int) error {
	query := `DELETE FROM resources WHERE id = $1`
	_, err := database.DB.Exec(context.Background(), query, id)
	return err
}

func CreateSpecialRequest(req models.SpecialRequest) error {
	//we use background context for database operations
	query := `
		INSERT INTO special_requests (employee_email, item_name, reason) 
		VALUES ($1, $2, $3)
	`
	_, err := database.DB.Exec(context.Background(), query, req.EmployeeEmail, req.ItemName, req.Reason)
	return err
}

func GetAllSpecialRequests() ([]models.SpecialRequest, error) {
	query := `SELECT id, employee_email, item_name, reason, status, created_at FROM special_requests ORDER BY created_at DESC`
	rows, err := database.DB.Query(context.Background(), query)
	if err != nil {
		return nil, err
	}

	defer rows.Close()

	var requests []models.SpecialRequest
	for rows.Next() {
		var r models.SpecialRequest
		err := rows.Scan(&r.ID, &r.EmployeeEmail, &r.ItemName, &r.Reason, &r.Status, &r.CreatedAt)
		if err != nil {
			return nil, err
		}
		requests = append(requests, r)
	}
	return requests, nil
}
