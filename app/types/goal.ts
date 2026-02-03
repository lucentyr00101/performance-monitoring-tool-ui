// Goal & OKR Types
// Based on API spec: docs/api/goals.md and PRD: docs/prd/04-goals.md

// Goal enums
export type GoalType = 'individual' | 'team' | 'department' | 'company'
export type GoalStatus = 'draft' | 'pending' | 'active' | 'completed' | 'cancelled'
export type GoalPriority = 'high' | 'medium' | 'low'
export type GoalVisibility = 'private' | 'team' | 'department' | 'company'
export type KeyResultStatus = 'in_progress' | 'completed' | 'cancelled'
export type ProgressIndicator = 'on_track' | 'at_risk' | 'behind'

// Basic owner info (embedded in goal)
export interface GoalOwner {
  id: string
  firstName: string
  lastName: string
  name?: string // Computed full name for convenience
  email?: string
  jobTitle?: string
  avatarUrl?: string
}

// Parent goal summary (for alignment)
export interface ParentGoalSummary {
  id: string
  title: string
  type?: GoalType
  status?: GoalStatus
}

// Child goal summary (for alignment)
export interface ChildGoalSummary {
  id: string
  title: string
  type: GoalType
  status: GoalStatus
  progress: number
}

// Key Result entity
export interface KeyResult {
  id: string
  goalId: string
  title: string
  description?: string
  targetValue: number
  currentValue: number
  unit?: string
  progress: number
  status: KeyResultStatus
  dueDate?: string
  createdAt: string
  updatedAt: string
}

// Key Result for list view (summary)
export interface KeyResultSummary {
  total: number
  completed: number
}

// Goal entity (full detail)
export interface Goal {
  id: string
  title: string
  description?: string
  type: GoalType
  status: GoalStatus
  progress: number
  priority?: GoalPriority
  visibility?: GoalVisibility
  owner: GoalOwner
  ownerId: string
  parentGoal?: ParentGoalSummary
  parentGoalId?: string
  childGoals?: ChildGoalSummary[]
  keyResults: KeyResult[]
  tags?: string[]
  startDate?: string
  dueDate: string
  completedAt?: string
  createdAt: string
  updatedAt: string
}

// Goal list item (lighter version for directory)
export interface GoalListItem {
  id: string
  title: string
  description?: string
  type: GoalType
  status: GoalStatus
  progress: number
  priority?: GoalPriority
  owner: GoalOwner
  parentGoal?: ParentGoalSummary
  startDate?: string
  dueDate: string
  keyResults: KeyResultSummary
  createdAt: string
}

// Goal filter options
export interface GoalFilters {
  search?: string
  type?: GoalType
  status?: GoalStatus
  ownerId?: string
  departmentId?: string
  parentGoalId?: string
  dueBefore?: string
  dueAfter?: string
  priority?: GoalPriority
}

// Goal list params (for API calls)
export interface GoalListParams extends GoalFilters {
  page?: number
  perPage?: number
  sortBy?: 'title' | 'due_date' | 'progress' | 'created_at' | 'updated_at'
  sortOrder?: 'asc' | 'desc'
}

// Goal create request
export interface GoalCreateRequest {
  title: string
  description?: string
  type: GoalType
  owner_id: string
  parent_goal_id?: string
  priority?: GoalPriority
  visibility?: GoalVisibility
  start_date?: string
  due_date: string
  tags?: string[]
  key_results?: KeyResultCreateRequest[]
}

// Goal update request
export interface GoalUpdateRequest {
  title?: string
  description?: string
  type?: GoalType
  status?: GoalStatus
  priority?: GoalPriority
  visibility?: GoalVisibility
  owner_id?: string
  parent_goal_id?: string | null
  start_date?: string
  due_date?: string
  tags?: string[]
}

// Goal progress update request
export interface GoalProgressRequest {
  progress: number
  note?: string
}

// Key result create request
export interface KeyResultCreateRequest {
  title: string
  description?: string
  target_value: number
  current_value?: number
  unit?: string
  due_date?: string
}

// Key result update request
export interface KeyResultUpdateRequest {
  title?: string
  description?: string
  target_value?: number
  current_value?: number
  unit?: string
  due_date?: string
  status?: KeyResultStatus
}

// Progress history entry
export interface ProgressHistory {
  id: string
  goalId: string
  keyResultId?: string
  oldValue: number
  newValue: number
  comment?: string
  updatedBy: GoalOwner
  createdAt: string
}

// Goal template entity
export interface GoalTemplate {
  id: string
  title: string
  description?: string
  type: GoalType
  category: string
  defaultPriority?: GoalPriority
  suggestedKeyResults: KeyResultCreateRequest[]
  createdBy?: GoalOwner
  isActive: boolean
  createdAt: string
  updatedAt: string
}

// Goal approval request (for managers)
export interface GoalApprovalRequest {
  action: 'approve' | 'reject'
  comment?: string
}

// Goal cancel request
export interface GoalCancelRequest {
  reason: 'priority_change' | 'scope_change' | 'already_achieved' | 'other'
  comment?: string
}

// Goal alignment node (for tree visualization)
export interface GoalAlignmentNode {
  id: string
  title: string
  type: GoalType
  status: GoalStatus
  progress: number
  owner: GoalOwner
  children: GoalAlignmentNode[]
}

// Goal store state
export interface GoalState {
  goals: GoalListItem[]
  currentGoal: Goal | null
  templates: GoalTemplate[]
  filters: GoalFilters
  pagination: {
    page: number
    perPage: number
    totalItems: number
    totalPages: number
  }
  sortBy: GoalListParams['sortBy']
  sortOrder: GoalListParams['sortOrder']
  viewMode: 'grid' | 'list' | 'kanban'
  isLoading: boolean
  error: string | null
}

// API Response types
export interface GoalListResponse {
  success: boolean
  data: GoalListItem[]
  meta: {
    timestamp: string
    pagination: {
      page: number
      per_page: number
      total_items: number
      total_pages: number
    }
  }
}

export interface GoalResponse {
  success: boolean
  data: Goal
  meta: {
    timestamp: string
  }
}

export interface KeyResultListResponse {
  success: boolean
  data: KeyResult[]
  meta: {
    timestamp: string
  }
}

export interface KeyResultResponse {
  success: boolean
  data: KeyResult
  meta: {
    timestamp: string
  }
}

export interface GoalTemplateListResponse {
  success: boolean
  data: GoalTemplate[]
  meta: {
    timestamp: string
  }
}

export interface ProgressHistoryResponse {
  success: boolean
  data: ProgressHistory[]
  meta: {
    timestamp: string
    pagination: {
      page: number
      per_page: number
      total_items: number
      total_pages: number
    }
  }
}

// Helper type for goal progress calculation
export interface GoalProgressInfo {
  actual: number
  expected: number
  indicator: ProgressIndicator
}

// Helper type for alignment scoring
export interface AlignmentScore {
  totalGoals: number
  alignedGoals: number
  unalignedGoals: number
  scorePercentage: number
}
