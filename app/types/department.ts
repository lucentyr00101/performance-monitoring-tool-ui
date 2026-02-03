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
  employeeCount: number
}

// Department entity
export interface Department {
  id: string
  name: string
  description?: string
  parentId?: string
  parent?: DepartmentParent
  managerId?: string
  manager?: EmployeeManager
  subDepartments?: SubDepartment[]
  employeeCount: number
  status: DepartmentStatus
  createdAt: string
  updatedAt: string
}

// Department list item (lighter version)
export interface DepartmentListItem {
  id: string
  name: string
  description?: string
  parent?: DepartmentParent
  manager?: EmployeeManager
  employeeCount: number
  status: DepartmentStatus
}

// Department hierarchy node (for org tree)
export interface DepartmentHierarchyNode {
  id: string
  name: string
  employeeCount: number
  manager?: EmployeeManager
  children: DepartmentHierarchyNode[]
}

// Department filter options
export interface DepartmentFilters {
  search?: string
  status?: DepartmentStatus
  parentId?: string
}

// Department list params
export interface DepartmentListParams extends DepartmentFilters {
  page?: number
  perPage?: number
}

// Department create request
export interface DepartmentCreateRequest {
  name: string
  description?: string
  parentId?: string
  managerId?: string
}

// Department update request
export interface DepartmentUpdateRequest {
  name?: string
  description?: string
  parentId?: string
  managerId?: string
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
    totalDepartments: number
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
    totalDepartments: number
    maxDepth: number
    timestamp: string
  }
}

export interface DepartmentEmployeesResponse {
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
