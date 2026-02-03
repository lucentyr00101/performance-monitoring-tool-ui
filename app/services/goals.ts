// Goals Service - API calls for goals management
import { api } from '~/utils/api'
import type {
  Goal,
  GoalListItem,
  GoalListParams,
  GoalCreateRequest,
  GoalUpdateRequest,
  GoalProgressRequest,
  KeyResult,
  KeyResultCreateRequest,
  KeyResultUpdateRequest,
  GoalTemplate,
  ProgressHistory
} from '~/types/goal'
import type { ApiResponse } from '~/types/auth'

interface PaginatedResponse<T> {
  success: boolean
  data: T[]
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

interface GoalApprovalResponse {
  id: string
  status: string
  action: 'approve' | 'reject'
  comment?: string
  updatedAt: string
}

interface ProgressUpdateResponse {
  id: string
  progress: number
  status: string
  updatedAt: string
}

/**
 * Goals Service - Communicates with the API Gateway
 */
export const goalsService = {
  /**
   * List goals with filtering and pagination
   * GET /api/v1/goals
   */
  async list(params: GoalListParams = {}) {
    const queryParams = new URLSearchParams()
    
    // Query params stay snake_case per API convention
    if (params.page) queryParams.set('page', String(params.page))
    if (params.perPage) queryParams.set('per_page', String(params.perPage))
    if (params.search) queryParams.set('search', params.search)
    if (params.type) queryParams.set('type', params.type)
    if (params.status) queryParams.set('status', params.status)
    if (params.ownerId) queryParams.set('owner_id', params.ownerId)
    if (params.departmentId) queryParams.set('department_id', params.departmentId)
    if (params.parentGoalId) queryParams.set('parent_goal_id', params.parentGoalId)
    if (params.dueBefore) queryParams.set('due_before', params.dueBefore)
    if (params.dueAfter) queryParams.set('due_after', params.dueAfter)
    if (params.priority) queryParams.set('priority', params.priority)
    if (params.sortBy) queryParams.set('sort_by', params.sortBy)
    if (params.sortOrder) queryParams.set('sort_order', params.sortOrder)

    const query = queryParams.toString()
    const endpoint = `/goals${query ? `?${query}` : ''}`
    
    return api.get<PaginatedResponse<GoalListItem>['data']>(endpoint) as Promise<PaginatedResponse<GoalListItem>>
  },

  /**
   * Get goal by ID
   * GET /api/v1/goals/:id
   */
  async get(id: string) {
    return api.get<Goal>(`/goals/${id}`)
  },

  /**
   * Create a new goal
   * POST /api/v1/goals
   */
  async create(data: GoalCreateRequest) {
    return api.post<Goal>('/goals', data)
  },

  /**
   * Update a goal
   * PUT /api/v1/goals/:id
   */
  async update(id: string, data: GoalUpdateRequest) {
    return api.put<Goal>(`/goals/${id}`, data)
  },

  /**
   * Delete/cancel a goal
   * DELETE /api/v1/goals/:id
   */
  async delete(id: string) {
    return api.delete<undefined>(`/goals/${id}`)
  },

  /**
   * Update goal progress
   * PATCH /api/v1/goals/:id/progress
   */
  async updateProgress(id: string, data: GoalProgressRequest) {
    return api.patch<ProgressUpdateResponse>(`/goals/${id}/progress`, data) as Promise<ApiResponse<ProgressUpdateResponse>>
  },

  /**
   * Submit goal for approval
   * POST /api/v1/goals/:id/submit
   */
  async submit(id: string) {
    return api.post<Goal>(`/goals/${id}/submit`, {})
  },

  /**
   * Approve or reject a goal (manager action)
   * POST /api/v1/goals/:id/approve
   */
  async approve(id: string, action: 'approve' | 'reject', comment?: string) {
    return api.post<GoalApprovalResponse>(`/goals/${id}/approve`, { action, comment }) as Promise<ApiResponse<GoalApprovalResponse>>
  },

  /**
   * Get goal progress history
   * GET /api/v1/goals/:id/history
   */
  async getHistory(id: string, params: { page?: number; perPage?: number } = {}) {
    const queryParams = new URLSearchParams()
    
    if (params.page) queryParams.set('page', String(params.page))
    if (params.perPage) queryParams.set('per_page', String(params.perPage))

    const query = queryParams.toString()
    const endpoint = `/goals/${id}/history${query ? `?${query}` : ''}`
    
    return api.get<PaginatedResponse<ProgressHistory>['data']>(endpoint) as Promise<PaginatedResponse<ProgressHistory>>
  },

  // ============================================
  // KEY RESULTS
  // ============================================

  /**
   * Get key results for a goal
   * GET /api/v1/goals/:id/key-results
   */
  async getKeyResults(goalId: string) {
    return api.get<KeyResult[]>(`/goals/${goalId}/key-results`) as Promise<ApiResponse<KeyResult[]>>
  },

  /**
   * Add key result to a goal
   * POST /api/v1/goals/:id/key-results
   */
  async addKeyResult(goalId: string, data: KeyResultCreateRequest) {
    return api.post<KeyResult>(`/goals/${goalId}/key-results`, data)
  },

  /**
   * Update a key result
   * PUT /api/v1/goals/:id/key-results/:krId
   */
  async updateKeyResult(goalId: string, krId: string, data: KeyResultUpdateRequest) {
    return api.put<KeyResult>(`/goals/${goalId}/key-results/${krId}`, data)
  },

  /**
   * Delete a key result
   * DELETE /api/v1/goals/:id/key-results/:krId
   */
  async deleteKeyResult(goalId: string, krId: string) {
    return api.delete<undefined>(`/goals/${goalId}/key-results/${krId}`)
  },

  // ============================================
  // TEMPLATES
  // ============================================

  /**
   * List goal templates
   * GET /api/v1/goals/templates
   */
  async getTemplates(params: { type?: string; category?: string; activeOnly?: boolean } = {}) {
    const queryParams = new URLSearchParams()
    
    if (params.type) queryParams.set('type', params.type)
    if (params.category) queryParams.set('category', params.category)
    if (params.activeOnly !== undefined) queryParams.set('active_only', String(params.activeOnly))

    const query = queryParams.toString()
    const endpoint = `/goals/templates${query ? `?${query}` : ''}`
    
    return api.get<GoalTemplate[]>(endpoint) as Promise<ApiResponse<GoalTemplate[]>>
  },

  /**
   * Get template by ID
   * GET /api/v1/goals/templates/:id
   */
  async getTemplate(id: string) {
    return api.get<GoalTemplate>(`/goals/templates/${id}`)
  }
}
