// Ad-Hoc Reviews Store - Pinia store for ad-hoc reviews state management
import { defineStore } from 'pinia'
import { adhocReviewsService } from '~/services/adhoc-reviews'
import type {
  AdhocReview,
  AdhocReviewListItem,
  AdhocReviewFilters,
  AdhocReviewListParams,
  AdhocReviewStatus,
  TriggerAdhocReviewRequest,
  TriggerAdhocReviewResponse,
  AdhocReviewState,
  SelfReviewSubmitRequest,
  ManagerReviewSubmitRequest,
  AdhocReviewAcknowledgeRequest
} from '~/types/adhoc-review'

const DEFAULT_PER_PAGE = 20

export const useAdhocReviewsStore = defineStore('adhoc-reviews', {
  state: (): AdhocReviewState => ({
    adhocReviews: [],
    currentAdhocReview: null,
    filters: {},
    pagination: {
      page: 1,
      perPage: DEFAULT_PER_PAGE,
      totalItems: 0,
      totalPages: 0
    },
    isLoading: false,
    error: null
  }),

  getters: {
    // Alias for adhocReviews for convenience
    reviews: (state): AdhocReviewListItem[] => state.adhocReviews,
    
    totalAdhocReviews: (state) => state.pagination.totalItems,
    
    hasNextPage: (state) => state.pagination.page < state.pagination.totalPages,
    
    hasPreviousPage: (state) => state.pagination.page > 1,
    
    initiatedReviews: (state): AdhocReviewListItem[] => 
      state.adhocReviews.filter(r => r.status === 'initiated'),
    
    pendingAcknowledgmentReviews: (state): AdhocReviewListItem[] => 
      state.adhocReviews.filter(r => r.status === 'pending_acknowledgment'),
    
    completedReviews: (state): AdhocReviewListItem[] => 
      state.adhocReviews.filter(r => r.status === 'completed'),

    reviewsByStatus: (state) => (status: AdhocReviewStatus): AdhocReviewListItem[] => 
      state.adhocReviews.filter(r => r.status === status),

    overdueReviews: (state): AdhocReviewListItem[] => {
      const today = new Date()
      return state.adhocReviews.filter(r => {
        if (r.status === 'completed' || r.status === 'cancelled') return false
        return new Date(r.dueDate) < today
      })
    },

    // Get reviews where self-review is pending
    pendingSelfReviews: (state): AdhocReviewListItem[] =>
      state.adhocReviews.filter(r => 
        r.status === 'initiated' && 
        r.selfReviewStatus !== 'submitted'
      ),

    // Get reviews where manager review is pending
    pendingManagerReviews: (state): AdhocReviewListItem[] =>
      state.adhocReviews.filter(r => 
        (r.status === 'initiated' || r.status === 'pending_acknowledgment') && 
        r.managerReviewStatus !== 'submitted'
      )
  },

  actions: {
    // ============================================
    // CRUD OPERATIONS
    // ============================================

    async fetchAdhocReviews(params?: Partial<AdhocReviewListParams>): Promise<void> {
      this.isLoading = true
      this.error = null

      try {
        const listParams: AdhocReviewListParams = {
          page: params?.page ?? this.pagination.page,
          perPage: params?.perPage ?? this.pagination.perPage,
          ...this.filters,
          ...params
        }

        const response = await adhocReviewsService.listAdhocReviews(listParams)
        
        this.adhocReviews = response.data
        // Transform snake_case pagination to camelCase
        this.pagination = {
          page: response.meta.pagination.page,
          perPage: response.meta.pagination.per_page,
          totalItems: response.meta.pagination.total_items,
          totalPages: response.meta.pagination.total_pages
        }
      }
      catch (error) {
        const err = error as { error?: { message?: string } }
        this.error = err?.error?.message || 'Failed to fetch ad-hoc reviews'
        throw error
      }
      finally {
        this.isLoading = false
      }
    },

    async fetchAdhocReview(id: string): Promise<AdhocReview> {
      this.isLoading = true
      this.error = null

      try {
        const response = await adhocReviewsService.getAdhocReview(id)
        this.currentAdhocReview = response.data
        return response.data
      }
      catch (error) {
        const err = error as { error?: { message?: string } }
        this.error = err?.error?.message || 'Failed to fetch ad-hoc review'
        throw error
      }
      finally {
        this.isLoading = false
      }
    },

    async triggerAdhocReview(data: TriggerAdhocReviewRequest): Promise<TriggerAdhocReviewResponse> {
      const { success, failed } = useNotification()
      this.isLoading = true
      this.error = null

      try {
        const response = await adhocReviewsService.triggerAdhocReview(data)
        success('Ad-hoc review triggered successfully')
        // Refresh list after triggering
        await this.fetchAdhocReviews()
        return response.data
      }
      catch (error) {
        const err = error as { error?: { message?: string } }
        this.error = err?.error?.message || 'Failed to trigger ad-hoc review'
        failed('trigger', 'ad-hoc review', 'server')
        throw error
      }
      finally {
        this.isLoading = false
      }
    },

    async cancelAdhocReview(id: string): Promise<void> {
      this.isLoading = true
      this.error = null

      try {
        await adhocReviewsService.cancelAdhocReview(id)
        
        // Update in list
        const index = this.adhocReviews.findIndex(r => r.id === id)
        if (index !== -1) {
          this.adhocReviews[index]!.status = 'cancelled'
        }
        
        // Clear current if cancelled
        if (this.currentAdhocReview?.id === id) {
          this.currentAdhocReview.status = 'cancelled'
        }
      }
      catch (error) {
        const err = error as { error?: { message?: string } }
        this.error = err?.error?.message || 'Failed to cancel ad-hoc review'
        throw error
      }
      finally {
        this.isLoading = false
      }
    },

    async sendReminder(id: string): Promise<{ employee: boolean; manager: boolean }> {
      this.isLoading = true
      this.error = null

      try {
        const response = await adhocReviewsService.sendReminder(id)
        return response.data.remindersSent
      }
      catch (error) {
        const err = error as { error?: { message?: string } }
        this.error = err?.error?.message || 'Failed to send reminder'
        throw error
      }
      finally {
        this.isLoading = false
      }
    },

    // ============================================
    // REVIEW SUBMISSION ACTIONS
    // ============================================

    async submitSelfReview(id: string, data: SelfReviewSubmitRequest): Promise<void> {
      const { success, failed } = useNotification()

      try {
        const response = await adhocReviewsService.submitSelfReview(id, data)

        // Update current review state
        if (this.currentAdhocReview?.id === id) {
          this.currentAdhocReview.selfReview = {
            ...this.currentAdhocReview.selfReview,
            status: response.data.status,
            submittedAt: response.data.submittedAt
          }
        }

        if (data.status === 'submitted') {
          success('Self-review submitted successfully')
        } else {
          success('Draft saved successfully')
        }
      }
      catch (error) {
        const err = error as { error?: { message?: string } }
        this.error = err?.error?.message || 'Failed to submit self-review'
        failed('submit', 'self-review', 'server')
        throw error
      }
    },

    async submitManagerReview(id: string, data: ManagerReviewSubmitRequest): Promise<void> {
      const { success, failed } = useNotification()

      try {
        const response = await adhocReviewsService.submitManagerReview(id, data)

        // Update current review state
        if (this.currentAdhocReview?.id === id) {
          this.currentAdhocReview.managerReview = {
            ...this.currentAdhocReview.managerReview,
            status: response.data.status,
            submittedAt: response.data.submittedAt
          }
        }

        if (data.status === 'submitted') {
          success('Manager evaluation submitted successfully')
        } else {
          success('Draft saved successfully')
        }
      }
      catch (error) {
        const err = error as { error?: { message?: string } }
        this.error = err?.error?.message || 'Failed to submit manager evaluation'
        failed('submit', 'manager evaluation', 'server')
        throw error
      }
    },

    async acknowledgeAdhocReview(id: string, data: AdhocReviewAcknowledgeRequest = {}): Promise<void> {
      const { success, failed } = useNotification()
      this.isLoading = true
      this.error = null

      try {
        const response = await adhocReviewsService.acknowledgeAdhocReview(id, data)

        // Update current review
        if (this.currentAdhocReview?.id === id) {
          this.currentAdhocReview.status = 'completed'
          this.currentAdhocReview.completedAt = response.data.completedAt
        }

        // Update in list
        const index = this.adhocReviews.findIndex(r => r.id === id)
        if (index !== -1) {
          this.adhocReviews[index]!.status = 'completed'
        }

        success('Review acknowledged successfully')
      }
      catch (error) {
        const err = error as { error?: { message?: string } }
        this.error = err?.error?.message || 'Failed to acknowledge review'
        failed('acknowledge', 'review', 'server')
        throw error
      }
      finally {
        this.isLoading = false
      }
    },

    // ============================================
    // FILTER & PAGINATION ACTIONS
    // ============================================

    setFilters(filters: AdhocReviewFilters): void {
      this.filters = { ...filters }
      this.pagination.page = 1
    },

    updateFilter<K extends keyof AdhocReviewFilters>(key: K, value: AdhocReviewFilters[K]): void {
      this.filters[key] = value
      this.pagination.page = 1
    },

    clearFilters(): void {
      this.filters = {}
      this.pagination.page = 1
    },

    setPage(page: number): void {
      this.pagination.page = page
    },

    nextPage(): void {
      if (this.hasNextPage) {
        this.pagination.page++
      }
    },

    previousPage(): void {
      if (this.hasPreviousPage) {
        this.pagination.page--
      }
    },

    // ============================================
    // UTILITY ACTIONS
    // ============================================

    clearCurrentAdhocReview(): void {
      this.currentAdhocReview = null
    },

    clearError(): void {
      this.error = null
    },

    // Calculate days remaining for a review
    getDaysRemaining(review: AdhocReview | AdhocReviewListItem): number {
      const now = new Date()
      const due = new Date(review.dueDate)
      const diffTime = due.getTime() - now.getTime()
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    },

    // Check if review is overdue
    isOverdue(review: AdhocReview | AdhocReviewListItem): boolean {
      if (review.status === 'completed' || review.status === 'cancelled') return false
      return new Date(review.dueDate) < new Date()
    }
  }
})
