// useGoals composable - Vue composable for goals data
import { useGoalsStore } from '~/stores/goals'
import { useAuthStore } from '~/stores/auth'
import { refDebounced } from '@vueuse/core'
import type {
  Goal,
  GoalListItem,
  GoalFilters,
  GoalListParams,
  GoalCreateRequest,
  GoalUpdateRequest,
  GoalProgressRequest,
  GoalType,
  GoalStatus,
  GoalPriority,
  ProgressIndicator,
  KeyResultCreateRequest,
  KeyResultUpdateRequest
} from '~/types/goal'

/**
 * Composable for goals management
 * Provides reactive access to goals data and actions
 */
export function useGoals() {
  const store = useGoalsStore()
  const authStore = useAuthStore()

  // ============================================
  // REACTIVE STATE
  // ============================================

  const goals = computed(() => store.goals)
  const currentGoal = computed(() => store.currentGoal)
  const templates = computed(() => store.templates)
  const isLoading = computed(() => store.isLoading)
  const error = computed(() => store.error)
  const filters = computed(() => store.filters)
  const pagination = computed(() => store.pagination)
  const sortBy = computed(() => store.sortBy)
  const sortOrder = computed(() => store.sortOrder)
  const viewMode = computed(() => store.viewMode)
  const totalGoals = computed(() => store.totalGoals)
  const hasNextPage = computed(() => store.hasNextPage)
  const hasPreviousPage = computed(() => store.hasPreviousPage)
  const activeFiltersCount = computed(() => store.activeFiltersCount)

  // Goals by status
  const activeGoals = computed(() => store.activeGoals)
  const draftGoals = computed(() => store.draftGoals)
  const pendingGoals = computed(() => store.pendingGoals)
  const completedGoals = computed(() => store.completedGoals)

  // Current goal helpers
  const currentGoalKeyResultsCompleted = computed(() => store.currentGoalKeyResultsCompleted)
  const currentGoalKeyResultsTotal = computed(() => store.currentGoalKeyResultsTotal)
  const currentGoalProgressIndicator = computed(() => store.currentGoalProgressIndicator)

  // Debounced search
  const searchQuery = ref('')
  const debouncedSearch = refDebounced(searchQuery, 300)

  // Watch debounced search and update filters
  watch(debouncedSearch, (value) => {
    store.updateFilter('search', value || undefined)
    store.fetchGoals()
  })

  // ============================================
  // MY GOALS (Current User)
  // ============================================

  const myGoals = computed((): GoalListItem[] => {
    const userId = authStore.user?.id
    if (!userId) return []
    return goals.value.filter(g => g.owner.id === userId)
  })

  // ============================================
  // PERMISSION HELPERS
  // ============================================

  /**
   * Check if current user can create goals of a specific type
   */
  function canCreateGoal(type: GoalType): boolean {
    const user = authStore.user
    if (!user) return false

    const role = user.role
    
    switch (type) {
      case 'individual':
        // All authenticated users can create individual goals
        return true
      case 'team':
        // Managers and above can create team goals
        return ['manager', 'department_head', 'hr', 'admin'].includes(role)
      case 'department':
        // Department heads, HR, and admin can create department goals
        return ['department_head', 'hr', 'admin'].includes(role)
      case 'company':
        // Only admin, HR, and C-suite can create company goals
        return ['hr', 'admin'].includes(role)
      default:
        return false
    }
  }

  /**
   * Check if current user can edit a goal
   */
  function canEditGoal(goal: Goal | GoalListItem): boolean {
    const user = authStore.user
    if (!user) return false

    // Admin and HR can edit all goals
    if (['admin', 'hr'].includes(user.role)) return true

    // Goal owner can edit their own goals (if in draft status)
    if (goal.owner.id === user.id && goal.status === 'draft') return true

    // Managers can edit their direct reports' goals
    // This would require checking if the goal owner reports to the current user
    // For now, we allow managers to edit team-level goals they created
    if (user.role === 'manager' && goal.type === 'team') {
      return goal.owner.id === user.id
    }

    return false
  }

  /**
   * Check if current user can delete a goal
   */
  function canDeleteGoal(goal: Goal | GoalListItem): boolean {
    const user = authStore.user
    if (!user) return false

    // Admin can delete any goal
    if (user.role === 'admin') return true

    // Owners can delete their draft goals
    if (goal.owner.id === user.id && goal.status === 'draft') return true

    return false
  }

  /**
   * Check if current user can approve/reject a goal
   */
  function canApproveGoal(goal: Goal | GoalListItem): boolean {
    const user = authStore.user
    if (!user) return false

    // Only pending goals can be approved
    if (goal.status !== 'pending') return false

    // Admin and HR can approve any goal
    if (['admin', 'hr'].includes(user.role)) return true

    // Managers can approve their direct reports' goals
    // This would require checking the org hierarchy
    // For now, we check if user is a manager
    if (user.role === 'manager') return true

    return false
  }

  /**
   * Check if current user can update progress on a goal
   */
  function canUpdateProgress(goal: Goal | GoalListItem): boolean {
    const user = authStore.user
    if (!user) return false

    // Only active goals can have progress updated
    if (goal.status !== 'active') return false

    // Goal owner can update progress
    if (goal.owner.id === user.id) return true

    // Admin and HR can update any goal's progress
    if (['admin', 'hr'].includes(user.role)) return true

    return false
  }

  // ============================================
  // UI HELPERS
  // ============================================

  /**
   * Get color for goal status badge
   */
  function getStatusColor(status: GoalStatus): string {
    const colors: Record<GoalStatus, string> = {
      draft: 'gray',
      pending: 'yellow',
      active: 'blue',
      completed: 'green',
      cancelled: 'red'
    }
    return colors[status] || 'gray'
  }

  /**
   * Get color for goal type badge
   */
  function getTypeColor(type: GoalType): string {
    const colors: Record<GoalType, string> = {
      individual: 'blue',
      team: 'purple',
      department: 'orange',
      company: 'green'
    }
    return colors[type] || 'gray'
  }

  /**
   * Get color for priority badge
   */
  function getPriorityColor(priority: GoalPriority): string {
    const colors: Record<GoalPriority, string> = {
      low: 'gray',
      medium: 'yellow',
      high: 'red'
    }
    return colors[priority] || 'gray'
  }

  /**
   * Get color based on progress indicator
   */
  function getProgressColor(indicator: ProgressIndicator): string {
    const colors: Record<ProgressIndicator, string> = {
      on_track: 'green',
      at_risk: 'yellow',
      behind: 'red'
    }
    return colors[indicator] || 'gray'
  }

  /**
   * Calculate progress indicator for a goal
   */
  function calculateProgressIndicator(goal: Goal | GoalListItem): ProgressIndicator {
    const expectedProgress = store.calculateExpectedProgress(
      'start_date' in goal ? goal.start_date : undefined,
      goal.due_date
    )
    const actualProgress = goal.progress

    const ratio = expectedProgress === 0 ? 1 : actualProgress / expectedProgress
    if (ratio >= 0.7) return 'on_track'
    if (ratio >= 0.4) return 'at_risk'
    return 'behind'
  }

  /**
   * Format date for display
   */
  function formatDueDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  /**
   * Check if goal is overdue
   */
  function isOverdue(goal: Goal | GoalListItem): boolean {
    if (goal.status === 'completed' || goal.status === 'cancelled') return false
    return new Date(goal.due_date) < new Date()
  }

  /**
   * Get days remaining until due date
   */
  function getDaysRemaining(goal: Goal | GoalListItem): number {
    const now = new Date()
    const due = new Date(goal.due_date)
    const diffTime = due.getTime() - now.getTime()
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  // ============================================
  // GOAL ACTIONS
  // ============================================

  async function fetchGoals(params?: Partial<GoalListParams>) {
    return store.fetchGoals(params)
  }

  async function fetchGoal(id: string) {
    return store.fetchGoal(id)
  }

  async function createGoal(data: GoalCreateRequest) {
    return store.createGoal(data)
  }

  async function updateGoal(id: string, data: GoalUpdateRequest) {
    return store.updateGoal(id, data)
  }

  async function deleteGoal(id: string) {
    return store.deleteGoal(id)
  }

  async function updateProgress(id: string, data: GoalProgressRequest) {
    return store.updateProgress(id, data)
  }

  async function submitForApproval(id: string) {
    return store.submitForApproval(id)
  }

  async function approveGoal(id: string, comment?: string) {
    return store.approveGoal(id, comment)
  }

  async function rejectGoal(id: string, comment: string) {
    return store.rejectGoal(id, comment)
  }

  async function fetchProgressHistory(id: string, page = 1) {
    return store.fetchProgressHistory(id, page)
  }

  // ============================================
  // KEY RESULT ACTIONS
  // ============================================

  async function addKeyResult(goalId: string, data: KeyResultCreateRequest) {
    return store.addKeyResult(goalId, data)
  }

  async function updateKeyResult(goalId: string, krId: string, data: KeyResultUpdateRequest) {
    return store.updateKeyResult(goalId, krId, data)
  }

  async function deleteKeyResult(goalId: string, krId: string) {
    return store.deleteKeyResult(goalId, krId)
  }

  // ============================================
  // TEMPLATE ACTIONS
  // ============================================

  async function fetchTemplates(type?: GoalType) {
    return store.fetchTemplates(type)
  }

  async function getTemplate(id: string) {
    return store.getTemplate(id)
  }

  // ============================================
  // FILTER ACTIONS
  // ============================================

  function setFilters(newFilters: GoalFilters) {
    store.setFilters(newFilters)
  }

  function updateFilter<K extends keyof GoalFilters>(key: K, value: GoalFilters[K]) {
    store.updateFilter(key, value)
  }

  function clearFilters() {
    searchQuery.value = ''
    store.clearFilters()
  }

  // ============================================
  // SORT ACTIONS
  // ============================================

  function setSort(field: GoalListParams['sort_by'], order?: GoalListParams['sort_order']) {
    store.setSort(field, order)
  }

  // ============================================
  // PAGINATION ACTIONS
  // ============================================

  function setPage(page: number) {
    store.setPage(page)
    store.fetchGoals()
  }

  function nextPage() {
    store.nextPage()
    store.fetchGoals()
  }

  function previousPage() {
    store.previousPage()
    store.fetchGoals()
  }

  // ============================================
  // VIEW MODE
  // ============================================

  function setViewMode(mode: 'grid' | 'list' | 'kanban') {
    store.setViewMode(mode)
  }

  // ============================================
  // UTILITY ACTIONS
  // ============================================

  function clearCurrentGoal() {
    store.clearCurrentGoal()
  }

  function clearError() {
    store.clearError()
  }

  async function applyFiltersAndFetch() {
    store.setPage(1)
    return store.fetchGoals()
  }

  function getGoalsByType(type: GoalType) {
    return store.goalsByType(type)
  }

  return {
    // State
    goals,
    currentGoal,
    templates,
    isLoading,
    error,
    filters,
    pagination,
    sortBy,
    sortOrder,
    viewMode,
    totalGoals,
    hasNextPage,
    hasPreviousPage,
    activeFiltersCount,
    searchQuery,

    // Goals by status
    activeGoals,
    draftGoals,
    pendingGoals,
    completedGoals,
    myGoals,

    // Current goal helpers
    currentGoalKeyResultsCompleted,
    currentGoalKeyResultsTotal,
    currentGoalProgressIndicator,

    // Permission helpers
    canCreateGoal,
    canEditGoal,
    canDeleteGoal,
    canApproveGoal,
    canUpdateProgress,

    // UI helpers
    getStatusColor,
    getTypeColor,
    getPriorityColor,
    getProgressColor,
    calculateProgressIndicator,
    formatDueDate,
    isOverdue,
    getDaysRemaining,

    // Goal actions
    fetchGoals,
    fetchGoal,
    createGoal,
    updateGoal,
    deleteGoal,
    updateProgress,
    submitForApproval,
    approveGoal,
    rejectGoal,
    fetchProgressHistory,

    // Key result actions
    addKeyResult,
    updateKeyResult,
    deleteKeyResult,

    // Template actions
    fetchTemplates,
    getTemplate,

    // Filter actions
    setFilters,
    updateFilter,
    clearFilters,
    setSort,

    // Pagination actions
    setPage,
    nextPage,
    previousPage,

    // View mode
    setViewMode,

    // Utility
    clearCurrentGoal,
    clearError,
    applyFiltersAndFetch,
    getGoalsByType
  }
}
