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
      per_page: number
      total_items: number
      total_pages: number
    }
    timestamp: string
  }
}

interface TeamResponse {
  success: boolean
  data: EmployeeTeamMember[]
  meta: {
    total_direct_reports: number
    timestamp: string
  }
}

/**
 * Employee Service
 * 
 * Communicates with the Employee Microservice
 * Backend: Node.js/Express + MongoDB
 * Repository: performance-monitoring-tool-api
 */
export const employeeService = {
  /**
   * List employees with filtering and pagination
   * GET /api/v1/employees
   */
  async list(params: EmployeeListParams = {}) {
    const queryParams = new URLSearchParams()
    
    if (params.page) queryParams.set('page', String(params.page))
    if (params.per_page) queryParams.set('per_page', String(params.per_page))
    if (params.search) queryParams.set('search', params.search)
    if (params.department_id) queryParams.set('department_id', params.department_id)
    if (params.manager_id) queryParams.set('manager_id', params.manager_id)
    if (params.employment_status) queryParams.set('status', params.employment_status)
    if (params.employment_type) queryParams.set('employment_type', params.employment_type)
    if (params.work_location) queryParams.set('work_location', params.work_location)
    if (params.role) queryParams.set('role', params.role)
    if (params.sort_by) queryParams.set('sort_by', params.sort_by)
    if (params.sort_order) queryParams.set('sort_order', params.sort_order)

    const query = queryParams.toString()
    const endpoint = `/employees${query ? `?${query}` : ''}`
    
    return api.get<PaginatedResponse<EmployeeListItem>['data']>(endpoint, {
      service: 'employees'
    }) as Promise<PaginatedResponse<EmployeeListItem>>
  },

  /**
   * Get employee by ID
   * GET /api/v1/employees/:id
   */
  async get(id: string) {
    return api.get<Employee>(`/employees/${id}`, {
      service: 'employees'
    })
  },

  /**
   * Create a new employee
   * POST /api/v1/employees
   */
  async create(data: EmployeeCreateRequest) {
    return api.post<Employee>('/employees', data, {
      service: 'employees'
    })
  },

  /**
   * Update an employee
   * PUT /api/v1/employees/:id
   */
  async update(id: string, data: EmployeeUpdateRequest) {
    return api.put<Employee>(`/employees/${id}`, data, {
      service: 'employees'
    })
  },

  /**
   * Delete an employee (soft delete)
   * DELETE /api/v1/employees/:id
   */
  async delete(id: string) {
    return api.delete<undefined>(`/employees/${id}`, {
      service: 'employees'
    })
  },

  /**
   * Get employee's goals
   * GET /api/v1/employees/:id/goals
   */
  async getGoals(id: string, params: { status?: string; type?: string; page?: number; per_page?: number } = {}) {
    const queryParams = new URLSearchParams()
    
    if (params.status) queryParams.set('status', params.status)
    if (params.type) queryParams.set('type', params.type)
    if (params.page) queryParams.set('page', String(params.page))
    if (params.per_page) queryParams.set('per_page', String(params.per_page))

    const query = queryParams.toString()
    const endpoint = `/employees/${id}/goals${query ? `?${query}` : ''}`
    
    return api.get<PaginatedResponse<EmployeeGoalSummary>['data']>(endpoint, {
      service: 'employees'
    }) as Promise<PaginatedResponse<EmployeeGoalSummary>>
  },

  /**
   * Get employee's reviews
   * GET /api/v1/employees/:id/reviews
   */
  async getReviews(id: string, params: { cycle_id?: string; type?: string; status?: string } = {}) {
    const queryParams = new URLSearchParams()
    
    if (params.cycle_id) queryParams.set('cycle_id', params.cycle_id)
    if (params.type) queryParams.set('type', params.type)
    if (params.status) queryParams.set('status', params.status)

    const query = queryParams.toString()
    const endpoint = `/employees/${id}/reviews${query ? `?${query}` : ''}`
    
    return api.get<EmployeeReviewSummary[]>(endpoint, {
      service: 'employees'
    }) as Promise<ApiResponse<EmployeeReviewSummary[]>>
  },

  /**
   * Get employee's direct reports (team)
   * GET /api/v1/employees/:id/team
   */
  async getTeam(id: string) {
    return api.get<TeamResponse['data']>(`/employees/${id}/team`, {
      service: 'employees'
    }) as Promise<TeamResponse>
  }
}
