// Employee Service - API calls for employee management
import { api } from '~/utils/api'
import type {
  Employee,
  EmployeeListItem,
  EmployeeListParams,
  EmployeeCreateRequest,
  EmployeeUpdateRequest,
  EmployeeGoalSummary,
  EmployeeReviewSummary,
  EmployeeTeamMember
} from '~/types/employee'
import type { ApiResponse } from '~/types/auth'

interface PaginatedResponse<T> {
  success: boolean
  data: T[]
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

interface TeamResponse {
  success: boolean
  data: EmployeeTeamMember[]
  meta: {
    totalDirectReports: number
    timestamp: string
  }
}

/**
 * Employee Service - Communicates with the API Gateway
 */
export const employeeService = {
  /**
   * List employees with filtering and pagination
   * GET /api/v1/employees
   */
  async list(params: EmployeeListParams = {}) {
    const queryParams = new URLSearchParams()
    
    // Query params stay snake_case per API convention
    if (params.page) queryParams.set('page', String(params.page))
    if (params.perPage) queryParams.set('per_page', String(params.perPage))
    if (params.search) queryParams.set('search', params.search)
    if (params.departmentId) queryParams.set('department_id', params.departmentId)
    if (params.managerId) queryParams.set('manager_id', params.managerId)
    if (params.employmentStatus) queryParams.set('status', params.employmentStatus)
    if (params.employmentType) queryParams.set('employment_type', params.employmentType)
    if (params.workLocation) queryParams.set('work_location', params.workLocation)
    if (params.role) queryParams.set('role', params.role)
    if (params.sortBy) queryParams.set('sort_by', params.sortBy)
    if (params.sortOrder) queryParams.set('sort_order', params.sortOrder)

    const query = queryParams.toString()
    const endpoint = `/employees${query ? `?${query}` : ''}`
    
    return api.get<PaginatedResponse<EmployeeListItem>['data']>(endpoint) as Promise<PaginatedResponse<EmployeeListItem>>
  },

  /**
   * Get employee by ID
   * GET /api/v1/employees/:id
   */
  async get(id: string) {
    return api.get<Employee>(`/employees/${id}`)
  },

  /**
   * Create a new employee
   * POST /api/v1/employees
   */
  async create(data: EmployeeCreateRequest) {
    return api.post<Employee>('/employees', data)
  },

  /**
   * Update an employee
   * PUT /api/v1/employees/:id
   */
  async update(id: string, data: EmployeeUpdateRequest) {
    return api.put<Employee>(`/employees/${id}`, data)
  },

  /**
   * Delete an employee (soft delete)
   * DELETE /api/v1/employees/:id
   */
  async delete(id: string) {
    return api.delete<undefined>(`/employees/${id}`)
  },

  /**
   * Get employee's goals
   * GET /api/v1/employees/:id/goals
   */
  async getGoals(id: string, params: { status?: string; type?: string; page?: number; perPage?: number } = {}) {
    const queryParams = new URLSearchParams()
    
    if (params.status) queryParams.set('status', params.status)
    if (params.type) queryParams.set('type', params.type)
    if (params.page) queryParams.set('page', String(params.page))
    if (params.perPage) queryParams.set('per_page', String(params.perPage))

    const query = queryParams.toString()
    const endpoint = `/employees/${id}/goals${query ? `?${query}` : ''}`
    
    return api.get<PaginatedResponse<EmployeeGoalSummary>['data']>(endpoint) as Promise<PaginatedResponse<EmployeeGoalSummary>>
  },

  /**
   * Get employee's reviews
   * GET /api/v1/employees/:id/reviews
   */
  async getReviews(id: string, params: { cycleId?: string; type?: string; status?: string } = {}) {
    const queryParams = new URLSearchParams()
    
    if (params.cycleId) queryParams.set('cycle_id', params.cycleId)
    if (params.type) queryParams.set('type', params.type)
    if (params.status) queryParams.set('status', params.status)

    const query = queryParams.toString()
    const endpoint = `/employees/${id}/reviews${query ? `?${query}` : ''}`
    
    return api.get<EmployeeReviewSummary[]>(endpoint) as Promise<ApiResponse<EmployeeReviewSummary[]>>
  },

  /**
   * Get employee's direct reports (team)
   * GET /api/v1/employees/:id/team
   */
  async getTeam(id: string) {
    return api.get<TeamResponse['data']>(`/employees/${id}/team`) as Promise<TeamResponse>
  }
}
