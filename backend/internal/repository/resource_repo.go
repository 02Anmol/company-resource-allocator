// package repository

// import (
// 	"company-resource-portal/internal/database"
// 	"company-resource-portal/internal/models"
// 	"context"
// )

// func GetAllResources() ([]models.Resource, error) {
// 	rows, err := database.DB.Query(context.Background(), "SELECT id, name, total_quantity, available_quantity FROM resources")
// 	if err != nil {
// 		return nil, err
// 	}
// 	defer rows.Close()

// 	var items []models.Resource
// 	for rows.Next() {
// 		var r models.Resource
// 		if err := rows.Scan(&r.ID, &r.Name, &r.TotalQuantity, &r.AvailableQuantity); err != nil {
// 			return nil, err
// 		}
// 		items = append(items, r)
// 	}
// 	return items, nil
// }
