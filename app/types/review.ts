// Review Types
// Based on API spec: docs/api/reviews.md and PRD: docs/prd/05-reviews.md

// Review Cycle enums
export type ReviewCycleType = 'annual' | 'semi-annual' | 'quarterly' | 'monthly'
export type ReviewCycleStatus = 'draft' | 'active' | 'completed' | 'cancelled'

// Review enums
export type ReviewType = 'self' | 'manager' | 'peer'
export type ReviewStatus = 'pending' | 'in_progress' | 'submitted' | 'acknowledged'

// Rating scale configuration
export interface RatingScale {
  min: number
  max: number
  labels?: Record<string, string>
}

// Cycle settings
export interface CycleSettings {
  includeSelfAssessment: boolean
  includeManagerReview: boolean
  includePeerReview: boolean
  ratingScale: RatingScale
}

// Basic user/creator info (embedded in cycle)
export interface ReviewCreator {
  id: string
  firstName: string
  lastName: string
  email?: string
}

// Cycle statistics
export interface CycleStats {
  totalReviews: number
  completed: number
  pending: number
  inProgress?: number
  completionRate: number
  averageRating?: number
  byType?: {
    self: { total: number; completed: number }
    manager: { total: number; completed: number }
    peer?: { total: number; completed: number }
  }
}

// Review Cycle entity (full detail)
export interface ReviewCycle {
  id: string
  name: string
  description?: string
  type: ReviewCycleType
  startDate: string
  endDate: string
  status: ReviewCycleStatus
  templateId?: string
  settings: CycleSettings
  departments?: string[]
  createdBy: ReviewCreator
  stats: CycleStats
  createdAt: string
  updatedAt: string
}

// Review Cycle list item (lighter version)
export interface ReviewCycleListItem {
  id: string
  name: string
  description?: string
  type: ReviewCycleType
  startDate: string
  endDate: string
  status: ReviewCycleStatus
  createdBy: ReviewCreator
  stats: CycleStats
  createdAt: string
}

// Cycle summary (embedded in review)
export interface CycleSummary {
  id: string
  name: string
  type?: ReviewCycleType
}

// Employee summary (embedded in review)
export interface ReviewEmployeeSummary {
  id: string
  firstName: string
  lastName: string
  email?: string
  jobTitle?: string
  avatarUrl?: string
  department?: {
    id: string
    name: string
  }
  hireDate?: string
}

// Goal achievement info (for review)
export interface GoalAchievement {
  id: string
  title: string
  progress: number
  selfRating?: number
  managerRating?: number
  comments?: string
}

// Review entity (full detail)
export interface Review {
  id: string
  cycleId?: string
  cycle?: CycleSummary
  employeeId: string
  employee: ReviewEmployeeSummary
  reviewerId: string
  reviewer: ReviewEmployeeSummary
  type: ReviewType
  status: ReviewStatus
  rating?: number
  ratingsBreakdown?: Record<string, number>
  strengths?: string
  improvements?: string
  comments?: string
  employeeComments?: string
  goalsAchieved?: GoalAchievement[]
  submittedAt?: string
  acknowledgedAt?: string
  createdAt: string
  updatedAt: string
  // Ad-hoc review fields
  isAdhoc?: boolean
  adhocReviewId?: string
  // Form snapshot (locked at review creation)
  formSnapshot?: ReviewFormSnapshot
}

// Form snapshot stored with review (locked version)
export interface ReviewFormSnapshot {
  id: string
  name: string
  version: string
  sections: ReviewFormSectionSnapshot[]
}

export interface ReviewFormSectionSnapshot {
  id: string
  title: string
  description?: string
  order: number
  forReviewer: 'self' | 'manager' | 'both'
  questions: ReviewFormQuestionSnapshot[]
}

export interface ReviewFormQuestionSnapshot {
  id: string
  text: string
  helpText?: string
  type: string
  required: boolean
  forReviewer: 'self' | 'manager' | 'both'
  weight?: number
  config?: Record<string, unknown>
}

// Review list item (lighter version)
export interface ReviewListItem {
  id: string
  cycle?: CycleSummary
  employee: ReviewEmployeeSummary
  reviewer: ReviewEmployeeSummary
  type: ReviewType
  status: ReviewStatus
  rating?: number
  submittedAt?: string
  isAdhoc?: boolean
  adhocReviewId?: string
}

// Review filter options
export interface ReviewFilters {
  search?: string
  cycleId?: string
  employeeId?: string
  reviewerId?: string
  type?: ReviewType
  status?: ReviewStatus
}

// Review list params (for API calls)
export interface ReviewListParams extends ReviewFilters {
  page?: number
  perPage?: number
  sortBy?: 'created_at' | 'submitted_at' | 'rating' | 'status'
  sortOrder?: 'asc' | 'desc'
}

// Review Cycle filter options
export interface ReviewCycleFilters {
  search?: string
  status?: ReviewCycleStatus
  type?: ReviewCycleType
  year?: number
}

// Review Cycle list params
export interface ReviewCycleListParams extends ReviewCycleFilters {
  page?: number
  perPage?: number
}

// Review Cycle create request
export interface ReviewCycleCreateRequest {
  name: string
  description?: string
  type: ReviewCycleType
  startDate: string
  endDate: string
  settings?: Partial<CycleSettings>
  departments?: string[]
}

// Review Cycle update request
export interface ReviewCycleUpdateRequest {
  name?: string
  description?: string
  type?: ReviewCycleType
  startDate?: string
  endDate?: string
  settings?: Partial<CycleSettings>
  departments?: string[]
}

// Review update/submit request
export interface ReviewUpdateRequest {
  rating?: number
  ratingsBreakdown?: Record<string, number>
  strengths?: string
  improvements?: string
  comments?: string
  status?: 'in_progress' | 'submitted'
}

// Review acknowledge request
export interface ReviewAcknowledgeRequest {
  employeeComments?: string
}

// Launch cycle response
export interface LaunchCycleResponse {
  id: string
  name: string
  status: ReviewCycleStatus
  reviewsCreated: {
    self: number
    manager: number
    total: number
  }
  notificationsSent: number
  launchedAt: string
}

// Review Template types (for P1 - templates feature)
export type QuestionType = 'rating' | 'text_short' | 'text_long' | 'multiple_choice' | 'goal_review'

export interface TemplateQuestion {
  id: string
  text: string
  type: QuestionType
  required: boolean
  options?: string[]
  order: number
}

export interface TemplateSection {
  id: string
  title: string
  description?: string
  questions: TemplateQuestion[]
  order: number
}

export interface ReviewTemplate {
  id: string
  name: string
  description?: string
  sections: TemplateSection[]
  ratingScale: RatingScale
  status: 'active' | 'archived'
  createdBy?: ReviewCreator
  createdAt: string
  updatedAt: string
}

// Review store state
export interface ReviewState {
  // Review Cycles
  reviewCycles: ReviewCycleListItem[]
  currentCycle: ReviewCycle | null
  cycleFilters: ReviewCycleFilters
  cyclePagination: {
    page: number
    perPage: number
    totalItems: number
    totalPages: number
  }
  
  // Reviews
  reviews: ReviewListItem[]
  currentReview: Review | null
  reviewFilters: ReviewFilters
  reviewPagination: {
    page: number
    perPage: number
    totalItems: number
    totalPages: number
  }
  
  // Templates (P1)
  templates: ReviewTemplate[]
  
  // UI State
  isLoading: boolean
  error: string | null
}

// API Response types
export interface ReviewCycleListResponse {
  success: boolean
  data: ReviewCycleListItem[]
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

export interface ReviewCycleResponse {
  success: boolean
  data: ReviewCycle
  meta: {
    timestamp: string
  }
}

export interface ReviewListResponse {
  success: boolean
  data: ReviewListItem[]
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

export interface ReviewResponse {
  success: boolean
  data: Review
  meta: {
    timestamp: string
  }
}

export interface LaunchCycleApiResponse {
  success: boolean
  data: LaunchCycleResponse
  meta: {
    timestamp: string
  }
}

// Helper types
export interface ReviewProgress {
  selfAssessment: number
  managerReview: number
  overall: number
}

export interface RatingDistribution {
  rating: number
  count: number
  percentage: number
}
