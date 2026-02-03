# Performance Monitoring Tool UI

A modern Nuxt 4 application for managing employee performance, goals (OKRs), and reviews. Built with Vue 3, TypeScript, Pinia, Nuxt UI, and Tailwind CSS 4.

## Features

- 🎯 **Goal Management** - Create, track, and manage OKRs
- 📊 **Performance Reviews** - 360° feedback and review cycles
- 👥 **Employee Management** - Comprehensive employee profiles
- 📈 **Analytics Dashboard** - Real-time performance metrics
- 🔔 **Smart Notifications** - Automated toast notifications for all actions
- 🎨 **Modern UI** - Built with Nuxt UI and Tailwind CSS 4

## Quick Start

### Setup

Install dependencies:

```bash
bun install
```

### Development Server

Start the development server on `http://localhost:3000`:

```bash
bun run dev
```

### Testing

```bash
bun run test              # Run all tests
bun run test:coverage     # Run with coverage
bun run test:e2e         # Run E2E tests
```

### Production

Build the application for production:

```bash
bun run build
```

Preview production build:

```bash
bun run preview
```

## Architecture

### Notification System

The application uses a centralized notification system that automatically shows toast notifications for all CRUD operations.

**Key Features:**
- ✅ Automatic notifications from Pinia stores
- ✅ Consistent messaging across the app
- ✅ 4-second auto-dismiss
- ✅ Error categorization (validation, network, server)

**Usage in Components:**

```typescript
// ❌ OLD WAY - Don't do this anymore
const toast = useToast()
try {
  await employeeStore.createEmployee(data)
  toast.add({ title: 'Success', color: 'success' })
} catch {
  toast.add({ title: 'Failed', color: 'error' })
}

// ✅ NEW WAY - Store handles notifications automatically
try {
  await employeeStore.createEmployee(data)
  // Success notification shown automatically
} catch {
  // Error notification shown automatically
}
```

**Custom Notifications:**

For non-CRUD scenarios (info messages, warnings, custom flows):

```typescript
const { success, error, warning, info } = useNotification()

// Success message
success('Data exported successfully')

// Error with type
error('Invalid input', 'validation')

// Info message
info('Feature coming soon', 'This feature is under development')

// Warning
warning('Session expiring', 'Your session will expire in 5 minutes')
```

**Available Notification Methods:**
- `created(entity)` - "Entity created successfully"
- `updated(entity)` - "Entity updated successfully"
- `deleted(entity)` - "Entity deleted successfully"
- `success(title, description?)` - Custom success message
- `failed(action, entity, errorType)` - "Failed to {action} {entity}"
- `error(message, type?, description?)` - Custom error with type
- `warning(title, description?)` - Warning message
- `info(title, description?)` - Info message

**Error Types:**
- `validation` - Client-side or server validation errors
- `network` - Network connectivity issues
- `server` - Server-side errors (500+)
- `generic` - Default error type

### API Error Handling

The API client (`app/utils/api.ts`) automatically categorizes HTTP errors:

- **400** → Validation errors
- **401** → Session expired (auto-logout)
- **403** → Permission denied
- **404** → Resource not found
- **500+** → Server errors
- **Network errors** → Connection issues

### Store Structure

All Pinia stores automatically show notifications:

```
app/stores/
├── employee.ts      # Employee CRUD + notifications
├── goals.ts         # Goals & OKRs + notifications
├── reviews.ts       # Review cycles + notifications
├── review-forms.ts  # Form templates + notifications
├── department.ts    # Departments + notifications
├── adhoc-reviews.ts # Ad-hoc reviews + notifications
└── auth.ts          # Authentication + notifications
```

## Project Structure

```
app/
├── components/       # Vue components
├── composables/      # Composables (including useNotification)
├── layouts/          # Layout components
├── middleware/       # Route middleware
├── pages/           # File-based routing
├── services/        # API service layer
├── stores/          # Pinia stores (with notifications)
├── types/           # TypeScript types
└── utils/           # Utilities (including api.ts)
```

## Environment Variables

```env
NUXT_PUBLIC_API_GATEWAY_URL=http://localhost:4000
```

## Tech Stack

- **Framework:** Nuxt 4 (Vue 3, TypeScript)
- **State Management:** Pinia
- **UI Framework:** Nuxt UI
- **Styling:** Tailwind CSS 4
- **Testing:** Vitest + Playwright
- **Package Manager:** Bun

## Contributing

1. All CRUD operations should use store methods (notifications handled automatically)
2. Only use `useNotification()` for custom scenarios
3. Follow the existing store patterns when adding new features
4. Write tests for new notification scenarios

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.
