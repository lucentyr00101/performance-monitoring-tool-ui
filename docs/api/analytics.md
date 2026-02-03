# Analytics API

## Overview

Analytics and reporting endpoints for performance insights and metrics.

**Base Path:** `/analytics`

---

## Endpoints

| Method | Endpoint | Description | Auth | Roles |
|--------|----------|-------------|------|-------|
| GET | `/analytics/dashboard` | Dashboard metrics | Yes | All |
| GET | `/analytics/goals` | Goal analytics | Yes | Manager+ |
| GET | `/analytics/reviews` | Review analytics | Yes | Manager+ |
| GET | `/analytics/team/:id` | Team performance | Yes | Manager+ |
| GET | `/analytics/department/:id` | Department metrics | Yes | Manager+ |
| GET | `/analytics/export` | Export report data | Yes | HR+ |

---

## GET /analytics/dashboard

Get role-specific dashboard metrics.

### Request

```http
GET /api/v1/analytics/dashboard
Authorization: Bearer <token>
```

### Response - Employee View

```json
{
  "success": true,
  "data": {
    "userRole": "employee",
    "overview": {
      "activeGoals": 3,
      "completedGoals": 5,
      "pendingReviews": 1,
      "averageGoalProgress": 65
    },
    "goalsSummary": {
      "total": 8,
      "byStatus": {
        "active": 3,
        "completed": 5,
        "draft": 0
      },
      "upcomingDeadlines": [
        {
          "id": "550e8400-e29b-41d4-a716-446655440101",
          "title": "Complete AWS certification",
          "dueDate": "2026-02-28",
          "progress": 80,
          "daysRemaining": 31
        }
      ]
    },
    "reviewsSummary": {
      "pendingSelfAssessments": 1,
      "recentReviews": [
        {
          "id": "550e8400-e29b-41d4-a716-446655440200",
          "cycleName": "Q4 2025 Performance Review",
          "rating": 4.5,
          "status": "acknowledged"
        }
      ]
    },
    "notifications": {
      "unreadCount": 3,
      "recent": [
        {
          "id": "550e8400-e29b-41d4-a716-446655440400",
          "type": "review_reminder",
          "title": "Self-assessment due soon",
          "message": "Your Q1 2026 self-assessment is due in 3 days",
          "createdAt": "2026-01-28T08:00:00Z"
        }
      ]
    }
  },
  "meta": {
    "timestamp": "2026-01-28T10:30:00Z"
  }
}
```

### Response - Manager View

```json
{
  "success": true,
  "data": {
    "userRole": "manager",
    "overview": {
      "directReports": 5,
      "teamActiveGoals": 12,
      "pendingReviewsToComplete": 3,
      "teamAvgGoalProgress": 58
    },
    "teamSummary": {
      "members": 5,
      "byStatus": {
        "onTrack": 4,
        "atRisk": 1,
        "needsAttention": 0
      }
    },
    "goalsSummary": {
      "teamGoals": {
        "total": 12,
        "active": 8,
        "completedThisQuarter": 4,
        "averageProgress": 58
      },
      "personalGoals": {
        "active": 2,
        "averageProgress": 70
      }
    },
    "reviewsSummary": {
      "pendingToComplete": 3,
      "completedThisCycle": 2,
      "teamAverageRating": 4.2
    },
    "quickActions": [
      {
        "type": "review_pending",
        "title": "Complete review for Alice Johnson",
        "link": "/reviews/550e8400-e29b-41d4-a716-446655440201"
      },
      {
        "type": "goal_overdue",
        "title": "Bob's goal is overdue",
        "link": "/goals/550e8400-e29b-41d4-a716-446655440102"
      }
    ]
  },
  "meta": {
    "timestamp": "2026-01-28T10:30:00Z"
  }
}
```

### Response - HR/Admin View

```json
{
  "success": true,
  "data": {
    "userRole": "hr",
    "overview": {
      "totalEmployees": 156,
      "activeReviewCycles": 1,
      "organizationGoalCompletion": 72,
      "reviewCompletionRate": 94.5
    },
    "employeesSummary": {
      "total": 156,
      "byStatus": {
        "active": 150,
        "inactive": 6
      },
      "newThisMonth": 3,
      "departuresThisMonth": 1
    },
    "goalsSummary": {
      "organizationWide": {
        "totalActive": 245,
        "averageProgress": 62,
        "byType": {
          "individual": 180,
          "team": 45,
          "department": 15,
          "company": 5
        }
      }
    },
    "reviewsSummary": {
      "activeCycle": {
        "id": "550e8400-e29b-41d4-a716-446655440301",
        "name": "Q1 2026 Performance Review",
        "completionRate": 45,
        "daysRemaining": 62
      },
      "organizationAverageRating": 3.9
    },
    "departmentsOverview": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440010",
        "name": "Engineering",
        "employeeCount": 25,
        "goalCompletion": 68,
        "avgReviewRating": 4.1
      },
      {
        "id": "550e8400-e29b-41d4-a716-446655440011",
        "name": "Product",
        "employeeCount": 12,
        "goalCompletion": 75,
        "avgReviewRating": 4.0
      }
    ]
  },
  "meta": {
    "timestamp": "2026-01-28T10:30:00Z"
  }
}
```

---

## GET /analytics/goals

Get organization-wide goal analytics.

### Request

```http
GET /api/v1/analytics/goals?period=quarter&year=2026&quarter=1
Authorization: Bearer <token>
```

### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `period` | string | `month`, `quarter`, `year` |
| `year` | integer | Year (e.g., 2026) |
| `quarter` | integer | Quarter (1-4) |
| `month` | integer | Month (1-12) |
| `department_id` | uuid | Filter by department |

### Response

#### Success (200 OK)

```json
{
  "success": true,
  "data": {
    "period": {
      "type": "quarter",
      "year": 2026,
      "quarter": 1,
      "startDate": "2026-01-01",
      "endDate": "2026-03-31"
    },
    "summary": {
      "totalGoals": 245,
      "completed": 45,
      "active": 180,
      "cancelled": 20,
      "completionRate": 18.4,
      "averageProgress": 42
    },
    "byType": [
      { "type": "individual", "count": 180, "completionRate": 22, "avgProgress": 45 },
      { "type": "team", "count": 45, "completionRate": 15, "avgProgress": 38 },
      { "type": "department", "count": 15, "completionRate": 10, "avgProgress": 35 },
      { "type": "company", "count": 5, "completionRate": 0, "avgProgress": 30 }
    ],
    "byDepartment": [
      { "department": "Engineering", "total": 65, "completionRate": 25, "avgProgress": 48 },
      { "department": "Product", "total": 35, "completionRate": 20, "avgProgress": 42 },
      { "department": "Sales", "total": 50, "completionRate": 18, "avgProgress": 40 },
      { "department": "Marketing", "total": 30, "completionRate": 15, "avgProgress": 38 }
    ],
    "trends": {
      "monthly": [
        { "month": "2026-01", "created": 80, "completed": 15, "avgProgress": 25 },
        { "month": "2026-02", "created": 45, "completed": 20, "avgProgress": 38 },
        { "month": "2026-03", "created": 30, "completed": 10, "avgProgress": 42 }
      ]
    },
    "topPerformers": [
      {
        "employee": { "id": "uuid", "name": "Alice Johnson", "department": "Engineering" },
        "goalsCompleted": 4,
        "avgCompletionTimeDays": 25
      },
      {
        "employee": { "id": "uuid", "name": "Bob Williams", "department": "Product" },
        "goalsCompleted": 3,
        "avgCompletionTimeDays": 30
      }
    ]
  },
  "meta": {
    "timestamp": "2026-01-28T10:30:00Z"
  }
}
```

---

## GET /analytics/reviews

Get review cycle analytics.

### Request

```http
GET /api/v1/analytics/reviews?cycle_id=uuid
Authorization: Bearer <token>
```

### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `cycle_id` | uuid | Specific review cycle (optional) |
| `year` | integer | Filter by year |

### Response

#### Success (200 OK)

```json
{
  "success": true,
  "data": {
    "cycle": {
      "id": "550e8400-e29b-41d4-a716-446655440300",
      "name": "Q4 2025 Performance Review",
      "status": "completed"
    },
    "summary": {
      "totalReviews": 150,
      "completed": 142,
      "pending": 8,
      "completionRate": 94.67,
      "averageRating": 3.85,
      "ratingDistribution": {
        "1": 2,
        "2": 8,
        "3": 45,
        "4": 65,
        "5": 30
      }
    },
    "byType": [
      { "type": "self", "total": 75, "completed": 72, "avgRating": 3.9 },
      { "type": "manager", "total": 75, "completed": 70, "avgRating": 3.8 }
    ],
    "byDepartment": [
      {
        "department": "Engineering",
        "total": 50,
        "completed": 48,
        "completionRate": 96,
        "avgRating": 4.1
      },
      {
        "department": "Product",
        "total": 24,
        "completed": 24,
        "completionRate": 100,
        "avgRating": 3.9
      },
      {
        "department": "Sales",
        "total": 40,
        "completed": 36,
        "completionRate": 90,
        "avgRating": 3.7
      }
    ],
    "timeline": {
      "dailyCompletions": [
        { "date": "2025-12-01", "completed": 5 },
        { "date": "2025-12-02", "completed": 12 },
        { "date": "2025-12-03", "completed": 18 }
      ]
    },
    "categoriesBreakdown": {
      "technicalSkills": { "avg": 4.0, "distribution": { "1": 1, "2": 5, "3": 20, "4": 50, "5": 66 } },
      "communication": { "avg": 3.8, "distribution": { "1": 2, "2": 8, "3": 30, "4": 55, "5": 47 } },
      "teamwork": { "avg": 3.9, "distribution": { "1": 1, "2": 6, "3": 25, "4": 58, "5": 52 } }
    }
  },
  "meta": {
    "timestamp": "2026-01-28T10:30:00Z"
  }
}
```

---

## GET /analytics/team/:id

Get team performance analytics for a manager.

### Request

```http
GET /api/v1/analytics/team/550e8400-e29b-41d4-a716-446655440001
Authorization: Bearer <token>
```

### Response

#### Success (200 OK)

```json
{
  "success": true,
  "data": {
    "manager": {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "name": "John Doe",
      "jobTitle": "Engineering Manager"
    },
    "teamSize": 5,
    "summary": {
      "totalActiveGoals": 12,
      "avgGoalProgress": 58,
      "goalsCompletedThisQuarter": 4,
      "pendingReviews": 2,
      "teamAvgRating": 4.2
    },
    "members": [
      {
        "employee": {
          "id": "550e8400-e29b-41d4-a716-446655440003",
          "name": "Alice Johnson",
          "jobTitle": "Senior Developer",
          "avatarUrl": null
        },
        "goals": {
          "active": 3,
          "completed": 2,
          "avgProgress": 75
        },
        "latestReview": {
          "rating": 4.5,
          "cycle": "Q4 2025"
        },
        "status": "onTrack"
      },
      {
        "employee": {
          "id": "550e8400-e29b-41d4-a716-446655440004",
          "name": "Bob Williams",
          "jobTitle": "Software Engineer",
          "avatarUrl": "https://cdn.example.com/bob.jpg"
        },
        "goals": {
          "active": 2,
          "completed": 1,
          "avgProgress": 45
        },
        "latestReview": {
          "rating": 3.8,
          "cycle": "Q4 2025"
        },
        "status": "atRisk"
      }
    ],
    "goalsByStatus": {
      "active": 8,
      "completed": 4,
      "overdue": 1
    },
    "performanceTrend": [
      { "period": "Q2 2025", "avgRating": 3.9, "goalCompletion": 70 },
      { "period": "Q3 2025", "avgRating": 4.0, "goalCompletion": 75 },
      { "period": "Q4 2025", "avgRating": 4.2, "goalCompletion": 80 }
    ]
  },
  "meta": {
    "timestamp": "2026-01-28T10:30:00Z"
  }
}
```

---

## GET /analytics/department/:id

Get department performance analytics.

### Request

```http
GET /api/v1/analytics/department/550e8400-e29b-41d4-a716-446655440010
Authorization: Bearer <token>
```

### Response

#### Success (200 OK)

```json
{
  "success": true,
  "data": {
    "department": {
      "id": "550e8400-e29b-41d4-a716-446655440010",
      "name": "Engineering",
      "manager": {
        "id": "550e8400-e29b-41d4-a716-446655440001",
        "name": "John Doe"
      }
    },
    "employeeCount": 25,
    "summary": {
      "totalGoals": 65,
      "goalCompletionRate": 68,
      "avgGoalProgress": 58,
      "reviewCompletionRate": 96,
      "avgReviewRating": 4.1
    },
    "subDepartments": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440012",
        "name": "Frontend Engineering",
        "employeeCount": 8,
        "goalCompletion": 72,
        "avgRating": 4.2
      },
      {
        "id": "550e8400-e29b-41d4-a716-446655440013",
        "name": "Backend Engineering",
        "employeeCount": 10,
        "goalCompletion": 65,
        "avgRating": 4.0
      },
      {
        "id": "550e8400-e29b-41d4-a716-446655440014",
        "name": "DevOps",
        "employeeCount": 5,
        "goalCompletion": 70,
        "avgRating": 4.1
      }
    ],
    "goalsBreakdown": {
      "byType": [
        { "type": "individual", "count": 45, "avgProgress": 60 },
        { "type": "team", "count": 15, "avgProgress": 55 },
        { "type": "department", "count": 5, "avgProgress": 50 }
      ],
      "byStatus": {
        "active": 40,
        "completed": 20,
        "cancelled": 5
      }
    },
    "reviewsBreakdown": {
      "avgRating": 4.1,
      "byCategory": {
        "technicalSkills": 4.3,
        "communication": 3.9,
        "teamwork": 4.0,
        "problemSolving": 4.2
      }
    },
    "trend": [
      { "quarter": "Q1 2025", "goalCompletion": 60, "avgRating": 3.8 },
      { "quarter": "Q2 2025", "goalCompletion": 65, "avgRating": 3.9 },
      { "quarter": "Q3 2025", "goalCompletion": 68, "avgRating": 4.0 },
      { "quarter": "Q4 2025", "goalCompletion": 72, "avgRating": 4.1 }
    ]
  },
  "meta": {
    "timestamp": "2026-01-28T10:30:00Z"
  }
}
```

---

## GET /analytics/export

Export analytics data as downloadable file.

### Request

```http
GET /api/v1/analytics/export?type=goals&format=csv&period=quarter&year=2026&quarter=1
Authorization: Bearer <token>
```

### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `type` | string | Yes | `goals`, `reviews`, `employees` |
| `format` | string | No | `csv`, `xlsx`, `pdf` (default: csv) |
| `period` | string | No | `month`, `quarter`, `year` |
| `year` | integer | No | Year |
| `quarter` | integer | No | Quarter (1-4) |
| `department_id` | uuid | No | Filter by department |

### Response

#### Success (200 OK)

```json
{
  "success": true,
  "data": {
    "downloadUrl": "https://api.example.com/downloads/report-abc123.csv",
    "expiresAt": "2026-01-28T11:30:00Z",
    "fileName": "goals-report-q1-2026.csv",
    "fileSize": "125KB",
    "recordCount": 245
  },
  "meta": {
    "timestamp": "2026-01-28T10:30:00Z"
  }
}
```

---

## Data Notes

### Performance Status

| Status | Description | Criteria |
|--------|-------------|----------|
| `onTrack` | Employee performing well | Goals > 50% progress, positive reviews |
| `atRisk` | May need attention | Goals < 30% progress or overdue |
| `needsAttention` | Requires immediate intervention | Multiple overdue goals, low ratings |

### Time Periods

| Period | Description |
|--------|-------------|
| `month` | Single month data |
| `quarter` | Q1 (Jan-Mar), Q2 (Apr-Jun), Q3 (Jul-Sep), Q4 (Oct-Dec) |
| `year` | Full calendar year |

### Rate Limiting

Analytics endpoints are rate-limited to prevent abuse:
- Dashboard: 60 requests/minute
- Export: 10 requests/hour
