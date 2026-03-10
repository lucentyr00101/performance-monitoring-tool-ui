// Notification Types
// For in-app notifications related to reviews and other system events

// Notification types
export type NotificationType =
  | 'adhoc_review_triggered'
  | 'self_review_due'
  | 'manager_review_due'
  | 'self_review_submitted'
  | 'manager_review_submitted'
  | 'review_reminder'
  | 'review_overdue'
  | 'review_completed'
  | 'goal_assigned'
  | 'goal_due_soon'
  | 'cycle_started'
  | 'system'

// Notification priority
export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent'

// Notification status
export type NotificationStatus = 'unread' | 'read' | 'archived'

// Notification action
export interface NotificationAction {
  label: string
  url: string
  primary?: boolean
}

// Notification entity
export interface Notification {
  id: string
  type: NotificationType
  title: string
  message: string
  priority: NotificationPriority
  status: NotificationStatus
  actions?: NotificationAction[]
  metadata?: Record<string, unknown>
  createdAt: string
  readAt?: string
}

// Notification list item
export interface NotificationListItem {
  id: string
  type: NotificationType
  title: string
  message: string
  priority: NotificationPriority
  status: NotificationStatus
  createdAt: string
  readAt?: string
  link?: string
}

// Notification filters
export interface NotificationFilters {
  type?: NotificationType
  status?: NotificationStatus
  priority?: NotificationPriority
}

// Notification list params
export interface NotificationListParams extends NotificationFilters {
  page?: number
  perPage?: number
}

// Notification counts
export interface NotificationCounts {
  total: number
  unread: number
  byType: Record<NotificationType, number>
}

// Notification store state
export interface NotificationState {
  notifications: NotificationListItem[]
  counts: NotificationCounts
  filters: NotificationFilters
  pagination: {
    page: number
    perPage: number
    totalItems: number
    totalPages: number
  }
  isLoading: boolean
  error: string | null
}

// API Response types
export interface NotificationListResponse {
  success: boolean
  data: NotificationListItem[]
  meta: {
    timestamp: string
    pagination: {
      page: number
      per_page: number
      total_items: number
      total_pages: number
    }
    counts: NotificationCounts
  }
}

export interface NotificationResponse {
  success: boolean
  data: Notification
  meta: {
    timestamp: string
  }
}

export interface NotificationMarkReadResponse {
  success: boolean
  data: {
    id: string
    status: 'read'
    readAt: string
  }
  meta: {
    timestamp: string
  }
}

export interface NotificationMarkAllReadResponse {
  success: boolean
  data: {
    updatedCount: number
  }
  meta: {
    timestamp: string
  }
}

// Helper to create notification for ad-hoc review
export function createAdhocReviewNotification(
  type: 'employee' | 'manager',
  employeeName: string,
  triggeredByName: string,
  dueDate: string,
  adhocReviewId: string
): Omit<Notification, 'id' | 'createdAt'> {
  if (type === 'employee') {
    return {
      type: 'adhoc_review_triggered',
      title: 'Performance Review Requested',
      message: `A performance review has been requested for you by ${triggeredByName}. Please complete your self-assessment by ${dueDate}.`,
      priority: 'high',
      status: 'unread',
      actions: [
        {
          label: 'Start Self-Review',
          url: `/reviews/adhoc/${adhocReviewId}/self-review`,
          primary: true
        }
      ],
      metadata: {
        adhocReviewId: adhocReviewId,
        triggeredBy: triggeredByName
      }
    }
  }
  else {
    return {
      type: 'adhoc_review_triggered',
      title: `Review Required: ${employeeName}`,
      message: `A performance review has been initiated for ${employeeName}. Please complete your evaluation by ${dueDate}.`,
      priority: 'high',
      status: 'unread',
      actions: [
        {
          label: 'Complete Evaluation',
          url: `/reviews/adhoc/${adhocReviewId}/manager-review`,
          primary: true
        }
      ],
      metadata: {
        adhocReviewId: adhocReviewId,
        employeeName: employeeName
      }
    }
  }
}
