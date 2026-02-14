# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A modern Nuxt 4 application for managing employee performance, goals (OKRs), and reviews. Built with Vue 3, TypeScript, Pinia, Nuxt UI, and Tailwind CSS 4. Uses **Bun** as the package manager.

## Common Commands

```bash
# Development
bun install              # Install dependencies
bun run dev             # Start dev server (http://localhost:3000)
bun run build           # Build for production
bun run preview         # Preview production build

# Code Quality (REQUIRED before finalizing work)
npx nuxi typecheck      # Run TypeScript type checking
npx eslint .            # Run ESLint linting

# Testing
bun run test            # Run all tests (unit + Nuxt)
bun run test:watch      # Run tests in watch mode
bun run test:coverage   # Run tests with coverage report
bun run test:unit       # Run only unit tests (test/unit/)
bun run test:nuxt       # Run only Nuxt integration tests (test/nuxt/)
bun run test:e2e        # Run Playwright E2E tests
bun run test:e2e:ui     # Run E2E tests with Playwright UI
```

## Code Quality Requirements

**IMPORTANT**: Before finalizing any work, ALWAYS run:

```bash
npx nuxi typecheck      # Check TypeScript types
npx eslint .            # Check code style and quality
```

These checks ensure:
- No TypeScript type errors
- Code follows project ESLint rules
- Consistent code style across the codebase

Fix all errors and warnings before completing your work.

## Nuxt UI Components

**CRITICAL**: This project uses **@nuxt/ui v4.4.0**. ALWAYS check the official documentation FIRST before using any component:

- **Documentation**: https://ui.nuxt.com/components
- **Check**: Component names, available props, event handlers, and proper usage patterns
- **Common mistakes to avoid**:
  - Using wrong component names (e.g., `UDropdown` instead of `UDropdownMenu`)
  - Using wrong event handlers (e.g., `click` instead of `onSelect`)
  - Incorrect prop structures (check docs for exact format)

**When working with components**:
1. Visit https://ui.nuxt.com/components/[component-name]
2. Review the component's API, props, events, and examples
3. Use the exact component name, props, and structure from the documentation

## Architecture

### Three-Tier Architecture

```
Frontend (Nuxt 4) → API Gateway (localhost:4000) → Microservices
                                                 ├─ Auth Service
                                                 ├─ Employee Service
                                                 ├─ Goals Service
                                                 └─ Reviews Service
```

- **Frontend**: Nuxt 4 app with file-based routing
- **API Client**: `app/utils/api.ts` - centralized HTTP client with error handling
- **Backend**: API Gateway at `NUXT_PUBLIC_API_GATEWAY_URL` (default: http://localhost:4000)

### Core Layers

**1. Service Layer** (`app/services/`)
- API communication layer using the shared `api` client
- One service per domain: `employee.ts`, `goals.ts`, `reviews.ts`, etc.
- All services return `ApiResponse<T>` format

**2. Store Layer** (`app/stores/`)
- Pinia stores for state management
- **Auto-notification**: All CRUD operations automatically show toast notifications
- Stores: `employee.ts`, `goals.ts`, `reviews.ts`, `review-forms.ts`, `adhoc-reviews.ts`, `department.ts`, `analytics.ts`, `dashboard.ts`, `auth.ts`, `notifications.ts`

**3. Composables** (`app/composables/`)
- Reusable composition functions
- Key composables:
  - `useNotification.ts` - centralized notification system
  - `useAuth.ts` - authentication helpers
  - `useAutoSave.ts` - form auto-save functionality
  - `useUnsavedChanges.ts` - navigation guards for unsaved changes
  - `useBreadcrumbs.ts` - dynamic breadcrumb navigation

### Notification System

**Critical Pattern**: Stores automatically handle notifications for CRUD operations. Components should NOT manually show toast messages for store operations.

```typescript
// ❌ WRONG - Don't do this
const toast = useToast()
try {
  await employeeStore.createEmployee(data)
  toast.add({ title: 'Success', color: 'success' })
} catch {
  toast.add({ title: 'Failed', color: 'error' })
}

// ✅ CORRECT - Store handles notifications
try {
  await employeeStore.createEmployee(data)
  // Success notification shown automatically
} catch {
  // Error notification shown automatically
}
```

**When to use `useNotification()` directly:**
- Custom non-CRUD scenarios (info messages, warnings)
- Business logic notifications (e.g., "Feature coming soon")

**Available methods:**
- `created(entity)`, `updated(entity)`, `deleted(entity)` - CRUD success
- `success(title, description?)` - custom success
- `failed(action, entity, errorType)` - CRUD failures
- `error(message, type?, description?)` - custom errors with types: `validation`, `network`, `server`, `generic`
- `warning(title, description?)`, `info(title, description?)`

### API Error Handling

The `api.ts` client automatically categorizes errors:
- **400** → Validation errors
- **401** → Session expired (auto-logout + redirect)
- **403** → Permission denied
- **404** → Resource not found
- **500+** → Server errors
- **Network errors** → Connection issues

### Authentication

- **Session Management**: Access tokens in memory, refresh tokens in httpOnly cookies
- **Auto-refresh**: Uses httpOnly cookies for secure token refresh
- **Session Timer**: Monitors session expiry, auto-logout on expiration
- **Lockout Protection**: 5 failed attempts = 15-minute lockout
- **Middleware**:
  - `auth.ts` - protects authenticated routes, checks roles
  - `guest.ts` - redirects authenticated users away from auth pages

### Route Structure

File-based routing in `app/pages/`:
- `/` - Dashboard
- `/employees` - Employee list, detail pages, org chart, departments
- `/goals` - Goals & OKRs management
- `/reviews` - Performance reviews
  - `/reviews/cycles` - Review cycles
  - `/reviews/forms` - Form templates
  - `/reviews/adhoc` - Ad-hoc reviews
- `/analytics` - Analytics dashboards (goals, performance, reviews, team)
- `/auth/login`, `/auth/forgot-password`, `/auth/reset-password`
- `/profile`, `/settings`, `/notifications`

## Nuxt 4 Best Practices

### Composable Context Rules

**CRITICAL**: Nuxt composables can ONLY be called in specific contexts:

✅ **Allowed contexts:**
- Inside Vue `<script setup>` blocks
- Inside Nuxt plugins (`plugins/*.ts`)
- Inside Nuxt middleware (`middleware/*.ts`)
- Inside other composables (`composables/*.ts`)

❌ **NOT allowed:**
- Directly in Pinia store actions/getters
- Outside of Vue/Nuxt lifecycle

**Example - WRONG:**
```typescript
// ❌ BAD - Composable in Pinia store
export const useAuthStore = defineStore('auth', {
  actions: {
    async login() {
      const cookie = useCookie('token') // ❌ ERROR!
    }
  }
})
```

**Example - CORRECT:**
```typescript
// ✅ GOOD - Pass cookie from composable
export const useAuthStore = defineStore('auth', {
  actions: {
    async login(credentials, tokenCookie) {
      tokenCookie.value = 'new-token' // ✅ Works!
    }
  }
})

// ✅ GOOD - Composable handles cookie
export function useAuth() {
  const store = useAuthStore()
  const tokenCookie = useCookie('token') // ✅ Valid context

  async function login(credentials) {
    return store.login(credentials, tokenCookie)
  }

  return { login }
}
```

### Auto-Imports

Nuxt auto-imports these without explicit imports:
- Vue functions: `ref`, `computed`, `watch`, `onMounted`, etc.
- Nuxt composables: `useCookie`, `useRoute`, `useRouter`, `navigateTo`, `useState`, etc.
- Components in `components/` directory
- Utils in `utils/` directory

### Preventing Infinite API Loops

**❌ BAD - Reactive watcher that creates infinite loop:**
```vue
<script setup>
const { pagination, fetchEmployees } = useEmployees()

// BAD: fetchEmployees() updates pagination, triggering this watcher again
watch(pagination, () => {
  fetchEmployees() // ❌ Infinite loop!
})
</script>
```

**✅ GOOD - Explicit fetching on user actions:**
```vue
<script setup>
const { pagination, setPage, fetchEmployees } = useEmployees()

// GOOD: Only fetch on mount
onMounted(() => {
  fetchEmployees()
})

// GOOD: Explicit fetch when user changes page
function handlePageChange(page: number) {
  setPage(page) // Store action that calls fetchEmployees() internally
}
</script>
```

**Rules:**
1. Never watch state that your fetch updates (pagination, filters, sort)
2. Put debounced search watchers in composables, not pages
3. Let user actions trigger fetches explicitly
4. Use `onMounted()` for initial fetch only

## TypeScript Types

All types are in `app/types/`:
- `auth.ts` - User, LoginRequest, ApiResponse, ApiError
- `employee.ts` - Employee, EmployeeListItem, EmployeeFilters, etc.
- `goal.ts` - Goal, OKR types
- `review.ts`, `review-form.ts`, `adhoc-review.ts` - Review-related types
- `department.ts`, `analytics.ts`, `dashboard.ts`, `notification.ts`

**API Response Format:**
```typescript
interface ApiResponse<T> {
  success: boolean
  data: T
  meta: {
    timestamp: string
    pagination?: {
      page: number
      per_page: number
      total_items: number
      total_pages: number
    }
  }
}
```

## Environment Configuration

Required environment variable:
```env
NUXT_PUBLIC_API_GATEWAY_URL=http://localhost:4000
```

Access in code:
```typescript
const config = useRuntimeConfig()
const apiUrl = config.public.apiGatewayUrl
```

## Testing

- **Unit tests**: `test/unit/` - Node environment
- **Nuxt tests**: `test/nuxt/` - Nuxt environment with JSDOM
- **E2E tests**: `tests/` - Playwright (Chromium)
- **Coverage**: Vitest with V8 provider

## Key Patterns

1. **Store Operations**: Always use store methods, never bypass stores
2. **Error Handling**: Stores handle errors and notifications automatically
3. **Type Safety**: Use proper TypeScript types from `app/types/`
4. **API Calls**: Always use `api` client from `app/utils/api.ts`
5. **Auto-save**: Forms use `useAutoSave()` for draft persistence
6. **Unsaved Changes**: Forms use `useUnsavedChanges()` for navigation guards

## Component Structure

- `app/components/` - Reusable Vue components organized by feature
- `app/layouts/` - Layout components (default.vue, auth.vue)
- Components follow atomic design principles
- Use Nuxt UI components (@nuxt/ui) for consistency

## Modules & Dependencies

- **@nuxt/ui** - UI component library
- **@pinia/nuxt** - State management
- **chart.js** + **vue-chartjs** - Charts and analytics
- **@vue-flow/** - Org chart visualization
- **@nuxt/test-utils** - Testing utilities
- **Vitest** + **Playwright** - Testing frameworks
