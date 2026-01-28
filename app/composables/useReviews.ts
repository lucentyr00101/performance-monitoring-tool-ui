// useReviews composable - Vue composable for reviews data
import { useReviewsStore } from '~/stores/reviews'
import { useAuthStore } from '~/stores/auth'
import { refDebounced } from '@vueuse/core'
import type {
  ReviewCycle,
  ReviewCycleListItem,
  ReviewCycleFilters,
  ReviewCycleListParams,
  ReviewCycleCreateRequest,
  ReviewCycleUpdateRequest,
  ReviewCycleStatus,
  ReviewCycleType,
  Review,
  ReviewListItem,
  ReviewFilters,
  ReviewListParams,
  ReviewUpdateRequest,
  ReviewAcknowledgeRequest,
  ReviewStatus,
  ReviewType
} from '~/types/review'

/**
 * Composable for reviews management
 * Provides reactive access to reviews data and actions
 */
export function useReviews() {
  const store = useReviewsStore()
  const authStore = useAuthStore()

  // ============================================
  // REACTIVE STATE - CYCLES
  // ============================================

  const reviewCycles = computed(() => store.reviewCycles)
  const currentCycle = computed(() => store.currentCycle)
  const cycleFilters = computed(() => store.cycleFilters)
  const cyclePagination = computed(() => store.cyclePagination)
  const totalCycles = computed(() => store.totalCycles)
  const hasNextCyclePage = computed(() => store.hasNextCyclePage)
  const hasPreviousCyclePage = computed(() => store.hasPreviousCyclePage)

  // Cycles by status
  const activeCycles = computed(() => store.activeCycles)
  const draftCycles = computed(() => store.draftCycles)
  const completedCycles = computed(() => store.completedCycles)

  // ============================================
  // REACTIVE STATE - REVIEWS
  // ============================================

  const reviews = computed(() => store.reviews)
  const currentReview = computed(() => store.currentReview)
  const reviewFilters = computed(() => store.reviewFilters)
  const reviewPagination = computed(() => store.reviewPagination)
  const totalReviews = computed(() => store.totalReviews)
  const hasNextReviewPage = computed(() => store.hasNextReviewPage)
  const hasPreviousReviewPage = computed(() => store.hasPreviousReviewPage)

  // Reviews by status/type
  const pendingReviews = computed(() => store.pendingReviews)
  const inProgressReviews = computed(() => store.inProgressReviews)
  const submittedReviews = computed(() => store.submittedReviews)
  const acknowledgedReviews = computed(() => store.acknowledgedReviews)
  const selfAssessments = computed(() => store.selfAssessments)
  const managerReviews = computed(() => store.managerReviews)

  // ============================================
  // COMMON STATE
  // ============================================

  const isLoading = computed(() => store.isLoading)
  const error = computed(() => store.error)
  const canEditCurrentReview = computed(() => store.canEditCurrentReview)
  const currentCycleCompletionRate = computed(() => store.currentCycleCompletionRate)

  // Debounced search for cycles
  const cycleSearchQuery = ref('')
  const debouncedCycleSearch = refDebounced(cycleSearchQuery, 300)

  // Debounced search for reviews
  const reviewSearchQuery = ref('')
  const debouncedReviewSearch = refDebounced(reviewSearchQuery, 300)

  // Watch debounced search for cycles
  watch(debouncedCycleSearch, (value) => {
    store.updateCycleFilter('search', value || undefined)
    store.fetchCycles()
  })

  // Watch debounced search for reviews
  watch(debouncedReviewSearch, (value) => {
    store.updateReviewFilter('search', value || undefined)
    store.fetchReviews()
  })

  // ============================================
  // MY REVIEWS (Current User)
  // ============================================

  const myReviews = computed((): ReviewListItem[] => {
    const userId = authStore.user?.id
    if (!userId) return []
    return reviews.value.filter(r => r.employee.id === userId || r.reviewer.id === userId)
  })

  const myPendingSelfAssessments = computed((): ReviewListItem[] => {
    const userId = authStore.user?.id
    if (!userId) return []
    return reviews.value.filter(
      r => r.type === 'self' && 
           r.reviewer.id === userId && 
           ['pending', 'in_progress'].includes(r.status)
    )
  })

  const myPendingManagerReviews = computed((): ReviewListItem[] => {
    const userId = authStore.user?.id
    if (!userId) return []
    return reviews.value.filter(
      r => r.type === 'manager' && 
           r.reviewer.id === userId && 
           ['pending', 'in_progress'].includes(r.status)
    )
  })

  // ============================================
  // PERMISSION HELPERS
  // ============================================

  /**
   * Check if current user can create review cycles
   */
  function canCreateCycle(): boolean {
    const user = authStore.user
    if (!user) return false
    return ['admin', 'hr'].includes(user.role)
  }

  /**
   * Check if current user can edit a review cycle
   */
  function canEditCycle(cycle: ReviewCycle | ReviewCycleListItem): boolean {
    const user = authStore.user
    if (!user) return false

    // Only draft cycles can be edited
    if (cycle.status !== 'draft') return false

    // Admin and HR can edit cycles
    return ['admin', 'hr'].includes(user.role)
  }

  /**
   * Check if current user can delete a review cycle
   */
  function canDeleteCycle(cycle: ReviewCycle | ReviewCycleListItem): boolean {
    const user = authStore.user
    if (!user) return false

    // Only draft cycles can be deleted
    if (cycle.status !== 'draft') return false

    // Only admin can delete
    return user.role === 'admin'
  }

  /**
   * Check if current user can launch a review cycle
   */
  function canLaunchCycle(cycle: ReviewCycle | ReviewCycleListItem): boolean {
    const user = authStore.user
    if (!user) return false

    // Only draft cycles can be launched
    if (cycle.status !== 'draft') return false

    // Admin and HR can launch cycles
    return ['admin', 'hr'].includes(user.role)
  }

  /**
   * Check if current user can view a review
   */
  function canViewReview(review: Review | ReviewListItem): boolean {
    const user = authStore.user
    if (!user) return false

    // Admin and HR can view all reviews
    if (['admin', 'hr'].includes(user.role)) return true

    // Employee can view their own reviews (as employee or reviewer)
    if (review.employee.id === user.id) return true
    if (review.reviewer.id === user.id) return true

    // Manager can view team reviews (simplified - should check org hierarchy)
    if (user.role === 'manager') return true

    return false
  }

  /**
   * Check if current user can edit/submit a review
   */
  function canEditReview(review: Review | ReviewListItem): boolean {
    const user = authStore.user
    if (!user) return false

    // Only pending or in_progress reviews can be edited
    if (!['pending', 'in_progress'].includes(review.status)) return false

    // Only the reviewer can edit
    return review.reviewer.id === user.id
  }

  /**
   * Check if current user can acknowledge a review
   */
  function canAcknowledgeReview(review: Review | ReviewListItem): boolean {
    const user = authStore.user
    if (!user) return false

    // Only submitted reviews can be acknowledged
    if (review.status !== 'submitted') return false

    // Only the employee being reviewed can acknowledge
    return review.employee.id === user.id
  }

  // ============================================
  // UI HELPERS - CYCLE
  // ============================================

  type BadgeColor = 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error' | 'neutral'

  /**
   * Get color for cycle status badge
   */
  function getCycleStatusColor(status: ReviewCycleStatus): BadgeColor {
    const colors: Record<ReviewCycleStatus, BadgeColor> = {
      draft: 'neutral',
      active: 'info',
      completed: 'success',
      cancelled: 'error'
    }
    return colors[status] || 'neutral'
  }

  /**
   * Get color for cycle type badge
   */
  function getCycleTypeColor(type: ReviewCycleType): BadgeColor {
    const colors: Record<ReviewCycleType, BadgeColor> = {
      annual: 'secondary',
      'semi-annual': 'info',
      quarterly: 'success',
      monthly: 'warning'
    }
    return colors[type] || 'neutral'
  }

  /**
   * Get label for cycle type
   */
  function getCycleTypeLabel(type: ReviewCycleType): string {
    const labels: Record<ReviewCycleType, string> = {
      annual: 'Annual',
      'semi-annual': 'Semi-Annual',
      quarterly: 'Quarterly',
      monthly: 'Monthly'
    }
    return labels[type] || type
  }

  /**
   * Format date for display
   */
  function formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  /**
   * Get days remaining for a cycle
   */
  function getCycleDaysRemaining(cycle: ReviewCycle | ReviewCycleListItem): number {
    return store.getCycleDaysRemaining(cycle)
  }

  /**
   * Check if cycle is overdue
   */
  function isCycleOverdue(cycle: ReviewCycle | ReviewCycleListItem): boolean {
    return store.isCycleOverdue(cycle)
  }

  // ============================================
  // UI HELPERS - REVIEW
  // ============================================

  /**
   * Get color for review status badge
   */
  function getReviewStatusColor(status: ReviewStatus): BadgeColor {
    const colors: Record<ReviewStatus, BadgeColor> = {
      pending: 'neutral',
      in_progress: 'warning',
      submitted: 'info',
      acknowledged: 'success'
    }
    return colors[status] || 'neutral'
  }

  /**
   * Get label for review status
   */
  function getReviewStatusLabel(status: ReviewStatus): string {
    const labels: Record<ReviewStatus, string> = {
      pending: 'Pending',
      in_progress: 'In Progress',
      submitted: 'Submitted',
      acknowledged: 'Acknowledged'
    }
    return labels[status] || status
  }

  /**
   * Get color for review type badge
   */
  function getReviewTypeColor(type: ReviewType): BadgeColor {
    const colors: Record<ReviewType, BadgeColor> = {
      self: 'info',
      manager: 'secondary',
      peer: 'success'
    }
    return colors[type] || 'neutral'
  }

  /**
   * Get label for review type
   */
  function getReviewTypeLabel(type: ReviewType): string {
    const labels: Record<ReviewType, string> = {
      self: 'Self Assessment',
      manager: 'Manager Review',
      peer: 'Peer Review'
    }
    return labels[type] || type
  }

  /**
   * Get rating color based on value
   */
  function getRatingColor(rating: number): string {
    if (rating >= 4.5) return 'green'
    if (rating >= 3.5) return 'blue'
    if (rating >= 2.5) return 'yellow'
    return 'red'
  }

  /**
   * Get rating label based on value (1-5 scale)
   */
  function getRatingLabel(rating: number): string {
    if (rating >= 4.5) return 'Exceptional'
    if (rating >= 3.5) return 'Exceeds Expectations'
    if (rating >= 2.5) return 'Meets Expectations'
    if (rating >= 1.5) return 'Needs Improvement'
    return 'Unsatisfactory'
  }

  /**
   * Format employee full name
   */
  function formatEmployeeName(employee: { first_name: string; last_name: string }): string {
    return `${employee.first_name} ${employee.last_name}`
  }

  // ============================================
  // CYCLE ACTIONS
  // ============================================

  async function fetchCycles(params?: Partial<ReviewCycleListParams>) {
    return store.fetchCycles(params)
  }

  async function fetchCycle(id: string) {
    return store.fetchCycle(id)
  }

  async function createCycle(data: ReviewCycleCreateRequest) {
    return store.createCycle(data)
  }

  async function updateCycle(id: string, data: ReviewCycleUpdateRequest) {
    return store.updateCycle(id, data)
  }

  async function deleteCycle(id: string) {
    return store.deleteCycle(id)
  }

  async function launchCycle(id: string) {
    return store.launchCycle(id)
  }

  // ============================================
  // REVIEW ACTIONS
  // ============================================

  async function fetchReviews(params?: Partial<ReviewListParams>) {
    return store.fetchReviews(params)
  }

  async function fetchReview(id: string) {
    return store.fetchReview(id)
  }

  async function updateReview(id: string, data: ReviewUpdateRequest) {
    return store.updateReview(id, data)
  }

  async function submitReview(id: string, data: Omit<ReviewUpdateRequest, 'status'>) {
    return store.submitReview(id, data)
  }

  async function saveDraft(id: string, data: Omit<ReviewUpdateRequest, 'status'>) {
    return store.saveDraft(id, data)
  }

  async function acknowledgeReview(id: string, data?: ReviewAcknowledgeRequest) {
    return store.acknowledgeReview(id, data)
  }

  // ============================================
  // CYCLE FILTER ACTIONS
  // ============================================

  function setCycleFilters(filters: ReviewCycleFilters) {
    store.setCycleFilters(filters)
  }

  function updateCycleFilter<K extends keyof ReviewCycleFilters>(key: K, value: ReviewCycleFilters[K]) {
    store.updateCycleFilter(key, value)
  }

  function clearCycleFilters() {
    cycleSearchQuery.value = ''
    store.clearCycleFilters()
  }

  function setCyclePage(page: number) {
    store.setCyclePage(page)
    store.fetchCycles()
  }

  function nextCyclePage() {
    store.nextCyclePage()
    store.fetchCycles()
  }

  function previousCyclePage() {
    store.previousCyclePage()
    store.fetchCycles()
  }

  // ============================================
  // REVIEW FILTER ACTIONS
  // ============================================

  function setReviewFilters(filters: ReviewFilters) {
    store.setReviewFilters(filters)
  }

  function updateReviewFilter<K extends keyof ReviewFilters>(key: K, value: ReviewFilters[K]) {
    store.updateReviewFilter(key, value)
  }

  function clearReviewFilters() {
    reviewSearchQuery.value = ''
    store.clearReviewFilters()
  }

  function setReviewPage(page: number) {
    store.setReviewPage(page)
    store.fetchReviews()
  }

  function nextReviewPage() {
    store.nextReviewPage()
    store.fetchReviews()
  }

  function previousReviewPage() {
    store.previousReviewPage()
    store.fetchReviews()
  }

  // ============================================
  // UTILITY ACTIONS
  // ============================================

  function clearCurrentCycle() {
    store.clearCurrentCycle()
  }

  function clearCurrentReview() {
    store.clearCurrentReview()
  }

  function clearError() {
    store.clearError()
  }

  async function applyCycleFiltersAndFetch() {
    store.setCyclePage(1)
    return store.fetchCycles()
  }

  async function applyReviewFiltersAndFetch() {
    store.setReviewPage(1)
    return store.fetchReviews()
  }

  return {
    // Cycle State
    reviewCycles,
    currentCycle,
    cycleFilters,
    cyclePagination,
    totalCycles,
    hasNextCyclePage,
    hasPreviousCyclePage,
    activeCycles,
    draftCycles,
    completedCycles,
    cycleSearchQuery,
    currentCycleCompletionRate,

    // Review State
    reviews,
    currentReview,
    reviewFilters,
    reviewPagination,
    totalReviews,
    hasNextReviewPage,
    hasPreviousReviewPage,
    pendingReviews,
    inProgressReviews,
    submittedReviews,
    acknowledgedReviews,
    selfAssessments,
    managerReviews,
    reviewSearchQuery,
    canEditCurrentReview,

    // Common State
    isLoading,
    error,

    // My Reviews
    myReviews,
    myPendingSelfAssessments,
    myPendingManagerReviews,

    // Permission helpers
    canCreateCycle,
    canEditCycle,
    canDeleteCycle,
    canLaunchCycle,
    canViewReview,
    canEditReview,
    canAcknowledgeReview,

    // Cycle UI helpers
    getCycleStatusColor,
    getCycleTypeColor,
    getCycleTypeLabel,
    formatDate,
    getCycleDaysRemaining,
    isCycleOverdue,

    // Review UI helpers
    getReviewStatusColor,
    getReviewStatusLabel,
    getReviewTypeColor,
    getReviewTypeLabel,
    getRatingColor,
    getRatingLabel,
    formatEmployeeName,

    // Cycle actions
    fetchCycles,
    fetchCycle,
    createCycle,
    updateCycle,
    deleteCycle,
    launchCycle,

    // Review actions
    fetchReviews,
    fetchReview,
    updateReview,
    submitReview,
    saveDraft,
    acknowledgeReview,

    // Cycle filter actions
    setCycleFilters,
    updateCycleFilter,
    clearCycleFilters,
    setCyclePage,
    nextCyclePage,
    previousCyclePage,

    // Review filter actions
    setReviewFilters,
    updateReviewFilter,
    clearReviewFilters,
    setReviewPage,
    nextReviewPage,
    previousReviewPage,

    // Utility
    clearCurrentCycle,
    clearCurrentReview,
    clearError,
    applyCycleFiltersAndFetch,
    applyReviewFiltersAndFetch
  }
}
