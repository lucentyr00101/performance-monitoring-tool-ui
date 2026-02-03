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
  firstName: string
  lastName: string
  jobTitle?: string
  email?: string
}

// Employee entity
export interface Employee {
  id: string
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
  careerLevel?: string
  directReportsCount?: number
  createdAt: string
  updatedAt: string
}

// Employee list item (lighter version for directory)
export interface EmployeeListItem {
  id: string
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
}

// Employee list params (for API calls)
export interface EmployeeListParams extends EmployeeFilters {
  page?: number
  perPage?: number
  sortBy?: 'first_name' | 'last_name' | 'department' | 'hire_date' | 'email'
  sortOrder?: 'asc' | 'desc'
}

// Employee create/update request
export interface EmployeeCreateRequest {
  firstName: string
  lastName: string
  email: string
  phone?: string
  jobTitle?: string
  departmentId?: string
  managerId?: string
  hireDate?: string
  employmentType?: EmploymentType
  avatarUrl?: string
  createUserAccount?: boolean
  userRole?: UserRole
}

export interface EmployeeUpdateRequest {
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  jobTitle?: string
  departmentId?: string
  managerId?: string
  hireDate?: string
  employmentType?: EmploymentType
  employmentStatus?: EmploymentStatus
  workLocation?: WorkLocation
  careerLevel?: string
  avatarUrl?: string
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

// API Response types
export interface EmployeeListResponse {
  success: boolean
  data: EmployeeListItem[]
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
      perPage: number
      totalItems: number
      totalPages: number
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
    totalDirectReports: number
    timestamp: string
  }
}
