# Performance Monitoring Tool UI - Project Assessment

> Comprehensive audit of disconnected parts, missing features, bugs, and required improvements.
> Date: 2026-02-07

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Architecture Overview](#2-architecture-overview)
3. [Critical Disconnections (Broken Workflows)](#3-critical-disconnections-broken-workflows)
4. [Missing Features Required for Core Functionality](#4-missing-features-required-for-core-functionality)
5. [Bugs and Code Issues](#5-bugs-and-code-issues)
6. [Missing Pages and Navigation Gaps](#6-missing-pages-and-navigation-gaps)
7. [Data Flow and Integration Issues](#7-data-flow-and-integration-issues)
8. [Security Concerns](#8-security-concerns)
9. [UX/UI Gaps](#9-uxui-gaps)
10. [Recommended Enhancements](#10-recommended-enhancements)
11. [Priority Matrix](#11-priority-matrix)

---

## 1. Executive Summary

The application is a **Nuxt 4 + Vue 3** SPA with **Pinia** state management, **Nuxt UI** component library, and a service layer expecting an external **API Gateway** at `localhost:4000`. The project has a well-structured type system, clean separation of services/stores/composables, and comprehensive type definitions.

However, the app has **several critical disconnections** that prevent the core review workflow from functioning end-to-end. Most importantly, the self-review and manager-review submission flows are **stubbed with fake `setTimeout` calls** instead of actual API calls, and there is **no notification service/store** despite having full notification types defined. The core HR-triggered review workflow (trigger -> notify -> self-review -> manager-review -> acknowledge) is only partially connected.

---

## 2. Architecture Overview

| Layer | Technology | Status |
|-------|-----------|--------|
| Framework | Nuxt 4.3, Vue 3.5 | Configured |
| State | Pinia 3 | 9 stores implemented |
| UI | Nuxt UI 4.4, TailwindCSS 4 | Configured |
| API Client | Custom `ApiClient` class (`utils/api.ts`) | Implemented |
| Auth | JWT + Refresh Token (cookie-based) | Implemented |
| Routing | File-based (Nuxt pages) | 29 pages |
| Charts | Chart.js + vue-chartjs | Configured |
| Roles | admin, hr, manager, employee, csuite | Defined |

---

## 3. Critical Disconnections (Broken Workflows)

### 3.1. CRITICAL: Self-Review Submission is Fake (Not Connected to API)

**File:** `app/pages/reviews/adhoc/[id]/self-review.vue:45-69`

```typescript
// In a real app, this would call the API with _responses
// For now, simulate a successful submission
await new Promise(resolve => setTimeout(resolve, 1000))
```

**Impact:** The self-review form UI is fully built (`SelfReviewForm.vue`), but when an employee clicks "Submit Self-Review", it does **nothing** - it uses a `setTimeout` to fake success. There is no API call to persist the answers. Same issue for "Save Draft" (`lines 72-91`).

**What's needed:**
- An API endpoint in `adhoc-reviews` service: `PUT /api/v1/adhoc-reviews/:id/self-review`
- A store action: `submitSelfReview(reviewId, answers)` and `saveSelfReviewDraft(reviewId, answers)`
- Wire the page's `handleSubmit` and `handleSaveDraft` to actual store actions

---

### 3.2. CRITICAL: Manager Review Submission is Fake (Not Connected to API)

**File:** `app/pages/reviews/adhoc/[id]/manager-review.vue:47-71`

Same issue as self-review. The `handleSubmit` and `handleSaveDraft` functions use `setTimeout` instead of real API calls.

**What's needed:**
- An API endpoint: `PUT /api/v1/adhoc-reviews/:id/manager-review`
- Store actions: `submitManagerReview(reviewId, answers, sectionComments, overallComments)` and `saveManagerReviewDraft(...)`

---

### 3.3. CRITICAL: No Notification Service or Store Exists

**Types defined:** `app/types/notification.ts` - Comprehensive notification types including `NotificationState`, `NotificationListParams`, API response types, and a helper `createAdhocReviewNotification()`.

**Missing entirely:**
- `app/services/notifications.ts` - No notification API service
- `app/stores/notifications.ts` - No notification Pinia store
- `app/composables/useNotifications.ts` - No notification composable (note: `useNotification.ts` exists but it's for toast messages, NOT for the in-app notification system)

**Impact:** Notifications are defined in types and referenced by the dashboard `NotificationWidget.vue`, but there is **no way to fetch, mark as read, or manage notifications**. The entire notification pipeline is disconnected:
- HR triggers a review -> backend supposedly sends notifications -> **frontend has no way to receive or display them**
- The `NotificationWidget` receives `notifications` as a prop from the dashboard, meaning it depends on the dashboard API to bundle notifications - but there's no standalone notification management

---

### 3.4. CRITICAL: Acknowledgment Flow Has No Action Handler

**File:** `app/pages/reviews/adhoc/[id]/index.vue:333-336`

```html
<UButton color="primary">
  View Results & Acknowledge
</UButton>
```

The "View Results & Acknowledge" button has **no `@click` handler** and **no navigation target**. There is also **no acknowledgment page/modal** for the ad-hoc review flow.

**Note:** The cycle-based review store has `acknowledgeReview()` action (`stores/reviews.ts:418`), but this is not connected to the ad-hoc review flow. There is no equivalent `acknowledgeAdhocReview()` in the adhoc-reviews store or service.

---

### 3.5. CRITICAL: Ad-Hoc Review Status Transitions Not Automated

When both self-review and manager-review are submitted, the ad-hoc review should transition from `initiated` -> `pending_acknowledgment`. This transition is **not triggered from the frontend** after submission. The frontend relies on the backend to handle this, but since submissions are faked (`setTimeout`), the status never changes.

---

## 4. Missing Features Required for Core Functionality

### 4.1. No Notifications Page

The sidebar navigation references no notifications link. The `NotificationWidget` has a "View All" link (`viewAllLink` prop), but there is **no `/notifications` page** to navigate to. Users have no way to see a full list of notifications, filter them, or mark them as read in bulk.

### 4.2. No Profile Page

**File:** `app/layouts/default.vue:31-34` - The user dropdown menu includes a "Profile" link to `/profile`, but there is **no `app/pages/profile.vue` or `app/pages/profile/index.vue`**. This will result in a 404.

### 4.3. No Settings Page

**File:** `app/layouts/default.vue:19` - Navigation includes a "Settings" link for admin users pointing to `/settings`, but there is **no `app/pages/settings/` directory or page**. This will result in a 404.

### 4.4. No Ad-Hoc Review Results/Summary Page

After both reviews are submitted and the employee acknowledges, there should be a consolidated results view showing:
- Side-by-side comparison of self-review vs manager evaluation
- Rating discrepancies highlighted
- Overall assessment summary

This page does not exist. The "View Results & Acknowledge" button has nowhere to go.

### 4.5. No Notification Service for Fetching/Managing Notifications

API endpoints needed but not implemented in the service layer:
- `GET /api/v1/notifications` - List notifications
- `PUT /api/v1/notifications/:id/read` - Mark as read
- `PUT /api/v1/notifications/read-all` - Mark all as read
- `GET /api/v1/notifications/counts` - Get unread counts

### 4.6. Review Cycle "New Cycle" Page Missing Key Functionality

**File:** `app/pages/reviews/cycles/new.vue` exists but the cycle creation flow does not connect review forms to cycles. When creating a cycle, there's no form selection to specify which review form template employees should fill out.

### 4.7. No Real-Time Notification Delivery

There is no WebSocket, SSE, or polling mechanism for real-time notification delivery. When HR triggers a review, the employee/manager won't see it until they manually refresh the dashboard or navigate to the reviews page.

### 4.8. No KPI Definition/Management Module

The app is described as a "KPI metrics" monitoring tool, but there is **no dedicated KPI definition module**. KPIs are loosely connected through goals and review ratings, but there's no:
- KPI template definition (e.g., "Customer Satisfaction Score", "Code Quality Index")
- KPI target assignment per employee/role/department
- KPI tracking dashboard showing actual vs target
- KPI scoring that feeds into the review process

---

## 5. Bugs and Code Issues

### 5.1. User Identity Check Compares Wrong Fields

**File:** `app/pages/reviews/adhoc/[id]/index.vue:23-24`

```typescript
const isEmployee = computed(() => review.value?.employee.id === currentUser.value?.id)
const isManager = computed(() => review.value?.manager.id === currentUser.value?.id)
```

This compares `review.employee.id` (which is the **employee entity ID**) with `currentUser.id` (which is the **user account ID**). These are different entities - a User has an Employee, and their IDs are different. Should be:

```typescript
const isEmployee = computed(() => review.value?.employee.id === currentUser.value?.employee?.id)
```

This same bug exists in:
- `app/pages/reviews/adhoc/[id]/self-review.vue:24`
- `app/pages/reviews/adhoc/[id]/manager-review.vue:24`

### 5.2. Convenience Methods Don't Filter by Current User

**File:** `app/services/adhoc-reviews.ts:94-107`

```typescript
async getMyPendingSelfReviews() {
  return this.listAdhocReviews({ status: 'initiated' })
}
async getMyPendingManagerReviews() {
  return this.listAdhocReviews({ status: 'initiated' })
}
```

Both methods return **all** initiated reviews, not just those for the current user. They should pass `employeeId` or `managerId` parameters to filter results.

### 5.3. Non-Null Assertion on Potentially Null Data

**File:** `app/pages/index.vue:107-108`

```html
<DashboardEmployeeDashboard
  v-if="userRole === 'employee'"
  :data="employeeData!"     <!-- Non-null assertion on potentially null -->
```

The `employeeData` computed property can return `null`, but the template uses `!` (non-null assertion). If the dashboard data hasn't loaded yet, this will pass `null` as a non-null prop, potentially causing runtime errors in child components.

### 5.4. `useAuthStore` Direct Import in `api.ts` Utility

**File:** `app/utils/api.ts:36-37`

```typescript
private getAccessToken(): string | null {
  if (import.meta.server) return null
  const authStore = useAuthStore()
```

Calling `useAuthStore()` inside a utility class (not inside a Vue component or composable context) may fail when Pinia hasn't been initialized. This works in practice because `$fetch` is only called client-side after Nuxt boot, but it's fragile.

### 5.5. Dashboard Store `lastRefreshedText` Getter is Not Reactive to Time

**File:** `app/stores/dashboard.ts:77-85`

The `lastRefreshedText` getter computes relative time ("5m ago"), but it uses `Date.now()` which doesn't trigger Vue reactivity updates. The displayed time will be stale until the next state change.

### 5.6. Session Timer Uses `setInterval` at Module Level

**File:** `app/stores/auth.ts:15`

```typescript
let sessionTimerInterval: ReturnType<typeof setInterval> | null = null
```

The session timer variable is declared at module scope. In SSR or during hot module replacement, this could leak intervals or create duplicate timers.

### 5.7. NotificationWidget Uses Different Type Than Notification System

**File:** `app/components/dashboard/NotificationWidget.vue:2`

```typescript
import type { NotificationItem } from '~/types/dashboard'
```

The widget uses `NotificationItem` from `dashboard.ts`, not from `notification.ts`. These are **different types** with different fields:
- `dashboard.NotificationItem` has: `type: 'review_reminder' | 'goal_update' | 'feedback' | 'approval' | 'system'`, `isRead`, `link`
- `notification.Notification` has: `type: 'adhoc_review_triggered' | 'self_review_due' | ...`, `status: 'unread' | 'read'`, `actions[]`

These type systems are incompatible, meaning the notification widget cannot display notifications from the notification system.

### 5.8. Missing `v-else` Chain in Manager Review Page

**File:** `app/pages/reviews/adhoc/[id]/manager-review.vue:136-167`

The template uses `v-else-if` for the "self-review not complete warning" and the "view mode notice", but the first condition (`v-else-if="review && !canView"`) should prevent rendering the form. However, because the warning for incomplete self-review and the form are not in a proper `v-if/v-else-if/v-else` chain, both the warning AND the form can render simultaneously. The warning about incomplete self-review should be informational but shouldn't block the form - which is correct, but the `v-else-if` chain makes it so only ONE of the three states (access denied, warning, view mode) shows.

---

## 6. Missing Pages and Navigation Gaps

| Referenced Route | Source | Status |
|-----------------|--------|--------|
| `/profile` | `layouts/default.vue:32` | **MISSING** - 404 |
| `/settings` | `layouts/default.vue:19` | **MISSING** - 404 |
| `/notifications` | Expected from NotificationWidget "View All" | **MISSING** |
| `/reviews/adhoc/:id/results` | Expected for acknowledgment flow | **MISSING** |
| `/reviews/adhoc/:id/acknowledge` | Expected from "View Results & Acknowledge" button | **MISSING** |

---

## 7. Data Flow and Integration Issues

### 7.1. No Review Form Snapshot Handling for Ad-Hoc Reviews

When an ad-hoc review is triggered, the review form should be "snapshotted" (frozen version stored with the review). The `AdhocReview` type has `formSnapshot` field, and the `SelfReviewForm.vue` reads `review.formSnapshot.sections`. However:
- The trigger request (`TriggerAdhocReviewRequest`) sends `review_form_id` but doesn't include form content
- The backend is expected to snapshot the form, but there's no verification or retry logic if the snapshot is missing
- If `formSnapshot` is undefined/null, `SelfReviewForm.vue` will crash trying to iterate `formSnapshot.sections`

### 7.2. Cycle-Based Reviews vs Ad-Hoc Reviews Are Separate Systems

The codebase has two parallel review systems:
1. **Cycle-based reviews** (`stores/reviews.ts`, `services/reviews.ts`) - with full CRUD, submission, and acknowledgment
2. **Ad-hoc reviews** (`stores/adhoc-reviews.ts`, `services/adhoc-reviews.ts`) - with triggering, cancellation, and reminders

These systems share types (`ReviewEmployeeSummary`) but are otherwise disconnected:
- Review cycles have their own submission flow (`reviewsService.updateReview`)
- Ad-hoc reviews have **no** submission endpoint
- The review history page (`/reviews/history`) only queries cycle-based reviews
- Analytics pages only reference cycle-based review data

### 7.3. Goals Not Integrated Into Reviews

The review types define `GoalAchievement[]` and the ad-hoc review settings have `includeGoals: boolean`, but:
- The self-review form has no section for rating goal achievement
- The manager review form doesn't pull the employee's goals
- There's no API call to fetch an employee's goals during a review
- The `goal_rating` question type in review forms references goals but has no mechanism to auto-populate with actual goal data

### 7.4. Dashboard Data Relies on a Single API Endpoint

All five role-based dashboards (`Employee`, `Manager`, `HR`, `CSuite`, `Admin`) fetch from a single endpoint: `GET /api/v1/analytics/dashboard?role=X`. This means the dashboard content is entirely backend-driven. If the backend doesn't return the exact shape expected by each dashboard component, the UI will break silently (no validation).

---

## 8. Security Concerns

### 8.1. No CSRF Protection

The API client sends JWT tokens via `Authorization` header but there's no CSRF token handling. If the backend relies on cookie-based auth for any endpoints, this is vulnerable.

### 8.2. Refresh Token in Cookie Without `httpOnly`

**File:** `app/composables/useAuth.ts:21-25`

```typescript
const refreshCookie = useCookie('refresh_token', {
  maxAge: 7 * 24 * 60 * 60,
  secure: true,
  sameSite: 'strict'
})
```

The cookie is set with `secure` and `sameSite: 'strict'`, but **not `httpOnly`**. This means JavaScript (including XSS payloads) can read the refresh token. It should be `httpOnly: true`, but Nuxt `useCookie` can't set httpOnly from the client side - this should be handled server-side.

### 8.3. Access Token Stored in Pinia (In-Memory) - Loss on Refresh

The access token is stored in Pinia state (`stores/auth.ts:21`), which is lost on page refresh. The `checkAuth` method attempts to recover by refreshing the token, which is correct, but any in-flight requests during the refresh period will fail with 401.

### 8.4. Client-Side Role Checks Only

Role-based access control is enforced client-side via middleware (`middleware/auth.ts`) and component-level `v-if` checks. An attacker can bypass all frontend role checks by directly calling the API. The backend MUST enforce authorization - this is fine as long as the backend does its part, but the frontend code gives no indication that backend enforcement exists.

---

## 9. UX/UI Gaps

### 9.1. No Loading State in Self-Review / Manager-Review Forms

When the form is loading review data, the skeleton shown is minimal. If form data is large (many sections/questions), there's no section-level loading indication.

### 9.2. No Auto-Save for Reviews

Both self-review and manager-review forms have "Save Draft" buttons, but there's no auto-save functionality. If a user spends 30 minutes filling out a review and their browser crashes, all work is lost.

### 9.3. No Confirmation Before Leaving Unsaved Review

Neither self-review nor manager-review pages implement `onBeforeRouteLeave` to warn users about unsaved changes before navigating away.

### 9.4. No Breadcrumbs

The default layout has a comment placeholder for breadcrumbs (`line 116: <!-- Breadcrumb or page title can go here -->`) but no implementation. Deep pages like `/reviews/adhoc/abc123/self-review` provide no navigation context.

### 9.5. No Notification Bell in Top Header

The top header (`layouts/default.vue`) only shows the user avatar/dropdown. There is no notification bell icon showing unread count, which is standard for apps with notification systems.

### 9.6. No Empty State for Dashboards on First Load

When `data` is null (before first API response), dashboard components receive `null` through non-null assertions. There should be proper empty/initial states.

---

## 10. Recommended Enhancements

### 10.1. Required for MVP (Core Workflow)

| # | Enhancement | Priority | Effort |
|---|------------|----------|--------|
| 1 | Implement self-review submission API call (replace `setTimeout`) | P0 | Medium |
| 2 | Implement manager-review submission API call (replace `setTimeout`) | P0 | Medium |
| 3 | Create notification service + store | P0 | Large |
| 4 | Fix acknowledgment button - add handler and page/modal | P0 | Medium |
| 5 | Fix user identity comparison bug (user.id vs employee.id) | P0 | Small |
| 6 | Create ad-hoc review results/summary page | P0 | Large |
| 7 | Add ad-hoc review submission endpoints to service layer | P0 | Medium |
| 8 | Add notification bell to header layout | P1 | Small |
| 9 | Create `/profile` page | P1 | Medium |
| 10 | Create `/settings` page (admin) | P1 | Medium |
| 11 | Create `/notifications` page | P1 | Medium |
| 12 | Integrate goals data into review forms | P1 | Large |
| 13 | Fix NotificationWidget type mismatch with notification system | P1 | Small |

### 10.2. Recommended for Production Readiness

| # | Enhancement | Priority | Effort |
|---|------------|----------|--------|
| 14 | Add auto-save for review forms (debounced, every 30s) | P2 | Medium |
| 15 | Add unsaved changes warning (beforeRouteLeave) | P2 | Small |
| 16 | Add breadcrumb navigation | P2 | Medium |
| 17 | Implement real-time notifications (polling or WebSocket) | P2 | Large |
| 18 | Add KPI definition/management module | P2 | XL |
| 19 | Add review results comparison view (self vs manager) | P2 | Large |
| 20 | Fix convenience methods to filter by current user | P2 | Small |
| 21 | Fix non-null assertion on dashboard data props | P2 | Small |
| 22 | Add proper error boundaries for dashboard components | P2 | Medium |
| 23 | Unify notification type systems (dashboard vs notification types) | P2 | Medium |
| 24 | Add server-side httpOnly cookie for refresh token | P2 | Medium |

---

## 11. Priority Matrix

### Must Fix Before First User Test (P0)

1. **Self-review + Manager-review submission** - The entire core workflow is broken without this
2. **User identity bug** - Permissions check fails; wrong users can/can't access reviews
3. **Acknowledgment flow** - Dead button breaks the review completion cycle
4. **Ad-hoc review API endpoints for submission** - Service layer has no submit/save-draft for individual reviews within an ad-hoc review

### Must Fix Before Launch (P1)

5. Missing pages (profile, settings, notifications)
6. Notification service/store and header bell
7. Goal integration in reviews
8. Type alignment between notification systems

### Should Fix for Production (P2)

9. Auto-save, unsaved changes warnings
10. Real-time notifications
11. KPI module
12. Security hardening (httpOnly cookies, CSRF)
13. UX polish (breadcrumbs, loading states, empty states)

---

## Summary

The project has strong foundations - well-organized code structure, comprehensive type definitions, clean service/store separation, and proper auth with session management. However, the **core review workflow is broken** because the two most critical user interactions (submitting self-review and manager-review) are stubbed. The notification system exists only as type definitions. The acknowledgment step that completes the review cycle has a button with no handler.

Fixing items #1-#7 from the priority matrix would make the core HR -> trigger review -> employee self-review -> manager review -> acknowledge -> complete workflow functional end-to-end.
