// Employee Types
// Based on API spec: docs/api/employees.md and PRD: docs/prd/03-employees.md

import type { UserRole } from './auth'

// Employment enums
export type EmploymentType = 'full-time' | 'part-time' | 'contract'
export type EmploymentStatus = 'active' | 'inactive' | 'on_leave' | 'terminated'
export type WorkLocation = 'remote' | 'hybrid' | 'office'

// Basic department info (embedded in employee)
export interface EmployeeDepartment {
  id: string
  name: string
  parent?: {
    id: string
    name: string
  }
}

// Basic manager info (embedded in employee)
export interface EmployeeManager {
  id: string
  first_name: string
  last_name: string
  job_title?: string
  email?: string
}

// Employee entity
export interface Employee {
  id: string
  user_id?: string
  employee_code: string
  first_name: string
  last_name: string
  email: string
  phone?: string
  avatar_url?: string
  job_title?: string
  department_id?: string
  department?: EmployeeDepartment
  manager_id?: string
  manager?: EmployeeManager
  hire_date?: string
  employment_type: EmploymentType
  employment_status: EmploymentStatus
  work_location?: WorkLocation
  career_level?: string
  direct_reports_count?: number
  created_at: string
  updated_at: string
}

// Employee list item (lighter version for directory)
export interface EmployeeListItem {
  id: string
  employee_code: string
  first_name: string
  last_name: string
  email: string
  job_title?: string
  department?: {
    id: string
    name: string
  }
  manager?: {
    id: string
    first_name: string
    last_name: string
  }
  hire_date?: string
  employment_status: EmploymentStatus
  avatar_url?: string
}

// Employee filter options
export interface EmployeeFilters {
  search?: string
  department_id?: string
  manager_id?: string
  employment_status?: EmploymentStatus
  employment_type?: EmploymentType
  work_location?: WorkLocation
  role?: UserRole
}

// Employee list params (for API calls)
export interface EmployeeListParams extends EmployeeFilters {
  page?: number
  per_page?: number
  sort_by?: 'first_name' | 'last_name' | 'department' | 'hire_date' | 'email'
  sort_order?: 'asc' | 'desc'
}

// Employee create/update request
export interface EmployeeCreateRequest {
  first_name: string
  last_name: string
  email: string
  phone?: string
  job_title?: string
  department_id?: string
  manager_id?: string
  hire_date?: string
  employment_type?: EmploymentType
  avatar_url?: string
  create_user_account?: boolean
  user_role?: UserRole
}

export interface EmployeeUpdateRequest {
  first_name?: string
  last_name?: string
  email?: string
  phone?: string
  job_title?: string
  department_id?: string
  manager_id?: string
  hire_date?: string
  employment_type?: EmploymentType
  employment_status?: EmploymentStatus
  work_location?: WorkLocation
  career_level?: string
  avatar_url?: string
}

// Employee goals summary
export interface EmployeeGoalSummary {
  id: string
  title: string
  type: 'individual' | 'team' | 'department'
  status: 'draft' | 'active' | 'completed' | 'cancelled'
  progress: number
  due_date?: string
  key_results_count: number
  key_results_completed: number
}

// Employee review summary
export interface EmployeeReviewSummary {
  id: string
  cycle: {
    id: string
    name: string
  }
  type: 'self' | 'manager' | 'peer'
  reviewer?: {
    id: string
    first_name: string
    last_name: string
  }
  status: 'pending' | 'submitted' | 'acknowledged'
  rating?: number
  submitted_at?: string
}

// Employee team member (direct report)
export interface EmployeeTeamMember {
  id: string
  first_name: string
  last_name: string
  email: string
  job_title?: string
  employment_status: EmploymentStatus
  avatar_url?: string
  active_goals_count: number
  pending_reviews_count: number
}

// Performance summary for profile
export interface EmployeePerformanceSummary {
  current_rating?: number
  active_goals_count: number
  average_goal_progress: number
  recent_reviews: EmployeeReviewSummary[]
}

// Employee store state
export interface EmployeeState {
  employees: EmployeeListItem[]
  currentEmployee: Employee | null
  filters: EmployeeFilters
  pagination: {
    page: number
    per_page: number
    total_items: number
    total_pages: number
  }
  sortBy: EmployeeListParams['sort_by']
  sortOrder: EmployeeListParams['sort_order']
  viewMode: 'grid' | 'list'
  isLoading: boolean
  error: string | null
}

// API Response types
export interface EmployeeListResponse {
  success: boolean
  data: EmployeeListItem[]
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

export interface EmployeeResponse {
  success: boolean
  data: Employee
  meta: {
    timestamp: string
  }
}

export interface EmployeeGoalsResponse {
  success: boolean
  data: EmployeeGoalSummary[]
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

export interface EmployeeReviewsResponse {
  success: boolean
  data: EmployeeReviewSummary[]
  meta: {
    timestamp: string
  }
}

export interface EmployeeTeamResponse {
  success: boolean
  data: EmployeeTeamMember[]
  meta: {
    total_direct_reports: number
    timestamp: string
  }
}
