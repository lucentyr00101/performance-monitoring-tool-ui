// Department Types
// Based on API spec: docs/api/departments.md and PRD: docs/prd/03-employees.md

import type { EmployeeManager, EmployeeListItem } from './employee'

// Department status
export type DepartmentStatus = 'active' | 'inactive'

// Basic parent department info
export interface DepartmentParent {
  id: string
  name: string
}

// Sub-department info
export interface SubDepartment {
  id: string
  name: string
  employee_count: number
}

// Department entity
export interface Department {
  id: string
  name: string
  description?: string
  parent_id?: string
  parent?: DepartmentParent
  manager_id?: string
  manager?: EmployeeManager
  sub_departments?: SubDepartment[]
  employee_count: number
  status: DepartmentStatus
  created_at: string
  updated_at: string
}

// Department list item (lighter version)
export interface DepartmentListItem {
  id: string
  name: string
  description?: string
  parent?: DepartmentParent
  manager?: EmployeeManager
  employee_count: number
  status: DepartmentStatus
}

// Department hierarchy node (for org tree)
export interface DepartmentHierarchyNode {
  id: string
  name: string
  employee_count: number
  manager?: EmployeeManager
  children: DepartmentHierarchyNode[]
}

// Department filter options
export interface DepartmentFilters {
  search?: string
  status?: DepartmentStatus
  parent_id?: string
}

// Department list params
export interface DepartmentListParams extends DepartmentFilters {
  page?: number
  per_page?: number
}

// Department create request
export interface DepartmentCreateRequest {
  name: string
  description?: string
  parent_id?: string
  manager_id?: string
}

// Department update request
export interface DepartmentUpdateRequest {
  name?: string
  description?: string
  parent_id?: string
  manager_id?: string
  status?: DepartmentStatus
}

// Department store state
export interface DepartmentState {
  departments: DepartmentListItem[]
  currentDepartment: Department | null
  hierarchy: DepartmentHierarchyNode[]
  filters: DepartmentFilters
  isLoading: boolean
  isLoadingHierarchy: boolean
  error: string | null
}

// Alias for backwards compatibility
export type DepartmentHierarchy = DepartmentHierarchyNode

// API Response types
export interface DepartmentListResponse {
  success: boolean
  data: DepartmentListItem[]
  meta: {
    total_departments: number
    timestamp: string
  }
}

export interface DepartmentResponse {
  success: boolean
  data: Department
  meta: {
    timestamp: string
  }
}

export interface DepartmentHierarchyResponse {
  success: boolean
  data: DepartmentHierarchyNode[]
  meta: {
    total_departments: number
    max_depth: number
    timestamp: string
  }
}

export interface DepartmentEmployeesResponse {
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
