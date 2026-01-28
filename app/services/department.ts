// Department Service - API calls for department management
import { api } from '~/utils/api'
import type {
  Department,
  DepartmentListItem,
  DepartmentListParams,
  DepartmentCreateRequest,
  DepartmentUpdateRequest,
  DepartmentHierarchyNode
} from '~/types/department'
import type { EmployeeListItem } from '~/types/employee'

interface DepartmentListResponse {
  success: boolean
  data: DepartmentListItem[]
  meta: {
    total_departments: number
    timestamp: string
  }
}

interface DepartmentHierarchyResponse {
  success: boolean
  data: DepartmentHierarchyNode[]
  meta: {
    total_departments: number
    max_depth: number
    timestamp: string
  }
}

interface DepartmentEmployeesResponse {
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

/**
 * Department Service
 * 
 * Communicates with the Employee Microservice (departments are part of employee service)
 * Backend: Node.js/Express + MongoDB
 * Repository: performance-monitoring-tool-api
 */
export const departmentService = {
  /**
   * List all departments with optional filtering
   * GET /api/v1/departments
   */
  async list(params: DepartmentListParams = {}) {
    const queryParams = new URLSearchParams()
    
    if (params.search) queryParams.set('search', params.search)
    if (params.status) queryParams.set('status', params.status)
    if (params.parent_id) queryParams.set('parent_id', params.parent_id)

    const query = queryParams.toString()
    const endpoint = `/departments${query ? `?${query}` : ''}`
    
    return api.get<DepartmentListResponse['data']>(endpoint, {
      service: 'employees'
    }) as Promise<DepartmentListResponse>
  },

  /**
   * Get department by ID
   * GET /api/v1/departments/:id
   */
  async get(id: string) {
    return api.get<Department>(`/departments/${id}`, {
      service: 'employees'
    })
  },

  /**
   * Create a new department
   * POST /api/v1/departments
   */
  async create(data: DepartmentCreateRequest) {
    return api.post<Department>('/departments', data, {
      service: 'employees'
    })
  },

  /**
   * Update a department
   * PUT /api/v1/departments/:id
   */
  async update(id: string, data: DepartmentUpdateRequest) {
    return api.put<Department>(`/departments/${id}`, data, {
      service: 'employees'
    })
  },

  /**
   * Delete a department
   * DELETE /api/v1/departments/:id
   */
  async delete(id: string) {
    return api.delete<undefined>(`/departments/${id}`, {
      service: 'employees'
    })
  },

  /**
   * Get employees in a department
   * GET /api/v1/departments/:id/employees
   */
  async getEmployees(
    id: string, 
    params: { include_sub?: boolean; status?: string; page?: number; per_page?: number } = {}
  ) {
    const queryParams = new URLSearchParams()
    
    if (params.include_sub) queryParams.set('include_sub', 'true')
    if (params.status) queryParams.set('status', params.status)
    if (params.page) queryParams.set('page', String(params.page))
    if (params.per_page) queryParams.set('per_page', String(params.per_page))

    const query = queryParams.toString()
    const endpoint = `/departments/${id}/employees${query ? `?${query}` : ''}`
    
    return api.get<DepartmentEmployeesResponse['data']>(endpoint, {
      service: 'employees'
    }) as Promise<DepartmentEmployeesResponse>
  },

  /**
   * Get organizational hierarchy tree
   * GET /api/v1/departments/hierarchy
   */
  async getHierarchy() {
    return api.get<DepartmentHierarchyResponse['data']>('/departments/hierarchy', {
      service: 'employees'
    }) as Promise<DepartmentHierarchyResponse>
  }
}
