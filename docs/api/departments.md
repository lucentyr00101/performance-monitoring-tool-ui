# Departments API

## Overview

Department management endpoints for organizational structure.

> **Naming Convention:** JSON request/response bodies use camelCase. URL query parameters use snake_case.

**Base Path:** `/departments`

---

## Endpoints

| Method | Endpoint | Description | Auth | Roles |
|--------|----------|-------------|------|-------|
| GET | `/departments` | List all departments | Yes | All |
| GET | `/departments/:id` | Get department by ID | Yes | All |
| POST | `/departments` | Create department | Yes | Admin, HR |
| PUT | `/departments/:id` | Update department | Yes | Admin, HR |
| DELETE | `/departments/:id` | Delete department | Yes | Admin |
| GET | `/departments/:id/employees` | Get department employees | Yes | All |
| GET | `/departments/hierarchy` | Get org hierarchy tree | Yes | All |

---

## GET /departments

List all departments with optional filtering.

### Request

```http
GET /api/v1/departments?status=active
Authorization: Bearer <token>
```

### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `status` | string | Filter: `active`, `inactive` |
| `parent_id` | uuid | Filter by parent department |
| `search` | string | Search by name |

### Response

#### Success (200 OK)

```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440010",
      "name": "Engineering",
      "description": "Software development and engineering",
      "parent": {
        "id": "550e8400-e29b-41d4-a716-446655440020",
        "name": "Technology"
      },
      "manager": {
        "id": "550e8400-e29b-41d4-a716-446655440001",
        "firstName": "John",
        "lastName": "Doe"
      },
      "employeeCount": 25,
      "status": "active"
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440011",
      "name": "Product",
      "description": "Product management and design",
      "parent": {
        "id": "550e8400-e29b-41d4-a716-446655440020",
        "name": "Technology"
      },
      "manager": {
        "id": "550e8400-e29b-41d4-a716-446655440005",
        "firstName": "Sarah",
        "lastName": "Connor"
      },
      "employeeCount": 12,
      "status": "active"
    }
  ],
  "meta": {
    "totalDepartments": 15,
    "timestamp": "2026-01-28T10:30:00Z"
  }
}
```

---

## GET /departments/:id

Get a single department by ID.

### Request

```http
GET /api/v1/departments/550e8400-e29b-41d4-a716-446655440010
Authorization: Bearer <token>
```

### Response

#### Success (200 OK)

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440010",
    "name": "Engineering",
    "description": "Software development and engineering team responsible for building and maintaining all company products.",
    "parent": {
      "id": "550e8400-e29b-41d4-a716-446655440020",
      "name": "Technology"
    },
    "manager": {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@company.com",
      "jobTitle": "VP of Engineering"
    },
    "subDepartments": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440012",
        "name": "Frontend Engineering",
        "employeeCount": 8
      },
      {
        "id": "550e8400-e29b-41d4-a716-446655440013",
        "name": "Backend Engineering",
        "employeeCount": 10
      },
      {
        "id": "550e8400-e29b-41d4-a716-446655440014",
        "name": "DevOps",
        "employeeCount": 5
      }
    ],
    "employeeCount": 25,
    "status": "active",
    "createdAt": "2020-01-15T09:00:00Z",
    "updatedAt": "2026-01-10T14:30:00Z"
  },
  "meta": {
    "timestamp": "2026-01-28T10:30:00Z"
  }
}
```

---

## POST /departments

Create a new department.

### Request

```http
POST /api/v1/departments
Authorization: Bearer <token>
Content-Type: application/json
```

```json
{
  "name": "Data Science",
  "description": "Data science and machine learning team",
  "parentId": "550e8400-e29b-41d4-a716-446655440020",
  "managerId": "550e8400-e29b-41d4-a716-446655440006"
}
```

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Department name (max 100 chars) |
| `description` | string | No | Department description |
| `parentId` | uuid | No | Parent department ID |
| `managerId` | uuid | No | Department manager's employee ID |

### Response

#### Success (201 Created)

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440015",
    "name": "Data Science",
    "description": "Data science and machine learning team",
    "parent": {
      "id": "550e8400-e29b-41d4-a716-446655440020",
      "name": "Technology"
    },
    "manager": {
      "id": "550e8400-e29b-41d4-a716-446655440006",
      "firstName": "Emily",
      "lastName": "Chen"
    },
    "employeeCount": 0,
    "status": "active",
    "createdAt": "2026-01-28T10:30:00Z",
    "updatedAt": "2026-01-28T10:30:00Z"
  },
  "meta": {
    "timestamp": "2026-01-28T10:30:00Z"
  }
}
```

#### Error - Duplicate Name (409)

```json
{
  "success": false,
  "error": {
    "code": "CONFLICT",
    "message": "A department with this name already exists"
  },
  "meta": {
    "timestamp": "2026-01-28T10:30:00Z"
  }
}
```

---

## PUT /departments/:id

Update an existing department.

### Request

```http
PUT /api/v1/departments/550e8400-e29b-41d4-a716-446655440010
Authorization: Bearer <token>
Content-Type: application/json
```

```json
{
  "name": "Software Engineering",
  "description": "Updated description for the engineering team",
  "managerId": "550e8400-e29b-41d4-a716-446655440007"
}
```

### Request Body

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Department name |
| `description` | string | Department description |
| `parentId` | uuid | Parent department ID |
| `managerId` | uuid | Manager's employee ID |
| `status` | string | `active` or `inactive` |

### Response

#### Success (200 OK)

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440010",
    "name": "Software Engineering",
    "description": "Updated description for the engineering team",
    "parent": {
      "id": "550e8400-e29b-41d4-a716-446655440020",
      "name": "Technology"
    },
    "manager": {
      "id": "550e8400-e29b-41d4-a716-446655440007",
      "firstName": "Michael",
      "lastName": "Brown"
    },
    "employeeCount": 25,
    "status": "active",
    "updatedAt": "2026-01-28T10:35:00Z"
  },
  "meta": {
    "timestamp": "2026-01-28T10:35:00Z"
  }
}
```

#### Error - Circular Reference (422)

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Cannot set parent department: this would create a circular reference"
  },
  "meta": {
    "timestamp": "2026-01-28T10:30:00Z"
  }
}
```

---

## DELETE /departments/:id

Delete a department.

### Request

```http
DELETE /api/v1/departments/550e8400-e29b-41d4-a716-446655440015
Authorization: Bearer <token>
```

### Response

#### Success (204 No Content)

No response body.

#### Error - Has Employees (409)

```json
{
  "success": false,
  "error": {
    "code": "CONFLICT",
    "message": "Cannot delete department with employees. Reassign employees first."
  },
  "meta": {
    "timestamp": "2026-01-28T10:30:00Z"
  }
}
```

#### Error - Has Sub-departments (409)

```json
{
  "success": false,
  "error": {
    "code": "CONFLICT",
    "message": "Cannot delete department with sub-departments. Delete or reassign sub-departments first."
  },
  "meta": {
    "timestamp": "2026-01-28T10:30:00Z"
  }
}
```

---

## GET /departments/:id/employees

Get all employees in a department.

### Request

```http
GET /api/v1/departments/550e8400-e29b-41d4-a716-446655440010/employees?include_sub=true
Authorization: Bearer <token>
```

### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `include_sub` | boolean | false | Include employees from sub-departments |
| `status` | string | - | Filter by employee status |
| `page` | integer | 1 | Page number |
| `per_page` | integer | 20 | Items per page |

### Response

#### Success (200 OK)

```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@company.com",
      "jobTitle": "VP of Engineering",
      "status": "active",
      "avatarUrl": "https://cdn.example.com/avatars/john-doe.jpg"
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440003",
      "firstName": "Alice",
      "lastName": "Johnson",
      "email": "alice.johnson@company.com",
      "jobTitle": "Senior Developer",
      "status": "active",
      "avatarUrl": null
    }
  ],
  "meta": {
    "pagination": {
      "page": 1,
      "perPage": 20,
      "totalItems": 25,
      "totalPages": 2
    },
    "timestamp": "2026-01-28T10:30:00Z"
  }
}
```

---

## GET /departments/hierarchy

Get the full organizational hierarchy as a tree structure.

### Request

```http
GET /api/v1/departments/hierarchy
Authorization: Bearer <token>
```

### Response

#### Success (200 OK)

```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440030",
      "name": "Executive",
      "employeeCount": 5,
      "manager": {
        "id": "550e8400-e29b-41d4-a716-446655440099",
        "firstName": "David",
        "lastName": "CEO"
      },
      "children": []
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440020",
      "name": "Technology",
      "employeeCount": 50,
      "manager": {
        "id": "550e8400-e29b-41d4-a716-446655440002",
        "firstName": "Jane",
        "lastName": "Smith"
      },
      "children": [
        {
          "id": "550e8400-e29b-41d4-a716-446655440010",
          "name": "Engineering",
          "employeeCount": 25,
          "manager": {
            "id": "550e8400-e29b-41d4-a716-446655440001",
            "firstName": "John",
            "lastName": "Doe"
          },
          "children": [
            {
              "id": "550e8400-e29b-41d4-a716-446655440012",
              "name": "Frontend Engineering",
              "employeeCount": 8,
              "manager": null,
              "children": []
            },
            {
              "id": "550e8400-e29b-41d4-a716-446655440013",
              "name": "Backend Engineering",
              "employeeCount": 10,
              "manager": null,
              "children": []
            }
          ]
        },
        {
          "id": "550e8400-e29b-41d4-a716-446655440011",
          "name": "Product",
          "employeeCount": 12,
          "manager": {
            "id": "550e8400-e29b-41d4-a716-446655440005",
            "firstName": "Sarah",
            "lastName": "Connor"
          },
          "children": []
        }
      ]
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440040",
      "name": "Human Resources",
      "employeeCount": 8,
      "manager": {
        "id": "550e8400-e29b-41d4-a716-446655440008",
        "firstName": "Lisa",
        "lastName": "HR"
      },
      "children": []
    }
  ],
  "meta": {
    "totalDepartments": 15,
    "maxDepth": 3,
    "timestamp": "2026-01-28T10:30:00Z"
  }
}
```

---

## Data Model

### Department Object

| Field | Type | Description |
|-------|------|-------------|
| `id` | uuid | Unique identifier |
| `name` | string | Department name |
| `description` | string | Department description |
| `parent` | object | Parent department (id, name) |
| `manager` | object | Department manager info |
| `subDepartments` | array | Child departments |
| `employeeCount` | integer | Number of employees |
| `status` | string | active, inactive |
| `createdAt` | datetime | Creation timestamp |
| `updatedAt` | datetime | Last update timestamp |
