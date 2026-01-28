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
  include_self_assessment: boolean
  include_manager_review: boolean
  include_peer_review: boolean
  rating_scale: RatingScale
}

// Basic user/creator info (embedded in cycle)
export interface ReviewCreator {
  id: string
  first_name: string
  last_name: string
  email?: string
}

// Cycle statistics
export interface CycleStats {
  total_reviews: number
  completed: number
  pending: number
  in_progress?: number
  completion_rate: number
  average_rating?: number
  by_type?: {
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
  start_date: string
  end_date: string
  status: ReviewCycleStatus
  template_id?: string
  settings: CycleSettings
  departments?: string[]
  created_by: ReviewCreator
  stats: CycleStats
  created_at: string
  updated_at: string
}

// Review Cycle list item (lighter version)
export interface ReviewCycleListItem {
  id: string
  name: string
  description?: string
  type: ReviewCycleType
  start_date: string
  end_date: string
  status: ReviewCycleStatus
  created_by: ReviewCreator
  stats: CycleStats
  created_at: string
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
  first_name: string
  last_name: string
  email?: string
  job_title?: string
  avatar_url?: string
  department?: {
    id: string
    name: string
  }
  hire_date?: string
}

// Goal achievement info (for review)
export interface GoalAchievement {
  id: string
  title: string
  progress: number
  self_rating?: number
  manager_rating?: number
  comments?: string
}

// Review entity (full detail)
export interface Review {
  id: string
  cycle_id: string
  cycle: CycleSummary
  employee_id: string
  employee: ReviewEmployeeSummary
  reviewer_id: string
  reviewer: ReviewEmployeeSummary
  type: ReviewType
  status: ReviewStatus
  rating?: number
  ratings_breakdown?: Record<string, number>
  strengths?: string
  improvements?: string
  comments?: string
  employee_comments?: string
  goals_achieved?: GoalAchievement[]
  submitted_at?: string
  acknowledged_at?: string
  created_at: string
  updated_at: string
}

// Review list item (lighter version)
export interface ReviewListItem {
  id: string
  cycle: CycleSummary
  employee: ReviewEmployeeSummary
  reviewer: ReviewEmployeeSummary
  type: ReviewType
  status: ReviewStatus
  rating?: number
  submitted_at?: string
}

// Review filter options
export interface ReviewFilters {
  search?: string
  cycle_id?: string
  employee_id?: string
  reviewer_id?: string
  type?: ReviewType
  status?: ReviewStatus
}

// Review list params (for API calls)
export interface ReviewListParams extends ReviewFilters {
  page?: number
  per_page?: number
  sort_by?: 'created_at' | 'submitted_at' | 'rating' | 'status'
  sort_order?: 'asc' | 'desc'
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
  per_page?: number
}

// Review Cycle create request
export interface ReviewCycleCreateRequest {
  name: string
  description?: string
  type: ReviewCycleType
  start_date: string
  end_date: string
  settings?: Partial<CycleSettings>
  departments?: string[]
}

// Review Cycle update request
export interface ReviewCycleUpdateRequest {
  name?: string
  description?: string
  type?: ReviewCycleType
  start_date?: string
  end_date?: string
  settings?: Partial<CycleSettings>
  departments?: string[]
}

// Review update/submit request
export interface ReviewUpdateRequest {
  rating?: number
  ratings_breakdown?: Record<string, number>
  strengths?: string
  improvements?: string
  comments?: string
  status?: 'in_progress' | 'submitted'
}

// Review acknowledge request
export interface ReviewAcknowledgeRequest {
  employee_comments?: string
}

// Launch cycle response
export interface LaunchCycleResponse {
  id: string
  name: string
  status: ReviewCycleStatus
  reviews_created: {
    self: number
    manager: number
    total: number
  }
  notifications_sent: number
  launched_at: string
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
  rating_scale: RatingScale
  status: 'active' | 'archived'
  created_by?: ReviewCreator
  created_at: string
  updated_at: string
}

// Review store state
export interface ReviewState {
  // Review Cycles
  reviewCycles: ReviewCycleListItem[]
  currentCycle: ReviewCycle | null
  cycleFilters: ReviewCycleFilters
  cyclePagination: {
    page: number
    per_page: number
    total_items: number
    total_pages: number
  }
  
  // Reviews
  reviews: ReviewListItem[]
  currentReview: Review | null
  reviewFilters: ReviewFilters
  reviewPagination: {
    page: number
    per_page: number
    total_items: number
    total_pages: number
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
      per_page: number
      total_items: number
      total_pages: number
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
      per_page: number
      total_items: number
      total_pages: number
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
