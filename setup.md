company-resource-portal/
├── backend/                  # Golang Backend
│   ├── cmd/
│   │   └── api/
│   │       └── main.go       # Entry point: starts the server
│   ├── internal/             # Private application code (un-importable by others)
│   │   ├── database/         # DB connection & migrations
│   │   ├── handlers/         # HTTP Handlers (The "Controllers")
│   │   ├── models/           # Data Structures (Structs)
│   │   └── repository/       # Database CRUD logic (SQL queries)
│   ├── .env                  # Environment variables (DB_URL, JWT_SECRET)
│   ├── go.mod                # Go module file
│   └── go.sum                # Dependency checksums
├── frontend/                 # React.js Frontend
│   ├── src/
│   │   ├── api/              # Axios/Fetch calls to Go backend
│   │   ├── components/       # UI building blocks
│   │   └── pages/            # Employee, Manager, Admin views
│   └── ...
└── scripts/                  # SQL scripts to initialize your DB