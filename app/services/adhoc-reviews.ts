// Ad-Hoc Reviews Service - API calls for ad-hoc reviews management
import { api } from '~/utils/api'
import type {
  AdhocReview,
  AdhocReviewListItem,
  AdhocReviewListParams,
  TriggerAdhocReviewRequest,
  TriggerAdhocReviewResponse,
  AdhocReviewRemindResponse,
  AdhocReviewCancelResponse,
  SelfReviewSubmitRequest,
  SelfReviewSubmitResponse,
  ManagerReviewSubmitRequest,
  ManagerReviewSubmitResponse,
  AdhocReviewAcknowledgeRequest,
  AdhocReviewAcknowledgeResponse
} from '~/types/adhoc-review'
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

  /**
   * Submit or save draft for self-review
   * PUT /api/v1/adhoc-reviews/:id/self-review
   */
  async submitSelfReview(id: string, data: SelfReviewSubmitRequest) {
    return api.put<SelfReviewSubmitResponse>(`/adhoc-reviews/${id}/self-review`, data) as Promise<ApiResponse<SelfReviewSubmitResponse>>
  },

  /**
   * Submit or save draft for manager review
   * PUT /api/v1/adhoc-reviews/:id/manager-review
   */
  async submitManagerReview(id: string, data: ManagerReviewSubmitRequest) {
    return api.put<ManagerReviewSubmitResponse>(`/adhoc-reviews/${id}/manager-review`, data) as Promise<ApiResponse<ManagerReviewSubmitResponse>>
  },

  /**
   * Acknowledge an ad-hoc review (employee action)
   * PUT /api/v1/adhoc-reviews/:id/acknowledge
   */
  async acknowledgeAdhocReview(id: string, data: AdhocReviewAcknowledgeRequest = {}) {
    return api.put<AdhocReviewAcknowledgeResponse>(`/adhoc-reviews/${id}/acknowledge`, data) as Promise<ApiResponse<AdhocReviewAcknowledgeResponse>>
  },

  // ============================================
  // CONVENIENCE METHODS
  // ============================================

  /**
   * Get pending ad-hoc reviews for a specific employee (self-review)
   */
  async getMyPendingSelfReviews(employeeId: string) {
    return this.listAdhocReviews({
      status: 'initiated',
      employeeId
    })
  },

  /**
   * Get pending ad-hoc reviews for a specific manager
   */
  async getMyPendingManagerReviews(managerId: string) {
    return this.listAdhocReviews({
      status: 'initiated',
      managerId
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
