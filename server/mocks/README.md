# Mock API Endpoints

This directory contains mock data and response templates for development and testing.

**⚠️ TEMPORARY - Remove these files when the real API is ready**

## How it Works

The application automatically uses these mock endpoints when:
- No `.env` file exists OR
- No external service URLs are configured in `.env`

When external service URLs are configured (e.g., `NUXT_PUBLIC_AUTH_SERVICE_URL`), the app will call those real APIs instead.

## Files

- **`users.ts`** - Mock user database with 5 test accounts
- **`responses.ts`** - Response builder functions matching the TSD API format

## Test Accounts

| Email | Password | Role |
|-------|----------|------|
| admin@company.com | Admin123 | admin |
| hr@company.com | Hr123456 | hr |
| manager@company.com | Manager123 | manager |
| employee@company.com | Employee123 | employee |
| ceo@company.com | Ceo12345 | csuite |

## Mock Endpoints

All endpoints are under `/api/auth/`:

- **POST** `/api/auth/login` - User login
- **POST** `/api/auth/logout` - User logout  
- **POST** `/api/auth/refresh` - Refresh access token
- **POST** `/api/auth/forgot-password` - Request password reset
- **POST** `/api/auth/reset-password` - Reset password with token
- **GET** `/api/auth/me` - Get current user

## Response Format

All responses follow the TSD standard:

```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "timestamp": "2026-01-28T05:00:00.000Z"
  }
}
```

## Switching to Real API

To use the real microservices API:

1. Copy `.env.example` to `.env`
2. Configure the service URLs:
   ```bash
   # Option 1: Use API Gateway
   NUXT_PUBLIC_API_GATEWAY_URL=https://api.yourdomain.com
   
   # Option 2: Use individual services
   NUXT_PUBLIC_AUTH_SERVICE_URL=http://localhost:4001
   NUXT_PUBLIC_EMPLOYEE_SERVICE_URL=http://localhost:4002
   NUXT_PUBLIC_GOALS_SERVICE_URL=http://localhost:4003
   NUXT_PUBLIC_REVIEWS_SERVICE_URL=http://localhost:4004
   NUXT_PUBLIC_ANALYTICS_SERVICE_URL=http://localhost:4005
   ```

3. Delete the `server/mocks/` and `server/api/` directories

## Token Storage

- **Access tokens** are stored in-memory (Map) and expire after 1 hour
- **Refresh tokens** are stored in-memory (Map) and expire after 7 days
- All tokens are lost on server restart (in-memory only)

In production, these would be stored in a real database (MongoDB).
