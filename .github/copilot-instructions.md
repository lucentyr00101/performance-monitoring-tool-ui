# Copilot Instructions - Performance Monitoring Tool UI

## Project Overview

Employee Performance Monitoring Tool - A Nuxt 4 frontend application for managing employee performance, goals (OKRs), and reviews. Built with Vue 3, TypeScript, Pinia, Nuxt UI, and Tailwind CSS 4.

**Key Characteristic:** This is a **frontend-only repository**. The backend API runs in a separate microservices architecture (see Backend Architecture below).

## Commands

### Development
```bash
bun run dev          # Start dev server (http://localhost:3000)
bun run build        # Production build
bun run preview      # Preview production build
```

### Testing
```bash
bun run test                # Run all tests (unit + Nuxt)
bun run test:unit          # Unit tests only (test/unit/)
bun run test:nuxt          # Nuxt component tests (test/nuxt/)
bun run test:coverage      # Run tests with coverage
bun run test:e2e           # Playwright E2E tests (tests/)
bun run test:e2e:ui        # Playwright with UI
```

### Linting & Type Checking
```bash
bunx eslint .              # Run ESLint
bunx eslint . --fix        # Auto-fix issues
bunx eslint <file>         # Check specific file
bunx nuxi typecheck        # TypeScript type checking
```

**⚠️ IMPORTANT:** Always run and fix ESLint and TypeScript errors before committing code. Zero errors is the standard.

## Code Quality Standards

### ESLint & TypeScript - Zero Tolerance Policy

**Always check and fix ESLint and TypeScript errors before considering work complete.**

```bash
# 1. Check for ESLint errors
bunx eslint .

# 2. Auto-fix what can be fixed
bunx eslint . --fix

# 3. Manually fix remaining errors

# 4. Check TypeScript types
bunx nuxi typecheck

# 5. Verify build succeeds
bun run build
```

**Common ESLint Rules:**
- `@typescript-eslint/no-unused-vars` - Prefix unused vars with `_` (e.g., `_statusCode`)
- `vue/attributes-order` - `class` must come before event handlers (`@submit`, `@click`)
- No `any` types - Use `unknown` with type guards instead

**TypeScript Best Practices:**
- Import types from `app/types/auth.ts` - never inline complex types
- Use proper `NitroFetchOptions` for fetch calls (not `RequestInit`)
- All API errors must match `ApiError` interface error codes

**Pre-Commit Checklist:**
1. ✅ `bunx eslint .` - No errors
2. ✅ `bunx nuxi typecheck` - No type errors  
3. ✅ `bun run build` - Build succeeds
4. ✅ `bun run test:unit` - Tests pass (if modified store/composables)

## Architecture

### Dual API Mode (Development vs Production)

The app operates in **two distinct modes** depending on environment configuration:

**1. Development Mode (Mock API)**
- Used when NO `.env` file exists or service URLs are empty
- API calls route to `server/api/auth/*` (Nuxt server endpoints)
- Mock data from `server/mocks/users.ts`
- **5 test accounts** available (see `server/mocks/README.md`)

**2. Production Mode (External Microservices)**
- Used when `.env` contains service URLs
- API calls route to external Node.js/Express + MongoDB microservices
- Configure via `NUXT_PUBLIC_AUTH_SERVICE_URL`, etc.

**Critical Files:**
- `app/utils/api.ts` - API client that auto-switches between modes
- `nuxt.config.ts` - Runtime config with empty defaults (triggers mock mode)
- `.env.example` - Template for production API configuration

### Backend Architecture (Separate Repository)

The production backend consists of 5 microservices:

| Service | Port | Responsibilities |
|---------|------|-----------------|
| Auth Service | 4001 | Login, logout, token refresh, password reset |
| Employee Service | 4002 | Employee CRUD, departments, org structure |
| Goals Service | 4003 | Goals, OKRs, key results |
| Reviews Service | 4004 | Review cycles, performance reviews |
| Analytics Service | 4005 | Reports, dashboards, metrics |

**Optional API Gateway:** All services can route through a single gateway (configure `NUXT_PUBLIC_API_GATEWAY_URL`).

### Frontend Structure

```
app/
├── types/          # TypeScript interfaces (auth.ts, etc.)
├── utils/          # API client, helpers
├── services/       # API call functions (auth.ts, employees.ts, etc.)
├── stores/         # Pinia stores (auth.ts, etc.)
├── composables/    # Vue composables (useAuth.ts, etc.)
├── middleware/     # Route guards (auth.ts, guest.ts)
├── layouts/        # Layout components (default.vue, auth.vue)
├── pages/          # File-based routes
└── components/     # Reusable components
    └── auth/       # Auto-imports as <AuthLoginForm />
```

**Key Convention:** Components in nested folders auto-import with folder prefix:
- `components/auth/LoginForm.vue` → `<AuthLoginForm />`
- `components/goals/GoalCard.vue` → `<GoalsGoalCard />`

### State Management (Pinia)

**Auth Store (`app/stores/auth.ts`):**
- Access token: In-memory only (Pinia state)
- Refresh token: HTTP-only cookie (7 day expiry)
- Session timeout: 1 hour with 5-minute warning modal
- Account lockout: 5 failed attempts = 15 minute lockout

**Store Actions:**
- `login(credentials)` - Handles lockout logic
- `logout()` - Clears tokens + navigates to login
- `refreshToken()` - Uses refresh cookie to get new access token
- `checkAuth()` - Auto-login on page load if refresh token exists

### API Response Format

All API responses follow this structure (defined in `docs/TSD.md`):

```typescript
// Success
{
  "success": true,
  "data": { ... },
  "meta": { "timestamp": "2026-01-28T..." }
}

// Error
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR" | "AUTHENTICATION_ERROR" | ...,
    "message": "...",
    "details": { ... }
  },
  "meta": { "timestamp": "..." }
}
```

**Error Codes in `app/types/auth.ts`:**
- `VALIDATION_ERROR`, `AUTHENTICATION_ERROR`, `AUTHORIZATION_ERROR`
- `NOT_FOUND`, `CONFLICT`, `RATE_LIMIT_EXCEEDED`, `INTERNAL_ERROR`
- `NETWORK_ERROR`, `INVALID_CREDENTIALS`, `INVALID_TOKEN`, `TOKEN_EXPIRED`

### User Roles & Permissions

Defined in `app/types/auth.ts` via `ROLE_PERMISSIONS`:

| Role | Key Permissions |
|------|----------------|
| `admin` | Full system access (users, settings, employees, reviews, goals, analytics) |
| `hr` | Employee management, reviews, goals, analytics |
| `manager` | Team management, reviews, goals, team analytics |
| `employee` | Own profile, own goals, own reviews |
| `csuite` | Read-only analytics and employee data |

**Permission Helper:**
```typescript
const { hasRole, hasPermission, isManagerOrAbove } = useAuth()
if (hasPermission('employees:write')) { /* ... */ }
```

## Key Conventions

### TypeScript Types

**Always use proper types from `app/types/auth.ts`:**
- Never use `any` - use `unknown` and type guards
- API response types: `ApiResponse<T>`, `ApiError`
- Auth types: `User`, `Employee`, `LoginRequest`, `LoginResponse`

### API Client Usage

**app/utils/api.ts provides typed methods:**
```typescript
// Don't manually construct fetch options
await api.post<LoginResponse>('/auth/login', credentials, {
  skipAuth: true,
  service: 'auth'
})

// The client handles:
// - Bearer token injection
// - 401 auto-refresh with retry
// - Error response parsing
// - Network error handling
```

**Service Parameter:**
- `service: 'auth'` → Routes to auth service
- `service: 'employees'` → Routes to employee service
- Omit for default (auth service)

### Middleware & Route Protection

**app/middleware/auth.ts:**
- Protects authenticated routes
- Redirects to `/auth/login` if not logged in
- Use via `definePageMeta({ middleware: 'auth' })`

**app/middleware/guest.ts:**
- Redirects authenticated users away from auth pages
- Use on login/register pages

### Component Naming

**Nuxt auto-imports components with folder prefixes:**
- Place in `components/[folder]/ComponentName.vue`
- Import as `<FolderComponentName />`
- Example: `components/auth/LoginForm.vue` → `<AuthLoginForm />`

### Icons (Heroicons)

**Installed via `@iconify-json/heroicons`:**
```vue
<UIcon name="i-heroicons-user" />
<UIcon name="i-heroicons-lock-closed" />
```

Browse icons: https://heroicons.com/

### Nuxt UI Components

**Use Nuxt UI v4 components (not custom HTML):**
```vue
<UButton>Click me</UButton>
<UCard>Content</UCard>
<UInput v-model="email" />
<UForm :state="form" :schema="schema" @submit="handleSubmit">
```

**Important:** Always place `class` attribute BEFORE event handlers for ESLint:
```vue
<!-- ✅ Correct -->
<UForm class="space-y-4" @submit.prevent="handleSubmit">

<!-- ❌ Wrong -->
<UForm @submit.prevent="handleSubmit" class="space-y-4">
```

## Documentation Reference

**Comprehensive docs in `docs/` directory:**

| File | Purpose |
|------|---------|
| `docs/BRD.md` | Business requirements, stakeholders, success metrics |
| `docs/TSD.md` | **Technical spec - READ THIS for architecture, DB schema, API format** |
| `docs/prd/01-authentication.md` | Auth feature requirements (implemented) |
| `docs/prd/02-dashboard.md` | Dashboard requirements (not implemented) |
| `docs/prd/03-employees.md` | Employee management (not implemented) |
| `docs/prd/04-goals.md` | Goals & OKRs (not implemented) |
| `docs/prd/05-reviews.md` | Performance reviews (not implemented) |
| `docs/prd/06-analytics.md` | Analytics & reports (not implemented) |
| `docs/api/auth.md` | Auth API endpoint specifications |
| `server/mocks/README.md` | Mock API usage, test accounts |

**When implementing new features:**
1. Read the corresponding PRD in `docs/prd/`
2. Check `docs/TSD.md` for technical constraints
3. Reference `docs/api/` for endpoint contracts

## Common Pitfalls

### Code Quality
- **Always run ESLint and fix all errors** - Zero errors is the standard, not optional
- **Check TypeScript types** - Run `bunx nuxi typecheck` before committing
- **Verify build succeeds** - `bun run build` must complete without errors
- Unused variables must be prefixed with `_` (e.g., `_unusedParam`)

### Environment Configuration
- **Don't add default localhost URLs** to `nuxt.config.ts` - they prevent mock mode
- Empty strings in `runtimeConfig.public.*ServiceUrl` trigger mock mode
- Only create `.env` when connecting to real backend

### Server-Side Code
- **Never use `~/server/...` imports** in `server/` directory files
- Use relative paths: `../../mocks/users`
- `h3` provides its own `createError` - don't create custom ones

### Component Auto-Import
- Nested components require folder prefix: `<AuthLoginForm />` not `<LoginForm />`
- Place shared components in `components/` root for unprefixed import

### API Error Handling
- Always catch errors from `api.*` methods
- Check for `ApiError` type (has `error.code` and `error.message`)
- Display user-friendly messages from `error.message`

### Authentication Flow
- Access token is in-memory (lost on page refresh)
- `checkAuth()` runs on mount to restore session via refresh token
- Don't manually manage tokens - use auth store actions

## Test Credentials (Mock Mode)

| Email | Password | Role |
|-------|----------|------|
| admin@company.com | Admin123 | admin |
| hr@company.com | Hr123456 | hr |
| manager@company.com | Manager123 | manager |
| employee@company.com | Employee123 | employee |
| ceo@company.com | Ceo12345 | csuite |

## Current Implementation Status

**✅ Completed:**
- Authentication & Authorization module (login, logout, password reset)
- Route protection middleware
- Pinia auth store with lockout logic
- Mock API for development
- Dark theme layouts (auth + default with sidebar)
- Session timeout warnings

**⏳ Not Implemented:**
- Dashboard (placeholder only)
- Employee management
- Goals & OKRs
- Performance reviews
- Analytics & reports

See `docs/prd/` for feature specifications when implementing these modules.
