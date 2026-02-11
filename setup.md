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



# 🏢 BitcommStore - Company Resource Allocator

A full-stack resource management system that streamlines the process of requesting, approving, and distributing company resources across different organizational roles.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Database Setup](#database-setup)
- [Running the Application](#running-the-application)
- [API Endpoints](#api-endpoints)
- [User Roles](#user-roles)
- [Known Issues](#known-issues)
- [Project Structure](#project-structure)
- [Contributing](#contributing)

## 🎯 Overview

BitcommStore is a resource allocation platform designed to manage company inventory and streamline the request-approval workflow. The system supports three distinct user roles (Employee, Department Manager, and Store Manager), each with specific permissions and capabilities.

## ✨ Features

### Employee Features
- View available company resources
- Submit resource requests with justification
- Track request status (pending, approved, rejected, fulfilled)

### Department Manager Features
- Review pending resource requests
- Approve or reject employee requests
- View request details including employee information and reasoning

### Store Manager Features
- Add new items to inventory
- View manager-approved requests
- Fulfill approved requests and update stock levels
- Automatic inventory management

### General Features
- Role-based authentication (JWT)
- Secure password hashing (bcrypt)
- Real-time inventory tracking
- Request history and status tracking
- Responsive modern UI with Tailwind CSS

## 🛠 Tech Stack

### Frontend
- **React** (Vite)
- **Axios** - HTTP client
- **Tailwind CSS** - Styling

### Backend
- **Go** (Golang)
- **Gin** - Web framework
- **PostgreSQL** - Database
- **JWT** - Authentication
- **bcrypt** - Password hashing

## 📦 Prerequisites

- **Node.js** (v16 or higher)
- **Go** (v1.19 or higher)
- **PostgreSQL** (v13 or higher)
- **npm** or **yarn**

## 🚀 Installation

### 1. Clone the Repository
```bash
git clone https://github.com/02Anmol/company-resource-allocator.git
cd company-resource-allocator
```

### 2. Frontend Setup
```bash
cd frontend
npm install
```

### 3. Backend Setup
```bash
cd backend
go mod download
```

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the backend root directory:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=resource_allocator

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Server Configuration (optional)
PORT=8080
```

**⚠️ Security Note:** Always use strong, unique values for `JWT_SECRET` in production!

## 🗄️ Database Setup

### 1. Create Database
```sql
CREATE DATABASE resource_allocator;
```

### 2. Create Tables

```sql
-- Users Table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('employee', 'manager', 'store')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Resources Table
CREATE TABLE resources (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    total_quantity INTEGER NOT NULL DEFAULT 0,
    available_quantity INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CHECK (available_quantity >= 0),
    CHECK (available_quantity <= total_quantity)
);

-- Requests Table
CREATE TABLE requests (
    id SERIAL PRIMARY KEY,
    employee_email VARCHAR(255) NOT NULL,
    resource_id INTEGER NOT NULL REFERENCES resources(id),
    reason TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'pending' 
        CHECK (status IN ('pending', 'manager_approved', 'rejected', 'fulfilled')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better performance
CREATE INDEX idx_requests_status ON requests(status);
CREATE INDEX idx_requests_employee ON requests(employee_email);
CREATE INDEX idx_users_email ON users(email);
```

### 3. Seed Initial Data (Optional)

```sql
-- Sample Resources
INSERT INTO resources (name, total_quantity, available_quantity) VALUES
    ('Laptop', 10, 10),
    ('Monitor', 15, 15),
    ('Keyboard', 20, 20),
    ('Mouse', 20, 20),
    ('Headphones', 8, 8);

-- Sample Users (password is 'password123' for all)
INSERT INTO users (email, password, role) VALUES
    ('employee@company.com', '$2a$10$...(hashed_password)', 'employee'),
    ('manager@company.com', '$2a$10$...(hashed_password)', 'manager'),
    ('store@company.com', '$2a$10$...(hashed_password)', 'store');
```

## 🏃 Running the Application

### Start Backend Server
```bash
cd backend
go run cmd/main.go
# Server will start on http://localhost:8080
```

### Start Frontend Development Server
```bash
cd frontend
npm run dev
# Frontend will start on http://localhost:5173
```

### Access the Application
Open your browser and navigate to: `http://localhost:5173`

## 🔌 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/signup` | Register new user |
| POST | `/api/login` | Login user |

### Resources
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/resources` | Get all resources | All |
| POST | `/api/resources` | Add new resource | Store Manager |

### Requests
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/requests` | Submit new request | Employee |
| GET | `/api/requests/pending` | Get pending requests | Manager |
| GET | `/api/requests/approved` | Get approved requests | Store Manager |
| PATCH | `/api/requests/action` | Approve/reject request | Manager |
| PATCH | `/api/requests/fulfill` | Fulfill request | Store Manager |
| GET | `/api/my-requests?email=...` | Get user's requests | All |

## 👥 User Roles

### Employee
- Default role for new users
- Can request resources
- Can view their request history

### Manager (Department Manager)
- Approves or rejects employee requests
- Views pending requests with employee details

### Store (Store Manager)
- Manages inventory (adds new items)
- Fulfills manager-approved requests
- Updates stock level
----------------------------------------------------------------------------------------------------------

## 📁 Project Structure

```
company-resource-allocator/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AuthScreen.jsx
│   │   │   └── ManagerDashboard.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   └── vite.config.js
│
├── backend/
│   ├── cmd/
│   │   └── main.go
│   ├── internal/
│   │   ├── handlers/
│   │   │   ├── auth_handler.go
│   │   │   ├── request_handler.go
│   │   │   └── resource_handler.go
│   │   ├── repository/
│   │   │   ├── user_repo.go
│   │   │   ├── request_repo.go
│   │   │   └── resource_repo.go
│   │   ├── database/
│   │   │   └── database.go 
│   │   └── models/
│   │       └── models.go
│   ├── go.mod
│   └── .env
│
└── README.md
```


## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 👨‍💻 Author

**Anmol** 

## 🙏 Acknowledgments

- React community for excellent documentation
- Gin framework for making Go web development easier
- Tailwind CSS for the beautiful UI components

---
