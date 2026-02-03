// Ad-Hoc Reviews Service - API calls for ad-hoc reviews management
import { api } from '~/utils/api'
import type {
  AdhocReview,
  AdhocReviewListItem,
  AdhocReviewListParams,
  TriggerAdhocReviewRequest,
  TriggerAdhocReviewResponse,
  AdhocReviewRemindResponse,
  AdhocReviewCancelResponse
} from '~/types/adhoc-review'
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
 * Ad-Hoc Reviews Service - Communicates with the API Gateway
 */
export const adhocReviewsService = {
  /**
   * List ad-hoc reviews with filtering and pagination
   * GET /api/v1/adhoc-reviews
   */
  async listAdhocReviews(params: AdhocReviewListParams = {}) {
    const queryParams = new URLSearchParams()
    
    // Query params stay snake_case per API convention
    if (params.page) queryParams.set('page', String(params.page))
    if (params.perPage) queryParams.set('per_page', String(params.perPage))
    if (params.status) queryParams.set('status', params.status)
    if (params.employeeId) queryParams.set('employee_id', params.employeeId)
    if (params.managerId) queryParams.set('manager_id', params.managerId)
    if (params.triggeredBy) queryParams.set('triggered_by', params.triggeredBy)
    if (params.dueBefore) queryParams.set('due_before', params.dueBefore)
    if (params.overdue) queryParams.set('overdue', 'true')

    const query = queryParams.toString()
    const endpoint = `/adhoc-reviews${query ? `?${query}` : ''}`
    
    return api.get<PaginatedResponse<AdhocReviewListItem>['data']>(endpoint) as Promise<PaginatedResponse<AdhocReviewListItem>>
  },

  /**
   * Get ad-hoc review by ID
   * GET /api/v1/adhoc-reviews/:id
   */
  async getAdhocReview(id: string) {
    return api.get<AdhocReview>(`/adhoc-reviews/${id}`)
  },

  /**
   * Trigger a new ad-hoc review
   * POST /api/v1/adhoc-reviews
   */
  async triggerAdhocReview(data: TriggerAdhocReviewRequest) {
    return api.post<TriggerAdhocReviewResponse>('/adhoc-reviews', data) as Promise<ApiResponse<TriggerAdhocReviewResponse>>
  },

  /**
   * Cancel an ad-hoc review
   * DELETE /api/v1/adhoc-reviews/:id
   */
  async cancelAdhocReview(id: string) {
    return api.delete<AdhocReviewCancelResponse>(`/adhoc-reviews/${id}`) as Promise<ApiResponse<AdhocReviewCancelResponse>>
  },

  /**
   * Send reminder for an ad-hoc review
   * POST /api/v1/adhoc-reviews/:id/remind
   */
  async sendReminder(id: string) {
    return api.post<AdhocReviewRemindResponse>(`/adhoc-reviews/${id}/remind`, {}) as Promise<ApiResponse<AdhocReviewRemindResponse>>
  },

  // ============================================
  // CONVENIENCE METHODS
  // ============================================

  /**
   * Get pending ad-hoc reviews for current user as employee
   */
  async getMyPendingSelfReviews() {
    return this.listAdhocReviews({
      status: 'initiated'
    })
  },

  /**
   * Get pending ad-hoc reviews for current user as manager
   */
  async getMyPendingManagerReviews() {
    return this.listAdhocReviews({
      status: 'initiated'
    })
  },

  /**
   * Get overdue ad-hoc reviews
   */
  async getOverdueReviews() {
    return this.listAdhocReviews({
      overdue: true
    })
  }
}
