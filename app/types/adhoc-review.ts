// Ad-Hoc Review Types
// Based on API spec: docs/api/reviews.md and PRD: docs/prd/08-adhoc-reviews.md

import type { ReviewEmployeeSummary } from './review'

// Ad-hoc review status
export type AdhocReviewStatus = 'initiated' | 'pending_acknowledgment' | 'completed' | 'cancelled'

// Individual review status within ad-hoc
export type AdhocReviewItemStatus = 'pending' | 'in_progress' | 'submitted'

// Ad-hoc review settings
export interface AdhocReviewSettings {
  selfReviewRequired: boolean
  managerReviewRequired: boolean
  includeGoals: boolean
}

// Triggered by user info
export interface TriggeredByUser {
  id: string
  firstName: string
  lastName: string
  role?: string
}

// Review form summary (embedded in ad-hoc review)
export interface ReviewFormSummary {
  id: string
  name: string
  version?: string
}

// Self/Manager review status summary
export interface AdhocReviewItemSummary {
  id: string
  status: AdhocReviewItemStatus
  submittedAt?: string
  answers?: {
    questionId: string
    value: string | number | boolean | string[]
  }[]
}

// Ad-Hoc Review entity (full detail)
export interface AdhocReview {
  id: string
  employee: ReviewEmployeeSummary
  manager: ReviewEmployeeSummary
  triggeredBy: TriggeredByUser
  triggeredAt: string
  reason?: string
  dueDate: string
  reviewForm: ReviewFormSummary
  formSnapshot?: {
    id: string
    name: string
    description?: string
    sections: {
      id: string
      name: string
      description?: string
      order: number
      questions: {
        id: string
        text: string
        helpText?: string
        isRequired?: boolean
        order?: number
        config: {
          type: string
          minValue?: number
          maxValue?: number
          labels?: Record<number, string>
          options?: string[]
          placeholder?: string
          rows?: number
          maxLength?: number
        }
      }[]
    }[]
  }
  settings: AdhocReviewSettings
  status: AdhocReviewStatus
  selfReview: AdhocReviewItemSummary
  managerReview: AdhocReviewItemSummary
  completedAt?: string
  createdAt: string
  updatedAt: string
}

// Ad-Hoc Review list item (lighter version)
export interface AdhocReviewListItem {
  id: string
  employee: ReviewEmployeeSummary
  manager: ReviewEmployeeSummary
  triggeredBy: TriggeredByUser
  reason?: string
  dueDate: string
  reviewForm: ReviewFormSummary
  status: AdhocReviewStatus
  selfReviewStatus: AdhocReviewItemStatus
  managerReviewStatus: AdhocReviewItemStatus
  triggeredAt: string
}

// Filter options for ad-hoc reviews
export interface AdhocReviewFilters {
  status?: AdhocReviewStatus
  employeeId?: string
  managerId?: string
  triggeredBy?: string
  dueBefore?: string
  overdue?: boolean
}

// List params for API calls
export interface AdhocReviewListParams extends AdhocReviewFilters {
  page?: number
  perPage?: number
}

// Trigger ad-hoc review request
export interface TriggerAdhocReviewRequest {
  employeeId: string
  dueDate?: string
  reason?: string
  reviewFormId?: string | null
  settings?: Partial<AdhocReviewSettings>
}

// Trigger response
export interface TriggerAdhocReviewResponse {
  id: string
  employee: {
    id: string
    firstName: string
    lastName: string
  }
  manager: {
    id: string
    firstName: string
    lastName: string
  }
  dueDate: string
  reason?: string
  reviewForm: ReviewFormSummary
  status: AdhocReviewStatus
  selfReviewId: string
  managerReviewId: string
  notificationsSent: {
    employee: boolean
    manager: boolean
  }
  triggeredAt: string
  createdAt: string
}

// Remind response
export interface AdhocReviewRemindResponse {
  remindersSent: {
    employee: boolean
    manager: boolean
  }
  message: string
}

// Cancel response
export interface AdhocReviewCancelResponse {
  id: string
  status: 'cancelled'
  cancelledAt: string
}

// Ad-hoc review store state
export interface AdhocReviewState {
  adhocReviews: AdhocReviewListItem[]
  currentAdhocReview: AdhocReview | null
  filters: AdhocReviewFilters
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
export interface AdhocReviewListResponse {
  success: boolean
  data: AdhocReviewListItem[]
  meta: {
    pagination: {
      page: number
      perPage: number
      totalItems: number
      totalPages: number
    }
    timestamp: string
  }
}

export interface AdhocReviewResponse {
  success: boolean
  data: AdhocReview
  meta: {
    timestamp: string
  }
}

export interface TriggerAdhocReviewApiResponse {
  success: boolean
  data: TriggerAdhocReviewResponse
  meta: {
    timestamp: string
  }
}

export interface AdhocReviewRemindApiResponse {
  success: boolean
  data: AdhocReviewRemindResponse
  meta: {
    timestamp: string
  }
}

export interface AdhocReviewCancelApiResponse {
  success: boolean
  data: AdhocReviewCancelResponse
  meta: {
    timestamp: string
  }
}
