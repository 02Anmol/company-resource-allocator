package repository

import (
	"context"

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
