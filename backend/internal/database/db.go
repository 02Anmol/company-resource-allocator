package database

import (
	"context"
	"fmt"
	"os"

	"github.com/jackc/pgx/v5/pgxpool"
)

var DB *pgxpool.Pool

func ConnectDB() {
	connStr := os.Getenv("DATABASE_URL")
	var err error

	DB, err = pgxpool.New(context.Background(), connStr)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Unable to connect to DB %v\n", err)
		os.Exit(1)
	}

	//ping to verify connection is actually working
	err = DB.Ping(context.Background())
	if err != nil {
		fmt.Fprintf(os.Stderr, "Database is not working ping failed: %v\n", err)
	}

	fmt.Println("Connection Successful")
}
