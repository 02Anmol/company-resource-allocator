Project Progress: Resource Allocator Backend

System Architecture:

Language: Go (Golang)
Web Framework: Gin Gonic
Database: PostgreSQL
Concurrency: Context-driven queries
Communication: RESTful JSON API

----------------------------------------------------------------------------------------------------------

Completed Features
1.Database Layer

Schema Design: Tables for resources and requests with Foreign Key constraints.
Connection Pool: Established connection using pgx with environment-ready config.

2.Resource Management (Employee/Manager View)
-> GET /api/resources: Fetches all available equipment, showing names and current stock.

3.Request Lifecycle (The Core Logic)
-> POST /api/requests: Allows employees to submit a request. Includes validation for employee_email and resource_id.
-> GET /api/requests/pending: A Manager-only view using SQL JOINS to show the resource name instead of just an ID.
-> PATCH /api/requests/action:
Logic: Uses Database Transactions (tx).
-> Approved: Updates status and automatically decrements available_quantity in the store.
-> Rejected: Updates status only, preserving inventory.

4.Employee Personal Dashboard
GET /api/my-requests?email=...: Filtered history view using Query Parameters.
Bug Fixed: Resolved the resource_id: 0 mapping issue by aligning SQL Scan order.

----------------------------------------------------------------------------------------------------------

Current API Endpoints:

Method |   Endpoint              Description                                 Status
GET    | /api/resources          "List all items (Mice, Keyboards, etc.)"     200 OK
POST   | /api/requests           Submit a new resource request                200 OK
GET,   | /api/requests/pending   Manager view of all 'pending' items          200 OK
PATCH, | /api/requests/action    Approve or Reject a request                  200 OK
GET,   | /api/my-requests        History for a specific employee              200 OK

----------------------------------------------------------------------------------------------------------

Security & Middleware

CORS Configured: Backend is ready to accept requests from Frontend origins (Vite/React).
Error Handling: Implemented 400 (Bad Request) and 500 (Internal Server Error) JSON responses.