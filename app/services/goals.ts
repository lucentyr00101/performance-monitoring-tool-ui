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
    pagination: {
      page: number
      per_page: number
      total_items: number
      total_pages: number
    }
    timestamp: string
  }
}

interface GoalApprovalResponse {
  id: string
  status: string
  action: 'approve' | 'reject'
  comment?: string
  updated_at: string
}

interface ProgressUpdateResponse {
  id: string
  progress: number
  status: string
  updated_at: string
}

/**
 * Goals Service
 * 
 * Communicates with the Goals Microservice
 * In mock mode, routes to server/api/goals/*
 */
export const goalsService = {
  /**
   * List goals with filtering and pagination
   * GET /api/goals
   */
  async list(params: GoalListParams = {}) {
    const queryParams = new URLSearchParams()
    
    if (params.page) queryParams.set('page', String(params.page))
    if (params.per_page) queryParams.set('per_page', String(params.per_page))
    if (params.search) queryParams.set('search', params.search)
    if (params.type) queryParams.set('type', params.type)
    if (params.status) queryParams.set('status', params.status)
    if (params.owner_id) queryParams.set('owner_id', params.owner_id)
    if (params.department_id) queryParams.set('department_id', params.department_id)
    if (params.parent_goal_id) queryParams.set('parent_goal_id', params.parent_goal_id)
    if (params.due_before) queryParams.set('due_before', params.due_before)
    if (params.due_after) queryParams.set('due_after', params.due_after)
    if (params.priority) queryParams.set('priority', params.priority)
    if (params.sort_by) queryParams.set('sort_by', params.sort_by)
    if (params.sort_order) queryParams.set('sort_order', params.sort_order)

    const query = queryParams.toString()
    const endpoint = `/goals${query ? `?${query}` : ''}`
    
    return api.get<PaginatedResponse<GoalListItem>['data']>(endpoint, {
      service: 'goals'
    }) as Promise<PaginatedResponse<GoalListItem>>
  },

  /**
   * Get goal by ID
   * GET /api/goals/:id
   */
  async get(id: string) {
    return api.get<Goal>(`/goals/${id}`, {
      service: 'goals'
    })
  },

  /**
   * Create a new goal
   * POST /api/goals
   */
  async create(data: GoalCreateRequest) {
    return api.post<Goal>('/goals', data, {
      service: 'goals'
    })
  },

  /**
   * Update a goal
   * PUT /api/goals/:id
   */
  async update(id: string, data: GoalUpdateRequest) {
    return api.put<Goal>(`/goals/${id}`, data, {
      service: 'goals'
    })
  },

  /**
   * Delete/cancel a goal
   * DELETE /api/goals/:id
   */
  async delete(id: string) {
    return api.delete<undefined>(`/goals/${id}`, {
      service: 'goals'
    })
  },

  /**
   * Update goal progress
   * PATCH /api/goals/:id/progress
   */
  async updateProgress(id: string, data: GoalProgressRequest) {
    return api.patch<ProgressUpdateResponse>(`/goals/${id}/progress`, data, {
      service: 'goals'
    }) as Promise<ApiResponse<ProgressUpdateResponse>>
  },

  /**
   * Submit goal for approval
   * POST /api/goals/:id/submit
   */
  async submit(id: string) {
    return api.post<Goal>(`/goals/${id}/submit`, {}, {
      service: 'goals'
    })
  },

  /**
   * Approve or reject a goal (manager action)
   * POST /api/goals/:id/approve
   */
  async approve(id: string, action: 'approve' | 'reject', comment?: string) {
    return api.post<GoalApprovalResponse>(`/goals/${id}/approve`, { action, comment }, {
      service: 'goals'
    }) as Promise<ApiResponse<GoalApprovalResponse>>
  },

  /**
   * Get goal progress history
   * GET /api/goals/:id/history
   */
  async getHistory(id: string, params: { page?: number; per_page?: number } = {}) {
    const queryParams = new URLSearchParams()
    
    if (params.page) queryParams.set('page', String(params.page))
    if (params.per_page) queryParams.set('per_page', String(params.per_page))

    const query = queryParams.toString()
    const endpoint = `/goals/${id}/history${query ? `?${query}` : ''}`
    
    return api.get<PaginatedResponse<ProgressHistory>['data']>(endpoint, {
      service: 'goals'
    }) as Promise<PaginatedResponse<ProgressHistory>>
  },

  // ============================================
  // KEY RESULTS
  // ============================================

  /**
   * Get key results for a goal
   * GET /api/goals/:id/key-results
   */
  async getKeyResults(goalId: string) {
    return api.get<KeyResult[]>(`/goals/${goalId}/key-results`, {
      service: 'goals'
    }) as Promise<ApiResponse<KeyResult[]>>
  },

  /**
   * Add key result to a goal
   * POST /api/goals/:id/key-results
   */
  async addKeyResult(goalId: string, data: KeyResultCreateRequest) {
    return api.post<KeyResult>(`/goals/${goalId}/key-results`, data, {
      service: 'goals'
    })
  },

  /**
   * Update a key result
   * PUT /api/goals/:id/key-results/:krId
   */
  async updateKeyResult(goalId: string, krId: string, data: KeyResultUpdateRequest) {
    return api.put<KeyResult>(`/goals/${goalId}/key-results/${krId}`, data, {
      service: 'goals'
    })
  },

  /**
   * Delete a key result
   * DELETE /api/goals/:id/key-results/:krId
   */
  async deleteKeyResult(goalId: string, krId: string) {
    return api.delete<undefined>(`/goals/${goalId}/key-results/${krId}`, {
      service: 'goals'
    })
  },

  // ============================================
  // TEMPLATES
  // ============================================

  /**
   * List goal templates
   * GET /api/goals/templates
   */
  async getTemplates(params: { type?: string; category?: string; active_only?: boolean } = {}) {
    const queryParams = new URLSearchParams()
    
    if (params.type) queryParams.set('type', params.type)
    if (params.category) queryParams.set('category', params.category)
    if (params.active_only !== undefined) queryParams.set('active_only', String(params.active_only))

    const query = queryParams.toString()
    const endpoint = `/goals/templates${query ? `?${query}` : ''}`
    
    return api.get<GoalTemplate[]>(endpoint, {
      service: 'goals'
    }) as Promise<ApiResponse<GoalTemplate[]>>
  },

  /**
   * Get template by ID
   * GET /api/goals/templates/:id
   */
  async getTemplate(id: string) {
    return api.get<GoalTemplate>(`/goals/templates/${id}`, {
      service: 'goals'
    })
  }
}
