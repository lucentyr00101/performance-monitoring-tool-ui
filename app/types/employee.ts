// Employee Types
// Based on API spec: docs/api/employees.md and PRD: docs/prd/03-employees.md

import type { UserRole } from './auth'

// Employment enums
export type EmploymentType = 'full-time' | 'part-time' | 'contract'
export type EmploymentStatus = 'active' | 'inactive' | 'on_leave' | 'terminated'
export type WorkLocation = 'remote' | 'hybrid' | 'office'
export type EmployeeRank = 'junior' | 'mid' | 'senior' | 'manager' | 'lead' | 'ceo'

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
  firstName: string
  lastName: string
  jobTitle?: string
  email?: string
}

// Employee entity
export interface Employee {
  _id: string
  id?: string // Optional for backward compatibility
  userId?: string
  employeeCode: string
  firstName: string
  lastName: string
  fullName?: string
  email: string
  phone?: string
  avatarUrl?: string
  jobTitle?: string
  // API returns departmentId as object with id and name
  departmentId?: string | {
    id: string
    name: string
  }
  department?: EmployeeDepartment
  managerId?: string | null
  manager?: EmployeeManager
  hireDate?: string
  employmentType: EmploymentType
  // API returns 'status' field (not employmentStatus)
  status?: EmploymentStatus
  employmentStatus?: EmploymentStatus
  workLocation?: WorkLocation
  rank?: EmployeeRank
  directReportsCount?: number
  createdAt: string
  updatedAt: string
}

// Employee list item (lighter version for directory)
export interface EmployeeListItem {
  _id: string
  id?: string // Optional for backward compatibility
  employeeCode: string
  firstName: string
  lastName: string
  fullName?: string
  email: string
  jobTitle?: string
  // API returns departmentId as object with id and name
  departmentId?: {
    id: string
    name: string
  }
  department?: {
    id: string
    name: string
  }
  // API returns computed departmentName field
  departmentName?: string
  manager?: {
    id: string
    firstName: string
    lastName: string
  }
  managerId?: string | null
  hireDate?: string
  // API returns 'status' field (not employmentStatus)
  status?: EmploymentStatus
  employmentStatus?: EmploymentStatus
  rank?: EmployeeRank
  avatarUrl?: string
  directReportsCount?: number
}

// Employee filter options
export interface EmployeeFilters {
  search?: string
  departmentId?: string
  managerId?: string
  employmentStatus?: EmploymentStatus
  employmentType?: EmploymentType
  workLocation?: WorkLocation
  role?: UserRole
  rank?: EmployeeRank
}

// Employee list params (for API calls)
export interface EmployeeListParams extends EmployeeFilters {
  page?: number
  perPage?: number
  sortBy?: 'first_name' | 'last_name' | 'department' | 'hire_date' | 'email'
  sortOrder?: 'asc' | 'desc'
}

// Employee create/update request (snake_case for API)
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
  rank?: EmployeeRank
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
  rank?: EmployeeRank
  avatar_url?: string
}

// Employee goals summary
export interface EmployeeGoalSummary {
  id: string
  title: string
  type: 'individual' | 'team' | 'department'
  status: 'draft' | 'active' | 'completed' | 'cancelled'
  progress: number
  dueDate?: string
  keyResultsCount: number
  keyResultsCompleted: number
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
    firstName: string
    lastName: string
  }
  status: 'pending' | 'submitted' | 'acknowledged'
  rating?: number
  submittedAt?: string
}

// Employee team member (direct report)
export interface EmployeeTeamMember {
  id: string
  firstName: string
  lastName: string
  fullName?: string
  email: string
  jobTitle?: string
  // API returns 'status' field (not employmentStatus)
  status?: EmploymentStatus
  employmentStatus?: EmploymentStatus
  avatarUrl?: string
  activeGoalsCount: number
  pendingReviewsCount: number
}

// Performance summary for profile
export interface EmployeePerformanceSummary {
  currentRating?: number
  activeGoalsCount: number
  averageGoalProgress: number
  recentReviews: EmployeeReviewSummary[]
}

// Employee store state
export interface EmployeeState {
  employees: EmployeeListItem[]
  currentEmployee: Employee | null
  filters: EmployeeFilters
  pagination: {
    page: number
    perPage: number
    totalItems: number
    totalPages: number
  }
  sortBy: EmployeeListParams['sortBy']
  sortOrder: EmployeeListParams['sortOrder']
  viewMode: 'grid' | 'list'
  isLoading: boolean
  error: string | null
}

// API Response types (snake_case as returned by API)
export interface EmployeeListResponse {
  success: boolean
  data: EmployeeListItem[]
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
    timestamp: string
    pagination: {
      page: number
      per_page: number
      total_items: number
      total_pages: number
    }
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
    totalDirectReports: number
    timestamp: string
  }
}
