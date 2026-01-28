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
  first_name: string
  last_name: string
  name?: string // Computed full name for convenience
  email?: string
  job_title?: string
  avatar_url?: string
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
  goal_id: string
  title: string
  description?: string
  target_value: number
  current_value: number
  unit?: string
  progress: number
  status: KeyResultStatus
  due_date?: string
  created_at: string
  updated_at: string
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
  owner_id: string
  parent_goal?: ParentGoalSummary
  parent_goal_id?: string
  child_goals?: ChildGoalSummary[]
  key_results: KeyResult[]
  tags?: string[]
  start_date?: string
  due_date: string
  completed_at?: string
  created_at: string
  updated_at: string
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
  parent_goal?: ParentGoalSummary
  start_date?: string
  due_date: string
  key_results: KeyResultSummary
  created_at: string
}

// Goal filter options
export interface GoalFilters {
  search?: string
  type?: GoalType
  status?: GoalStatus
  owner_id?: string
  department_id?: string
  parent_goal_id?: string
  due_before?: string
  due_after?: string
  priority?: GoalPriority
}

// Goal list params (for API calls)
export interface GoalListParams extends GoalFilters {
  page?: number
  per_page?: number
  sort_by?: 'title' | 'due_date' | 'progress' | 'created_at' | 'updated_at'
  sort_order?: 'asc' | 'desc'
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
  goal_id: string
  key_result_id?: string
  old_value: number
  new_value: number
  comment?: string
  updated_by: GoalOwner
  created_at: string
}

// Goal template entity
export interface GoalTemplate {
  id: string
  title: string
  description?: string
  type: GoalType
  category: string
  default_priority?: GoalPriority
  suggested_key_results: KeyResultCreateRequest[]
  created_by?: GoalOwner
  is_active: boolean
  created_at: string
  updated_at: string
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
    per_page: number
    total_items: number
    total_pages: number
  }
  sortBy: GoalListParams['sort_by']
  sortOrder: GoalListParams['sort_order']
  viewMode: 'grid' | 'list' | 'kanban'
  isLoading: boolean
  error: string | null
}

// API Response types
export interface GoalListResponse {
  success: boolean
  data: GoalListItem[]
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
    pagination: {
      page: number
      per_page: number
      total_items: number
      total_pages: number
    }
    timestamp: string
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
  total_goals: number
  aligned_goals: number
  unaligned_goals: number
  score_percentage: number
}
