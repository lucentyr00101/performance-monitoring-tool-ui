// Reviews Store - Pinia store for reviews state management
import { defineStore } from 'pinia'
import { reviewsService } from '~/services/reviews'
import type {
  ReviewCycle,
  ReviewCycleListItem,
  ReviewCycleFilters,
  ReviewCycleListParams,
  ReviewCycleCreateRequest,
  ReviewCycleUpdateRequest,
  ReviewCycleStatus,
  Review,
  ReviewListItem,
  ReviewFilters,
  ReviewListParams,
  ReviewUpdateRequest,
  ReviewAcknowledgeRequest,
  ReviewStatus,
  ReviewState,
  LaunchCycleResponse
} from '~/types/review'

const DEFAULT_PER_PAGE = 20

export const useReviewsStore = defineStore('reviews', {
  state: (): ReviewState => ({
    // Review Cycles
    reviewCycles: [],
    currentCycle: null,
    cycleFilters: {},
    cyclePagination: {
      page: 1,
      per_page: DEFAULT_PER_PAGE,
      total_items: 0,
      total_pages: 0
    },
    
    // Reviews
    reviews: [],
    currentReview: null,
    reviewFilters: {},
    reviewPagination: {
      page: 1,
      per_page: DEFAULT_PER_PAGE,
      total_items: 0,
      total_pages: 0
    },
    
    // Templates
    templates: [],
    
    // UI State
    isLoading: false,
    error: null
  }),

  getters: {
    // ============================================
    // CYCLE GETTERS
    // ============================================
    
    totalCycles: (state) => state.cyclePagination.total_items,
    
    hasNextCyclePage: (state) => state.cyclePagination.page < state.cyclePagination.total_pages,
    
    hasPreviousCyclePage: (state) => state.cyclePagination.page > 1,
    
    activeCycles: (state): ReviewCycleListItem[] => 
      state.reviewCycles.filter(c => c.status === 'active'),
    
    draftCycles: (state): ReviewCycleListItem[] => 
      state.reviewCycles.filter(c => c.status === 'draft'),
    
    completedCycles: (state): ReviewCycleListItem[] => 
      state.reviewCycles.filter(c => c.status === 'completed'),

    cyclesByStatus: (state) => (status: ReviewCycleStatus): ReviewCycleListItem[] => 
      state.reviewCycles.filter(c => c.status === status),

    // ============================================
    // REVIEW GETTERS
    // ============================================
    
    totalReviews: (state) => state.reviewPagination.total_items,
    
    hasNextReviewPage: (state) => state.reviewPagination.page < state.reviewPagination.total_pages,
    
    hasPreviousReviewPage: (state) => state.reviewPagination.page > 1,
    
    pendingReviews: (state): ReviewListItem[] => 
      state.reviews.filter(r => r.status === 'pending'),
    
    inProgressReviews: (state): ReviewListItem[] => 
      state.reviews.filter(r => r.status === 'in_progress'),
    
    submittedReviews: (state): ReviewListItem[] => 
      state.reviews.filter(r => r.status === 'submitted'),
    
    acknowledgedReviews: (state): ReviewListItem[] => 
      state.reviews.filter(r => r.status === 'acknowledged'),

    reviewsByStatus: (state) => (status: ReviewStatus): ReviewListItem[] => 
      state.reviews.filter(r => r.status === status),

    selfAssessments: (state): ReviewListItem[] => 
      state.reviews.filter(r => r.type === 'self'),

    managerReviews: (state): ReviewListItem[] => 
      state.reviews.filter(r => r.type === 'manager'),

    // Current cycle completion rate
    currentCycleCompletionRate: (state): number => {
      if (!state.currentCycle?.stats) return 0
      return state.currentCycle.stats.completion_rate
    },

    // Current review is editable
    canEditCurrentReview: (state): boolean => {
      if (!state.currentReview) return false
      return ['pending', 'in_progress'].includes(state.currentReview.status)
    }
  },

  actions: {
    // ============================================
    // REVIEW CYCLE CRUD OPERATIONS
    // ============================================

    async fetchCycles(params?: Partial<ReviewCycleListParams>): Promise<void> {
      this.isLoading = true
      this.error = null

      try {
        const listParams: ReviewCycleListParams = {
          page: params?.page ?? this.cyclePagination.page,
          per_page: params?.per_page ?? this.cyclePagination.per_page,
          ...this.cycleFilters,
          ...params
        }

        const response = await reviewsService.listCycles(listParams)
        
        this.reviewCycles = response.data
        this.cyclePagination = response.meta.pagination
      }
      catch (error) {
        const err = error as { error?: { message?: string } }
        this.error = err?.error?.message || 'Failed to fetch review cycles'
        throw error
      }
      finally {
        this.isLoading = false
      }
    },

    async fetchCycle(id: string): Promise<ReviewCycle> {
      this.isLoading = true
      this.error = null

      try {
        const response = await reviewsService.getCycle(id)
        this.currentCycle = response.data
        return response.data
      }
      catch (error) {
        const err = error as { error?: { message?: string } }
        this.error = err?.error?.message || 'Failed to fetch review cycle'
        throw error
      }
      finally {
        this.isLoading = false
      }
    },

    async createCycle(data: ReviewCycleCreateRequest): Promise<ReviewCycle> {
      this.isLoading = true
      this.error = null

      try {
        const response = await reviewsService.createCycle(data)
        // Refresh list after creation
        await this.fetchCycles()
        return response.data
      }
      catch (error) {
        const err = error as { error?: { message?: string } }
        this.error = err?.error?.message || 'Failed to create review cycle'
        throw error
      }
      finally {
        this.isLoading = false
      }
    },

    async updateCycle(id: string, data: ReviewCycleUpdateRequest): Promise<ReviewCycle> {
      this.isLoading = true
      this.error = null

      try {
        const response = await reviewsService.updateCycle(id, data)
        
        // Update current cycle if it's the one being updated
        if (this.currentCycle?.id === id) {
          this.currentCycle = response.data
        }
        
        // Update in list if present
        const index = this.reviewCycles.findIndex(c => c.id === id)
        if (index !== -1) {
          const existing = this.reviewCycles[index]!
          this.reviewCycles[index] = {
            ...existing,
            name: response.data.name,
            description: response.data.description,
            type: response.data.type,
            start_date: response.data.start_date,
            end_date: response.data.end_date,
            status: response.data.status
          }
        }
        
        return response.data
      }
      catch (error) {
        const err = error as { error?: { message?: string } }
        this.error = err?.error?.message || 'Failed to update review cycle'
        throw error
      }
      finally {
        this.isLoading = false
      }
    },

    async deleteCycle(id: string): Promise<void> {
      this.isLoading = true
      this.error = null

      try {
        await reviewsService.deleteCycle(id)
        
        // Remove from list
        const index = this.reviewCycles.findIndex(c => c.id === id)
        if (index !== -1) {
          this.reviewCycles.splice(index, 1)
          this.cyclePagination.total_items--
        }
        
        // Clear current if deleted
        if (this.currentCycle?.id === id) {
          this.currentCycle = null
        }
      }
      catch (error) {
        const err = error as { error?: { message?: string } }
        this.error = err?.error?.message || 'Failed to delete review cycle'
        throw error
      }
      finally {
        this.isLoading = false
      }
    },

    async launchCycle(id: string): Promise<LaunchCycleResponse> {
      this.isLoading = true
      this.error = null

      try {
        const response = await reviewsService.launchCycle(id)
        
        // Update current cycle status
        if (this.currentCycle?.id === id) {
          this.currentCycle.status = 'active'
        }
        
        // Update in list
        const index = this.reviewCycles.findIndex(c => c.id === id)
        if (index !== -1) {
          const existing = this.reviewCycles[index]!
          this.reviewCycles[index] = { ...existing, status: 'active' as ReviewCycleStatus }
        }
        
        return response.data
      }
      catch (error) {
        const err = error as { error?: { message?: string } }
        this.error = err?.error?.message || 'Failed to launch review cycle'
        throw error
      }
      finally {
        this.isLoading = false
      }
    },

    // ============================================
    // REVIEW CRUD OPERATIONS
    // ============================================

    async fetchReviews(params?: Partial<ReviewListParams>): Promise<void> {
      this.isLoading = true
      this.error = null

      try {
        const listParams: ReviewListParams = {
          page: params?.page ?? this.reviewPagination.page,
          per_page: params?.per_page ?? this.reviewPagination.per_page,
          ...this.reviewFilters,
          ...params
        }

        const response = await reviewsService.listReviews(listParams)
        
        this.reviews = response.data
        this.reviewPagination = response.meta.pagination
      }
      catch (error) {
        const err = error as { error?: { message?: string } }
        this.error = err?.error?.message || 'Failed to fetch reviews'
        throw error
      }
      finally {
        this.isLoading = false
      }
    },

    async fetchReview(id: string): Promise<Review> {
      this.isLoading = true
      this.error = null

      try {
        const response = await reviewsService.getReview(id)
        this.currentReview = response.data
        return response.data
      }
      catch (error) {
        const err = error as { error?: { message?: string } }
        this.error = err?.error?.message || 'Failed to fetch review'
        throw error
      }
      finally {
        this.isLoading = false
      }
    },

    async updateReview(id: string, data: ReviewUpdateRequest): Promise<Review> {
      this.isLoading = true
      this.error = null

      try {
        const response = await reviewsService.updateReview(id, data)
        
        // Update current review
        if (this.currentReview?.id === id) {
          this.currentReview = response.data
        }
        
        // Update in list
        const index = this.reviews.findIndex(r => r.id === id)
        if (index !== -1) {
          const existing = this.reviews[index]!
          this.reviews[index] = {
            ...existing,
            status: response.data.status,
            rating: response.data.rating,
            submitted_at: response.data.submitted_at
          }
        }
        
        return response.data
      }
      catch (error) {
        const err = error as { error?: { message?: string } }
        this.error = err?.error?.message || 'Failed to update review'
        throw error
      }
      finally {
        this.isLoading = false
      }
    },

    async submitReview(id: string, data: Omit<ReviewUpdateRequest, 'status'>): Promise<Review> {
      return this.updateReview(id, { ...data, status: 'submitted' })
    },

    async saveDraft(id: string, data: Omit<ReviewUpdateRequest, 'status'>): Promise<Review> {
      return this.updateReview(id, { ...data, status: 'in_progress' })
    },

    async acknowledgeReview(id: string, data: ReviewAcknowledgeRequest = {}): Promise<Review> {
      this.isLoading = true
      this.error = null

      try {
        const response = await reviewsService.acknowledgeReview(id, data)
        
        // Update current review
        if (this.currentReview?.id === id) {
          this.currentReview = response.data
        }
        
        // Update in list
        const index = this.reviews.findIndex(r => r.id === id)
        if (index !== -1) {
          const existing = this.reviews[index]!
          this.reviews[index] = {
            ...existing,
            status: 'acknowledged' as ReviewStatus
          }
        }
        
        return response.data
      }
      catch (error) {
        const err = error as { error?: { message?: string } }
        this.error = err?.error?.message || 'Failed to acknowledge review'
        throw error
      }
      finally {
        this.isLoading = false
      }
    },

    // ============================================
    // CYCLE FILTER & PAGINATION ACTIONS
    // ============================================

    setCycleFilters(filters: ReviewCycleFilters): void {
      this.cycleFilters = { ...filters }
      this.cyclePagination.page = 1
    },

    updateCycleFilter<K extends keyof ReviewCycleFilters>(key: K, value: ReviewCycleFilters[K]): void {
      this.cycleFilters[key] = value
      this.cyclePagination.page = 1
    },

    clearCycleFilters(): void {
      this.cycleFilters = {}
      this.cyclePagination.page = 1
    },

    setCyclePage(page: number): void {
      this.cyclePagination.page = page
    },

    nextCyclePage(): void {
      if (this.hasNextCyclePage) {
        this.cyclePagination.page++
      }
    },

    previousCyclePage(): void {
      if (this.hasPreviousCyclePage) {
        this.cyclePagination.page--
      }
    },

    // ============================================
    // REVIEW FILTER & PAGINATION ACTIONS
    // ============================================

    setReviewFilters(filters: ReviewFilters): void {
      this.reviewFilters = { ...filters }
      this.reviewPagination.page = 1
    },

    updateReviewFilter<K extends keyof ReviewFilters>(key: K, value: ReviewFilters[K]): void {
      this.reviewFilters[key] = value
      this.reviewPagination.page = 1
    },

    clearReviewFilters(): void {
      this.reviewFilters = {}
      this.reviewPagination.page = 1
    },

    setReviewPage(page: number): void {
      this.reviewPagination.page = page
    },

    nextReviewPage(): void {
      if (this.hasNextReviewPage) {
        this.reviewPagination.page++
      }
    },

    previousReviewPage(): void {
      if (this.hasPreviousReviewPage) {
        this.reviewPagination.page--
      }
    },

    // ============================================
    // UTILITY ACTIONS
    // ============================================

    clearCurrentCycle(): void {
      this.currentCycle = null
    },

    clearCurrentReview(): void {
      this.currentReview = null
    },

    clearError(): void {
      this.error = null
    },

    // Calculate days remaining for a cycle
    getCycleDaysRemaining(cycle: ReviewCycle | ReviewCycleListItem): number {
      const now = new Date()
      const end = new Date(cycle.end_date)
      const diffTime = end.getTime() - now.getTime()
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    },

    // Check if cycle is overdue
    isCycleOverdue(cycle: ReviewCycle | ReviewCycleListItem): boolean {
      if (cycle.status === 'completed' || cycle.status === 'cancelled') return false
      return new Date(cycle.end_date) < new Date()
    }
  }
})
