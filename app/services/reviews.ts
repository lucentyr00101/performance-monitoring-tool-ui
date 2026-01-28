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
      per_page: number
      total_items: number
      total_pages: number
    }
    timestamp: string
  }
}

/**
 * Reviews Service
 * 
 * Communicates with the Reviews Microservice
 * In mock mode, routes to server/api/review-cycles/* and server/api/reviews/*
 */
export const reviewsService = {
  // ============================================
  // REVIEW CYCLES
  // ============================================

  /**
   * List review cycles with filtering and pagination
   * GET /api/review-cycles
   */
  async listCycles(params: ReviewCycleListParams = {}) {
    const queryParams = new URLSearchParams()
    
    if (params.page) queryParams.set('page', String(params.page))
    if (params.per_page) queryParams.set('per_page', String(params.per_page))
    if (params.search) queryParams.set('search', params.search)
    if (params.status) queryParams.set('status', params.status)
    if (params.type) queryParams.set('type', params.type)
    if (params.year) queryParams.set('year', String(params.year))

    const query = queryParams.toString()
    const endpoint = `/review-cycles${query ? `?${query}` : ''}`
    
    return api.get<PaginatedResponse<ReviewCycleListItem>['data']>(endpoint, {
      service: 'reviews'
    }) as Promise<PaginatedResponse<ReviewCycleListItem>>
  },

  /**
   * Get review cycle by ID
   * GET /api/review-cycles/:id
   */
  async getCycle(id: string) {
    return api.get<ReviewCycle>(`/review-cycles/${id}`, {
      service: 'reviews'
    })
  },

  /**
   * Create a new review cycle
   * POST /api/review-cycles
   */
  async createCycle(data: ReviewCycleCreateRequest) {
    return api.post<ReviewCycle>('/review-cycles', data, {
      service: 'reviews'
    })
  },

  /**
   * Update a review cycle
   * PUT /api/review-cycles/:id
   */
  async updateCycle(id: string, data: ReviewCycleUpdateRequest) {
    return api.put<ReviewCycle>(`/review-cycles/${id}`, data, {
      service: 'reviews'
    })
  },

  /**
   * Delete a review cycle
   * DELETE /api/review-cycles/:id
   */
  async deleteCycle(id: string) {
    return api.delete<undefined>(`/review-cycles/${id}`, {
      service: 'reviews'
    })
  },

  /**
   * Launch a review cycle
   * POST /api/review-cycles/:id/launch
   */
  async launchCycle(id: string) {
    return api.post<LaunchCycleResponse>(`/review-cycles/${id}/launch`, {}, {
      service: 'reviews'
    }) as Promise<ApiResponse<LaunchCycleResponse>>
  },

  // ============================================
  // REVIEWS
  // ============================================

  /**
   * List reviews with filtering and pagination
   * GET /api/reviews
   */
  async listReviews(params: ReviewListParams = {}) {
    const queryParams = new URLSearchParams()
    
    if (params.page) queryParams.set('page', String(params.page))
    if (params.per_page) queryParams.set('per_page', String(params.per_page))
    if (params.search) queryParams.set('search', params.search)
    if (params.cycle_id) queryParams.set('cycle_id', params.cycle_id)
    if (params.employee_id) queryParams.set('employee_id', params.employee_id)
    if (params.reviewer_id) queryParams.set('reviewer_id', params.reviewer_id)
    if (params.type) queryParams.set('type', params.type)
    if (params.status) queryParams.set('status', params.status)
    if (params.sort_by) queryParams.set('sort_by', params.sort_by)
    if (params.sort_order) queryParams.set('sort_order', params.sort_order)

    const query = queryParams.toString()
    const endpoint = `/reviews${query ? `?${query}` : ''}`
    
    return api.get<PaginatedResponse<ReviewListItem>['data']>(endpoint, {
      service: 'reviews'
    }) as Promise<PaginatedResponse<ReviewListItem>>
  },

  /**
   * Get review by ID
   * GET /api/reviews/:id
   */
  async getReview(id: string) {
    return api.get<Review>(`/reviews/${id}`, {
      service: 'reviews'
    })
  },

  /**
   * Update/submit a review
   * PUT /api/reviews/:id
   */
  async updateReview(id: string, data: ReviewUpdateRequest) {
    return api.put<Review>(`/reviews/${id}`, data, {
      service: 'reviews'
    })
  },

  /**
   * Acknowledge a review
   * POST /api/reviews/:id/acknowledge
   */
  async acknowledgeReview(id: string, data: ReviewAcknowledgeRequest = {}) {
    return api.post<Review>(`/reviews/${id}/acknowledge`, data, {
      service: 'reviews'
    })
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
  async getMyReviewHistory(params: { page?: number; per_page?: number } = {}) {
    return this.listReviews({
      ...params,
      status: 'acknowledged'
    })
  }
}
