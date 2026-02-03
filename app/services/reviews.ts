// Reviews Service - API calls for reviews management
import { api } from '~/utils/api'
import type {
  ReviewCycle,
  ReviewCycleListItem,
  ReviewCycleListParams,
  ReviewCycleCreateRequest,
  ReviewCycleUpdateRequest,
  Review,
  ReviewListItem,
  ReviewListParams,
  ReviewUpdateRequest,
  ReviewAcknowledgeRequest,
  LaunchCycleResponse
} from '~/types/review'
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

/**
 * Reviews Service - Communicates with the API Gateway
 */
export const reviewsService = {
  // ============================================
  // REVIEW CYCLES
  // ============================================

  /**
   * List review cycles with filtering and pagination
   * GET /api/v1/review-cycles
   */
  async listCycles(params: ReviewCycleListParams = {}) {
    const queryParams = new URLSearchParams()
    
    // Query params stay snake_case per API convention
    if (params.page) queryParams.set('page', String(params.page))
    if (params.perPage) queryParams.set('per_page', String(params.perPage))
    if (params.search) queryParams.set('search', params.search)
    if (params.status) queryParams.set('status', params.status)
    if (params.type) queryParams.set('type', params.type)
    if (params.year) queryParams.set('year', String(params.year))

    const query = queryParams.toString()
    const endpoint = `/review-cycles${query ? `?${query}` : ''}`
    
    return api.get<PaginatedResponse<ReviewCycleListItem>['data']>(endpoint) as Promise<PaginatedResponse<ReviewCycleListItem>>
  },

  /**
   * Get review cycle by ID
   * GET /api/v1/review-cycles/:id
   */
  async getCycle(id: string) {
    return api.get<ReviewCycle>(`/review-cycles/${id}`)
  },

  /**
   * Create a new review cycle
   * POST /api/v1/review-cycles
   */
  async createCycle(data: ReviewCycleCreateRequest) {
    return api.post<ReviewCycle>('/review-cycles', data)
  },

  /**
   * Update a review cycle
   * PUT /api/v1/review-cycles/:id
   */
  async updateCycle(id: string, data: ReviewCycleUpdateRequest) {
    return api.put<ReviewCycle>(`/review-cycles/${id}`, data)
  },

  /**
   * Delete a review cycle
   * DELETE /api/v1/review-cycles/:id
   */
  async deleteCycle(id: string) {
    return api.delete<undefined>(`/review-cycles/${id}`)
  },

  /**
   * Launch a review cycle
   * POST /api/v1/review-cycles/:id/launch
   */
  async launchCycle(id: string) {
    return api.post<LaunchCycleResponse>(`/review-cycles/${id}/launch`, {}) as Promise<ApiResponse<LaunchCycleResponse>>
  },

  // ============================================
  // REVIEWS
  // ============================================

  /**
   * List reviews with filtering and pagination
   * GET /api/v1/reviews
   */
  async listReviews(params: ReviewListParams = {}) {
    const queryParams = new URLSearchParams()
    
    // Query params stay snake_case per API convention
    if (params.page) queryParams.set('page', String(params.page))
    if (params.perPage) queryParams.set('per_page', String(params.perPage))
    if (params.search) queryParams.set('search', params.search)
    if (params.cycleId) queryParams.set('cycle_id', params.cycleId)
    if (params.employeeId) queryParams.set('employee_id', params.employeeId)
    if (params.reviewerId) queryParams.set('reviewer_id', params.reviewerId)
    if (params.type) queryParams.set('type', params.type)
    if (params.status) queryParams.set('status', params.status)
    if (params.sortBy) queryParams.set('sort_by', params.sortBy)
    if (params.sortOrder) queryParams.set('sort_order', params.sortOrder)

    const query = queryParams.toString()
    const endpoint = `/reviews${query ? `?${query}` : ''}`
    
    return api.get<PaginatedResponse<ReviewListItem>['data']>(endpoint) as Promise<PaginatedResponse<ReviewListItem>>
  },

  /**
   * Get review by ID
   * GET /api/v1/reviews/:id
   */
  async getReview(id: string) {
    return api.get<Review>(`/reviews/${id}`)
  },

  /**
   * Update/submit a review
   * PUT /api/v1/reviews/:id
   */
  async updateReview(id: string, data: ReviewUpdateRequest) {
    return api.put<Review>(`/reviews/${id}`, data)
  },

  /**
   * Acknowledge a review
   * POST /api/v1/reviews/:id/acknowledge
   */
  async acknowledgeReview(id: string, data: ReviewAcknowledgeRequest = {}) {
    return api.post<Review>(`/reviews/${id}/acknowledge`, data)
  },

  // ============================================
  // MY REVIEWS (Convenience methods)
  // ============================================

  /**
   * Get my pending self-assessments
   */
  async getMyPendingSelfAssessments() {
    return this.listReviews({
      type: 'self',
      status: 'pending'
    })
  },

  /**
   * Get reviews I need to complete as a manager
   */
  async getMyPendingManagerReviews() {
    return this.listReviews({
      type: 'manager',
      status: 'pending'
    })
  },

  /**
   * Get my review history (as employee)
   */
  async getMyReviewHistory(params: { page?: number; perPage?: number } = {}) {
    return this.listReviews({
      ...params,
      status: 'acknowledged'
    })
  }
}
