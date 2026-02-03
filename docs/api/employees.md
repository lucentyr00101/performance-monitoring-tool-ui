# Employees API

## Overview

Employee management endpoints for CRUD operations and employee-related queries.

> **Naming Convention:** JSON request/response bodies use camelCase. URL query parameters use snake_case.

**Base Path:** `/employees`

---

## Endpoints

| Method | Endpoint | Description | Auth | Roles |
|--------|----------|-------------|------|-------|
| GET | `/employees` | List all employees | Yes | All |
| GET | `/employees/:id` | Get employee by ID | Yes | All |
| POST | `/employees` | Create employee | Yes | Admin, HR |
| PUT | `/employees/:id` | Update employee | Yes | Admin, HR |
| DELETE | `/employees/:id` | Delete employee | Yes | Admin |
| GET | `/employees/:id/goals` | Get employee goals | Yes | All |
| GET | `/employees/:id/reviews` | Get employee reviews | Yes | All |
| GET | `/employees/:id/team` | Get direct reports | Yes | Manager+ |

---

## GET /employees

List all employees with filtering and pagination.

### Request

```http
GET /api/v1/employees?page=1&per_page=20&status=active&department_id=uuid
Authorization: Bearer <token>
```

### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `page` | integer | No | Page number (default: 1) |
| `per_page` | integer | No | Items per page (default: 20, max: 100) |
| `status` | string | No | Filter by status: `active`, `inactive` |
| `department_id` | uuid | No | Filter by department |
| `manager_id` | uuid | No | Filter by manager |
| `search` | string | No | Search by name or email |
| `sort_by` | string | No | Sort field (default: `lastName`) |
| `sort_order` | string | No | `asc` or `desc` (default: `asc`) |

### Response

#### Success (200 OK)

```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "employeeCode": "EMP-001",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@company.com",
      "jobTitle": "Engineering Manager",
      "department": {
        "id": "550e8400-e29b-41d4-a716-446655440010",
        "name": "Engineering"
      },
      "manager": {
        "id": "550e8400-e29b-41d4-a716-446655440002",
        "firstName": "Jane",
        "lastName": "Smith"
      },
      "hireDate": "2022-03-15",
      "status": "active",
      "avatarUrl": "https://cdn.example.com/avatars/john-doe.jpg"
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440003",
      "employeeCode": "EMP-002",
      "firstName": "Alice",
      "lastName": "Johnson",
      "email": "alice.johnson@company.com",
      "jobTitle": "Senior Developer",
      "department": {
        "id": "550e8400-e29b-41d4-a716-446655440010",
        "name": "Engineering"
      },
      "manager": {
        "id": "550e8400-e29b-41d4-a716-446655440001",
        "firstName": "John",
        "lastName": "Doe"
      },
      "hireDate": "2023-01-10",
      "status": "active",
      "avatarUrl": null
    }
  ],
  "meta": {
    "pagination": {
      "page": 1,
      "perPage": 20,
      "totalItems": 156,
      "totalPages": 8
    },
    "timestamp": "2026-01-28T10:30:00Z"
  }
}
```

---

## GET /employees/:id

Get a single employee by ID.

### Request

```http
GET /api/v1/employees/550e8400-e29b-41d4-a716-446655440001
Authorization: Bearer <token>
```

### Response

#### Success (200 OK)

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "employeeCode": "EMP-001",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@company.com",
    "phone": "+1-555-123-4567",
    "jobTitle": "Engineering Manager",
    "department": {
      "id": "550e8400-e29b-41d4-a716-446655440010",
      "name": "Engineering",
      "parent": {
        "id": "550e8400-e29b-41d4-a716-446655440020",
        "name": "Technology"
      }
    },
    "manager": {
      "id": "550e8400-e29b-41d4-a716-446655440002",
      "firstName": "Jane",
      "lastName": "Smith",
      "jobTitle": "VP of Engineering",
      "email": "jane.smith@company.com"
    },
    "hireDate": "2022-03-15",
    "employmentType": "full-time",
    "status": "active",
    "avatarUrl": "https://cdn.example.com/avatars/john-doe.jpg",
    "directReportsCount": 5,
    "createdAt": "2022-03-15T09:00:00Z",
    "updatedAt": "2026-01-15T14:30:00Z"
  },
  "meta": {
    "timestamp": "2026-01-28T10:30:00Z"
  }
}
```

#### Error - Not Found (404)

```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Employee not found"
  },
  "meta": {
    "timestamp": "2026-01-28T10:30:00Z"
  }
}
```

---

## POST /employees

Create a new employee.

### Request

```http
POST /api/v1/employees
Authorization: Bearer <token>
Content-Type: application/json
```

```json
{
  "firstName": "Bob",
  "lastName": "Williams",
  "email": "bob.williams@company.com",
  "phone": "+1-555-987-6543",
  "jobTitle": "Software Engineer",
  "departmentId": "550e8400-e29b-41d4-a716-446655440010",
  "managerId": "550e8400-e29b-41d4-a716-446655440001",
  "hireDate": "2026-02-01",
  "employmentType": "full-time",
  "createUserAccount": true,
  "userRole": "employee"
}
```

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `firstName` | string | Yes | First name (max 100 chars) |
| `lastName` | string | Yes | Last name (max 100 chars) |
| `email` | string | Yes | Unique email address |
| `phone` | string | No | Phone number |
| `jobTitle` | string | No | Job title (max 100 chars) |
| `departmentId` | uuid | No | Department ID |
| `managerId` | uuid | No | Manager's employee ID |
| `hireDate` | date | No | Hire date (YYYY-MM-DD) |
| `employmentType` | string | No | `full-time`, `part-time`, `contract` |
| `avatarUrl` | string | No | Avatar image URL |
| `createUserAccount` | boolean | No | Create login account (default: true) |
| `userRole` | string | No | User role if creating account |

### Response

#### Success (201 Created)

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440050",
    "userId": "550e8400-e29b-41d4-a716-446655440051",
    "employeeCode": "EMP-157",
    "firstName": "Bob",
    "lastName": "Williams",
    "email": "bob.williams@company.com",
    "phone": "+1-555-987-6543",
    "jobTitle": "Software Engineer",
    "department": {
      "id": "550e8400-e29b-41d4-a716-446655440010",
      "name": "Engineering"
    },
    "manager": {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "firstName": "John",
      "lastName": "Doe"
    },
    "hireDate": "2026-02-01",
    "employmentType": "full-time",
    "status": "active",
    "avatarUrl": null,
    "createdAt": "2026-01-28T10:30:00Z",
    "updatedAt": "2026-01-28T10:30:00Z"
  },
  "meta": {
    "timestamp": "2026-01-28T10:30:00Z"
  }
}
```

#### Error - Validation (422)

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      {
        "field": "email",
        "message": "Email already exists"
      }
    ]
  },
  "meta": {
    "timestamp": "2026-01-28T10:30:00Z"
  }
}
```

#### Error - Forbidden (403)

```json
{
  "success": false,
  "error": {
    "code": "AUTHORIZATION_ERROR",
    "message": "You do not have permission to create employees"
  },
  "meta": {
    "timestamp": "2026-01-28T10:30:00Z"
  }
}
```

---

## PUT /employees/:id

Update an existing employee.

### Request

```http
PUT /api/v1/employees/550e8400-e29b-41d4-a716-446655440001
Authorization: Bearer <token>
Content-Type: application/json
```

```json
{
  "jobTitle": "Senior Engineering Manager",
  "phone": "+1-555-111-2222",
  "departmentId": "550e8400-e29b-41d4-a716-446655440011"
}
```

### Request Body

All fields are optional. Only provided fields will be updated.

| Field | Type | Description |
|-------|------|-------------|
| `firstName` | string | First name |
| `lastName` | string | Last name |
| `email` | string | Email address |
| `phone` | string | Phone number |
| `jobTitle` | string | Job title |
| `departmentId` | uuid | Department ID |
| `managerId` | uuid | Manager's employee ID |
| `employmentType` | string | Employment type |
| `status` | string | `active` or `inactive` |
| `avatarUrl` | string | Avatar URL |

### Response

#### Success (200 OK)

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "employeeCode": "EMP-001",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@company.com",
    "phone": "+1-555-111-2222",
    "jobTitle": "Senior Engineering Manager",
    "department": {
      "id": "550e8400-e29b-41d4-a716-446655440011",
      "name": "Platform Engineering"
    },
    "status": "active",
    "updatedAt": "2026-01-28T10:35:00Z"
  },
  "meta": {
    "timestamp": "2026-01-28T10:35:00Z"
  }
}
```

---

## DELETE /employees/:id

Delete an employee (soft delete - sets status to inactive).

### Request

```http
DELETE /api/v1/employees/550e8400-e29b-41d4-a716-446655440050
Authorization: Bearer <token>
```

### Response

#### Success (204 No Content)

No response body.

#### Error - Has Direct Reports (409)

```json
{
  "success": false,
  "error": {
    "code": "CONFLICT",
    "message": "Cannot delete employee with direct reports. Reassign employees first."
  },
  "meta": {
    "timestamp": "2026-01-28T10:30:00Z"
  }
}
```

---

## GET /employees/:id/goals

Get all goals for an employee.

### Request

```http
GET /api/v1/employees/550e8400-e29b-41d4-a716-446655440001/goals?status=active
Authorization: Bearer <token>
```

### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `status` | string | Filter: `draft`, `active`, `completed`, `cancelled` |
| `type` | string | Filter: `individual`, `team`, `department` |
| `page` | integer | Page number |
| `per_page` | integer | Items per page |

### Response

#### Success (200 OK)

```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440100",
      "title": "Improve team velocity by 20%",
      "type": "team",
      "status": "active",
      "progress": 65,
      "dueDate": "2026-03-31",
      "keyResultsCount": 3,
      "keyResultsCompleted": 1
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440101",
      "title": "Complete AWS certification",
      "type": "individual",
      "status": "active",
      "progress": 80,
      "dueDate": "2026-02-28",
      "keyResultsCount": 2,
      "keyResultsCompleted": 1
    }
  ],
  "meta": {
    "pagination": {
      "page": 1,
      "perPage": 20,
      "totalItems": 5,
      "totalPages": 1
    },
    "timestamp": "2026-01-28T10:30:00Z"
  }
}
```

---

## GET /employees/:id/reviews

Get all reviews for an employee.

### Request

```http
GET /api/v1/employees/550e8400-e29b-41d4-a716-446655440001/reviews
Authorization: Bearer <token>
```

### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `cycle_id` | uuid | Filter by review cycle |
| `type` | string | Filter: `self`, `manager`, `peer` |
| `status` | string | Filter: `pending`, `submitted`, `acknowledged` |

### Response

#### Success (200 OK)

```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440200",
      "cycle": {
        "id": "550e8400-e29b-41d4-a716-446655440300",
        "name": "Q4 2025 Review"
      },
      "type": "manager",
      "reviewer": {
        "id": "550e8400-e29b-41d4-a716-446655440002",
        "firstName": "Jane",
        "lastName": "Smith"
      },
      "status": "submitted",
      "rating": 4.5,
      "submittedAt": "2025-12-20T15:00:00Z"
    }
  ],
  "meta": {
    "timestamp": "2026-01-28T10:30:00Z"
  }
}
```

---

## GET /employees/:id/team

Get direct reports for a manager.

### Request

```http
GET /api/v1/employees/550e8400-e29b-41d4-a716-446655440001/team
Authorization: Bearer <token>
```

### Response

#### Success (200 OK)

```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440003",
      "firstName": "Alice",
      "lastName": "Johnson",
      "email": "alice.johnson@company.com",
      "jobTitle": "Senior Developer",
      "status": "active",
      "avatarUrl": null,
      "activeGoalsCount": 3,
      "pendingReviewsCount": 1
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440004",
      "firstName": "Bob",
      "lastName": "Williams",
      "email": "bob.williams@company.com",
      "jobTitle": "Software Engineer",
      "status": "active",
      "avatarUrl": "https://cdn.example.com/avatars/bob.jpg",
      "activeGoalsCount": 2,
      "pendingReviewsCount": 1
    }
  ],
  "meta": {
    "totalDirectReports": 5,
    "timestamp": "2026-01-28T10:30:00Z"
  }
}
```

#### Error - Not a Manager (403)

```json
{
  "success": false,
  "error": {
    "code": "AUTHORIZATION_ERROR",
    "message": "You can only view your own team members"
  },
  "meta": {
    "timestamp": "2026-01-28T10:30:00Z"
  }
}
```

---

## Data Model

### Employee Object

| Field | Type | Description |
|-------|------|-------------|
| `id` | uuid | Unique identifier |
| `userId` | uuid | Associated user account ID |
| `employeeCode` | string | Auto-generated employee code |
| `firstName` | string | First name |
| `lastName` | string | Last name |
| `email` | string | Email address |
| `phone` | string | Phone number |
| `jobTitle` | string | Job title |
| `department` | object | Department info |
| `manager` | object | Manager info |
| `hireDate` | date | Date of hire |
| `employmentType` | string | full-time, part-time, contract |
| `status` | string | active, inactive |
| `avatarUrl` | string | Profile image URL |
| `createdAt` | datetime | Creation timestamp |
| `updatedAt` | datetime | Last update timestamp |
