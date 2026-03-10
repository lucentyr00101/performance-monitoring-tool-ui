// useAnalytics composable - Vue composable for analytics data
import { useAnalyticsStore } from '~/stores/analytics'
import { useAuthStore } from '~/stores/auth'
import type {
  AnalyticsFilters,
  AnalyticsType,
  DateRangePreset,
  ExportFormat,
  ExportOptions,
  GoalAnalyticsData,
  PerformanceAnalyticsData,
  ReviewCycleAnalyticsData,
  TeamAnalyticsData,
  EmployeeAnalyticsData,
  KpisData,
  DashboardAnalyticsData,
  DepartmentAnalyticsData
} from '~/types/analytics'

/**
 * Composable for analytics data management
 * Provides reactive access to analytics data and actions
 */
export function useAnalytics() {
  const store = useAnalyticsStore()
  const authStore = useAuthStore()

  // ============================================
  // REACTIVE STATE
  // ============================================

  const kpis = computed(() => store.kpis)
  const kpisEmployeeCount = computed(() => store.kpisEmployeeCount)
  const kpisGoalsCompletionRate = computed(() => store.kpisGoalsCompletionRate)
  const kpisReviewCompletionRate = computed(() => store.kpisReviewCompletionRate)
  const kpisAvgPerformanceScore = computed(() => store.kpisAvgPerformanceScore)
  const kpisActiveReviewCycles = computed(() => store.kpisActiveReviewCycles)

  const goalAnalytics = computed(() => store.goalAnalytics)
  const performanceAnalytics = computed(() => store.performanceAnalytics)
  const reviewCycleAnalytics = computed(() => store.reviewCycleAnalytics)
  const teamAnalytics = computed(() => store.teamAnalytics)
  const employeeAnalytics = computed(() => store.employeeAnalytics)

  const filters = computed(() => store.filters)
  const selectedCycleId = computed(() => store.selectedCycleId)
  const isLoading = computed(() => store.isLoading)
  const isExporting = computed(() => store.isExporting)
  const error = computed(() => store.error)
  const lastRefreshed = computed(() => store.lastRefreshed)
  const activeFiltersCount = computed(() => store.activeFiltersCount)

  // Data availability
  const hasGoalData = computed(() => store.hasGoalData)
  const hasPerformanceData = computed(() => store.hasPerformanceData)
  const hasReviewData = computed(() => store.hasReviewData)
  const hasTeamData = computed(() => store.hasTeamData)
  const hasEmployeeData = computed(() => store.hasEmployeeData)

  // Summary getters
  const goalCompletionRate = computed(() => store.goalCompletionRate)
  const totalGoals = computed(() => store.totalGoals)
  const goalsOnTrack = computed(() => store.goalsOnTrack)
  const averageRating = computed(() => store.averageRating)
  const ratingTrend = computed(() => store.ratingTrend)
  const topPerformersCount = computed(() => store.topPerformersCount)
  const cycleCompletionRate = computed(() => store.cycleCompletionRate)
  const daysRemaining = computed(() => store.daysRemaining)
  const teamSize = computed(() => store.teamSize)
  const teamAvgRating = computed(() => store.teamAvgRating)
  const personalGoalCompletion = computed(() => store.personalGoalCompletion)
  const personalAvgRating = computed(() => store.personalAvgRating)

  // ============================================
  // PERMISSION HELPERS
  // ============================================

  /**
   * Check if user can view specific analytics type
   */
  function canViewAnalytics(type: AnalyticsType): boolean {
    const user = authStore.user
    if (!user) return false

    const role = user.role

    switch (type) {
      case 'goals':
        // HR, Admin, and C-Suite can view goal analytics
        return ['admin', 'hr', 'csuite'].includes(role)
      case 'performance':
        // HR, Admin, and C-Suite can view performance analytics
        return ['admin', 'hr', 'csuite'].includes(role)
      case 'reviews':
        // HR and Admin can view review cycle analytics
        return ['admin', 'hr'].includes(role)
      case 'team':
        // Managers and above can view team analytics
        return ['admin', 'hr', 'manager'].includes(role)
      case 'employee':
        // All authenticated users can view their own analytics
        return true
      default:
        return false
    }
  }

  /**
   * Check if user can export analytics data
   */
  function canExportData(): boolean {
    const user = authStore.user
    if (!user) return false

    // HR, Admin, and Department Heads can export
    return ['admin', 'hr', 'department_head', 'manager'].includes(user.role)
  }

  /**
   * Get available analytics types for current user
   */
  function getAvailableAnalyticsTypes(): AnalyticsType[] {
    const types: AnalyticsType[] = []

    if (canViewAnalytics('goals')) types.push('goals')
    if (canViewAnalytics('performance')) types.push('performance')
    if (canViewAnalytics('reviews')) types.push('reviews')
    if (canViewAnalytics('team')) types.push('team')
    if (canViewAnalytics('employee')) types.push('employee')

    return types
  }

  // ============================================
  // UI HELPERS
  // ============================================

  /**
   * Format metric value for display
   */
  function formatMetricValue(value: number, type: 'percentage' | 'number' | 'rating' = 'number'): string {
    switch (type) {
      case 'percentage':
        return `${Math.round(value)}%`
      case 'rating':
        return value.toFixed(1)
      default:
        return value.toLocaleString()
    }
  }

  /**
   * Get color for trend indicator
   */
  function getTrendColor(trend: 'up' | 'down' | 'stable'): string {
    switch (trend) {
      case 'up':
        return 'green'
      case 'down':
        return 'red'
      default:
        return 'gray'
    }
  }

  /**
   * Get icon for trend indicator
   */
  function getTrendIcon(trend: 'up' | 'down' | 'stable'): string {
    switch (trend) {
      case 'up':
        return 'heroicons:arrow-trending-up'
      case 'down':
        return 'heroicons:arrow-trending-down'
      default:
        return 'heroicons:minus'
    }
  }

  /**
   * Get color based on completion percentage
   */
  function getCompletionColor(percentage: number): string {
    if (percentage >= 80) return 'green'
    if (percentage >= 50) return 'yellow'
    return 'red'
  }

  /**
   * Get color based on rating value (1-5 scale)
   */
  function getRatingColor(rating: number): string {
    if (rating >= 4) return 'green'
    if (rating >= 3) return 'yellow'
    return 'red'
  }

  /**
   * Format date for display
   */
  function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  /**
   * Format relative time for last refreshed
   */
  function formatLastRefreshed(dateString: string | null): string {
    if (!dateString) return 'Never'

    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins} min ago`

    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours}h ago`

    return formatDate(dateString)
  }

  /**
   * Get date range preset options
   */
  function getDateRangeOptions(): { value: DateRangePreset; label: string }[] {
    return [
      { value: 'last_7_days', label: 'Last 7 Days' },
      { value: 'last_30_days', label: 'Last 30 Days' },
      { value: 'last_quarter', label: 'Last Quarter' },
      { value: 'last_year', label: 'Last Year' },
      { value: 'custom', label: 'Custom Range' }
    ]
  }

  /**
   * Get export format options
   */
  function getExportFormatOptions(): { value: ExportFormat; label: string; icon: string }[] {
    return [
      { value: 'pdf', label: 'PDF Report', icon: 'heroicons:document' },
      { value: 'csv', label: 'CSV File', icon: 'heroicons:table-cells' },
      { value: 'excel', label: 'Excel File', icon: 'heroicons:document-chart-bar' }
    ]
  }

  // ============================================
  // FETCH ACTIONS
  // ============================================

  async function fetchKpis(params?: { period?: string; department?: string }): Promise<KpisData> {
    return store.fetchKpis(params)
  }

  async function fetchDashboardAnalytics(): Promise<DashboardAnalyticsData> {
    return store.fetchDashboardAnalytics()
  }

  async function fetchDepartmentAnalytics(departmentId: string): Promise<DepartmentAnalyticsData> {
    return store.fetchDepartmentAnalytics(departmentId)
  }

  async function fetchGoalAnalytics(): Promise<GoalAnalyticsData> {
    return store.fetchGoalAnalytics()
  }

  async function fetchPerformanceAnalytics(): Promise<PerformanceAnalyticsData> {
    return store.fetchPerformanceAnalytics()
  }

  async function fetchReviewCycleAnalytics(): Promise<ReviewCycleAnalyticsData> {
    return store.fetchReviewCycleAnalytics()
  }

  async function fetchTeamAnalytics(teamId?: string): Promise<TeamAnalyticsData> {
    const id = teamId || authStore.user?.id
    if (!id) throw new Error('No team ID provided')
    return store.fetchTeamAnalytics(id)
  }

  async function fetchEmployeeAnalytics(employeeId?: string): Promise<EmployeeAnalyticsData> {
    const id = employeeId || authStore.user?.id
    if (!id) throw new Error('No employee ID provided')
    return store.fetchEmployeeAnalytics(id)
  }

  // ============================================
  // EXPORT ACTIONS
  // ============================================

  async function exportData(type: AnalyticsType, format: ExportFormat, options?: Partial<ExportOptions>) {
    return store.exportData({
      type,
      format,
      filters: store.filters,
      includeCharts: options?.includeCharts ?? true,
      includeRawData: options?.includeRawData ?? false,
      includeSummary: options?.includeSummary ?? true
    })
  }

  // ============================================
  // FILTER ACTIONS
  // ============================================

  function setFilters(newFilters: AnalyticsFilters): void {
    store.setFilters(newFilters)
  }

  function updateFilter<K extends keyof AnalyticsFilters>(key: K, value: AnalyticsFilters[K]): void {
    store.updateFilter(key, value)
  }

  function setDateRange(preset: DateRangePreset): void {
    store.setDateRange(preset)
  }

  function setCustomDateRange(startDate: string, endDate: string): void {
    store.setCustomDateRange(startDate, endDate)
  }

  function setSelectedCycle(cycleId: string | null): void {
    store.setSelectedCycle(cycleId)
  }

  function clearFilters(): void {
    store.clearFilters()
  }

  // ============================================
  // UTILITY ACTIONS
  // ============================================

  function clearError(): void {
    store.clearError()
  }

  function clearData(): void {
    store.clearData()
  }

  function reset(): void {
    store.reset()
  }

  return {
    // State
    kpis,
    kpisEmployeeCount,
    kpisGoalsCompletionRate,
    kpisReviewCompletionRate,
    kpisAvgPerformanceScore,
    kpisActiveReviewCycles,
    goalAnalytics,
    performanceAnalytics,
    reviewCycleAnalytics,
    teamAnalytics,
    employeeAnalytics,
    filters,
    selectedCycleId,
    isLoading,
    isExporting,
    error,
    lastRefreshed,
    activeFiltersCount,

    // Data availability
    hasGoalData,
    hasPerformanceData,
    hasReviewData,
    hasTeamData,
    hasEmployeeData,

    // Summary getters
    goalCompletionRate,
    totalGoals,
    goalsOnTrack,
    averageRating,
    ratingTrend,
    topPerformersCount,
    cycleCompletionRate,
    daysRemaining,
    teamSize,
    teamAvgRating,
    personalGoalCompletion,
    personalAvgRating,

    // Permission helpers
    canViewAnalytics,
    canExportData,
    getAvailableAnalyticsTypes,

    // UI helpers
    formatMetricValue,
    getTrendColor,
    getTrendIcon,
    getCompletionColor,
    getRatingColor,
    formatDate,
    formatLastRefreshed,
    getDateRangeOptions,
    getExportFormatOptions,

    // Fetch actions
    fetchKpis,
    fetchDashboardAnalytics,
    fetchDepartmentAnalytics,
    fetchGoalAnalytics,
    fetchPerformanceAnalytics,
    fetchReviewCycleAnalytics,
    fetchTeamAnalytics,
    fetchEmployeeAnalytics,

    // Export actions
    exportData,

    // Filter actions
    setFilters,
    updateFilter,
    setDateRange,
    setCustomDateRange,
    setSelectedCycle,
    clearFilters,

    // Utility actions
    clearError,
    clearData,
    reset
  }
}
