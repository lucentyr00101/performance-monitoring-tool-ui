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
    totalDepartments: number
    timestamp: string
  }
}

interface DepartmentHierarchyResponse {
  success: boolean
  data: DepartmentHierarchyNode[]
  meta: {
    totalDepartments: number
    maxDepth: number
    timestamp: string
  }
}

interface DepartmentEmployeesResponse {
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

/**
 * Department Service - Communicates with the API Gateway
 */
export const departmentService = {
  /**
   * List all departments with optional filtering
   * GET /api/v1/departments
   */
  async list(params: DepartmentListParams = {}) {
    const queryParams = new URLSearchParams()
    
    // Query params stay snake_case per API convention
    if (params.search) queryParams.set('search', params.search)
    if (params.status) queryParams.set('status', params.status)
    if (params.parentId) queryParams.set('parent_id', params.parentId)

    const query = queryParams.toString()
    const endpoint = `/departments${query ? `?${query}` : ''}`
    
    return api.get<DepartmentListResponse['data']>(endpoint) as Promise<DepartmentListResponse>
  },

  /**
   * Get department by ID
   * GET /api/v1/departments/:id
   */
  async get(id: string) {
    return api.get<Department>(`/departments/${id}`)
  },

  /**
   * Create a new department
   * POST /api/v1/departments
   */
  async create(data: DepartmentCreateRequest) {
    return api.post<Department>('/departments', data)
  },

  /**
   * Update a department
   * PUT /api/v1/departments/:id
   */
  async update(id: string, data: DepartmentUpdateRequest) {
    return api.put<Department>(`/departments/${id}`, data)
  },

  /**
   * Delete a department
   * DELETE /api/v1/departments/:id
   */
  async delete(id: string) {
    return api.delete<undefined>(`/departments/${id}`)
  },

  /**
   * Get employees in a department
   * GET /api/v1/departments/:id/employees
   */
  async getEmployees(
    id: string, 
    params: { includeSub?: boolean; status?: string; page?: number; perPage?: number } = {}
  ) {
    const queryParams = new URLSearchParams()
    
    if (params.includeSub) queryParams.set('include_sub', 'true')
    if (params.status) queryParams.set('status', params.status)
    if (params.page) queryParams.set('page', String(params.page))
    if (params.perPage) queryParams.set('per_page', String(params.perPage))

    const query = queryParams.toString()
    const endpoint = `/departments/${id}/employees${query ? `?${query}` : ''}`
    
    return api.get<DepartmentEmployeesResponse['data']>(endpoint) as Promise<DepartmentEmployeesResponse>
  },

  /**
   * Get organizational hierarchy tree
   * GET /api/v1/departments/hierarchy
   */
  async getHierarchy() {
    return api.get<DepartmentHierarchyResponse['data']>('/departments/hierarchy') as Promise<DepartmentHierarchyResponse>
  }
}
