// Analytics Store - Pinia store for analytics state management
import { defineStore } from 'pinia'
import { analyticsService } from '~/services/analytics'
import type {
  AnalyticsState,
  AnalyticsFilters,
  GoalAnalyticsData,
  PerformanceAnalyticsData,
  ReviewCycleAnalyticsData,
  TeamAnalyticsData,
  EmployeeAnalyticsData,
  ExportOptions,
  ExportResponse,
  DateRangePreset,
  KpisData,
  DashboardAnalyticsData,
  DepartmentAnalyticsData
} from '~/types/analytics'

export const useAnalyticsStore = defineStore('analytics', {
  state: (): AnalyticsState => ({
    // Data
    goalAnalytics: null,
    performanceAnalytics: null,
    reviewCycleAnalytics: null,
    teamAnalytics: null,
    employeeAnalytics: null,
    kpis: null,

    // Filters
    filters: {
      dateRange: 'last_30_days'
    },
    selectedCycleId: null,

    // UI State
    isLoading: false,
    isExporting: false,
    error: null,
    lastRefreshed: null
  }),

  getters: {
    hasGoalData: (state) => state.goalAnalytics !== null,
    hasPerformanceData: (state) => state.performanceAnalytics !== null,
    hasReviewData: (state) => state.reviewCycleAnalytics !== null,
    hasTeamData: (state) => state.teamAnalytics !== null,
    hasEmployeeData: (state) => state.employeeAnalytics !== null,

    // Goal analytics getters
    goalCompletionRate: (state) => state.goalAnalytics?.summary.completionRate ?? 0,
    totalGoals: (state) => state.goalAnalytics?.summary.totalGoals ?? 0,
    goalsOnTrack: (state) => state.goalAnalytics?.summary.onTrackPercentage ?? 0,

    // Performance analytics getters
    averageRating: (state) => state.performanceAnalytics?.summary.averageRating ?? 0,
    ratingTrend: (state) => state.performanceAnalytics?.summary.ratingTrend ?? 'stable',
    topPerformersCount: (state) => state.performanceAnalytics?.summary.topPerformersCount ?? 0,

    // Review cycle getters
    cycleCompletionRate: (state) => state.reviewCycleAnalytics?.summary.completionRate ?? 0,
    daysRemaining: (state) => state.reviewCycleAnalytics?.summary.daysRemaining ?? 0,
    incompleteReviewsCount: (state) => state.reviewCycleAnalytics?.incompleteReviews.length ?? 0,

    // Team getters
    teamSize: (state) => state.teamAnalytics?.summary.teamSize ?? 0,
    teamAvgRating: (state) => state.teamAnalytics?.summary.averageRating ?? 0,
    teamGoalCompletion: (state) => state.teamAnalytics?.summary.averageGoalCompletion ?? 0,

    // Employee getters
    personalGoalCompletion: (state) => state.employeeAnalytics?.summary.goalCompletionRate ?? 0,
    personalAvgRating: (state) => state.employeeAnalytics?.summary.averageRating ?? 0,
    personalRatingTrend: (state) => state.employeeAnalytics?.summary.ratingTrend ?? 'stable',

    // KPI getters
    kpisEmployeeCount: (state) => state.kpis?.employeeCount ?? 0,
    kpisGoalsCompletionRate: (state) => state.kpis?.goalsCompletionRate ?? 0,
    kpisReviewCompletionRate: (state) => state.kpis?.reviewCompletionRate ?? 0,
    kpisAvgPerformanceScore: (state) => state.kpis?.averagePerformanceScore ?? 0,
    kpisActiveReviewCycles: (state) => state.kpis?.activeReviewCycles ?? 0,

    // Filter helpers
    activeFiltersCount: (state) => {
      let count = 0
      if (state.filters.dateRange && state.filters.dateRange !== 'last_30_days') count++
      if (state.filters.departmentId) count++
      if (state.filters.goalType) count++
      if (state.filters.reviewCycleId) count++
      if (state.filters.startDate && state.filters.endDate) count++
      return count
    },

  },

  actions: {
    // ============================================
    // FETCH ACTIONS
    // ============================================

    async fetchGoalAnalytics(): Promise<GoalAnalyticsData> {
      this.isLoading = true
      this.error = null

      try {
        const response = await analyticsService.getGoalAnalytics(this.filters)
        this.goalAnalytics = response.data
        this.lastRefreshed = new Date().toISOString()
        return response.data
      }
      catch (error) {
        const err = error as { error?: { message?: string } }
        this.error = err?.error?.message || 'Failed to fetch goal analytics'
        throw error
      }
      finally {
        this.isLoading = false
      }
    },

    async fetchPerformanceAnalytics(): Promise<PerformanceAnalyticsData> {
      this.isLoading = true
      this.error = null

      try {
        const response = await analyticsService.getPerformanceAnalytics(this.filters)
        this.performanceAnalytics = response.data
        this.lastRefreshed = new Date().toISOString()
        return response.data
      }
      catch (error) {
        const err = error as { error?: { message?: string } }
        this.error = err?.error?.message || 'Failed to fetch performance analytics'
        throw error
      }
      finally {
        this.isLoading = false
      }
    },

    async fetchReviewCycleAnalytics(): Promise<ReviewCycleAnalyticsData> {
      this.isLoading = true
      this.error = null

      try {
        const filters = { ...this.filters }
        if (this.selectedCycleId) {
          filters.reviewCycleId = this.selectedCycleId
        }
        const response = await analyticsService.getReviewCycleAnalytics(filters)
        this.reviewCycleAnalytics = response.data
        this.lastRefreshed = new Date().toISOString()
        return response.data
      }
      catch (error) {
        const err = error as { error?: { message?: string } }
        this.error = err?.error?.message || 'Failed to fetch review cycle analytics'
        throw error
      }
      finally {
        this.isLoading = false
      }
    },

    async fetchTeamAnalytics(teamId: string): Promise<TeamAnalyticsData> {
      this.isLoading = true
      this.error = null

      try {
        const response = await analyticsService.getTeamAnalytics(teamId, this.filters)
        this.teamAnalytics = response.data
        this.lastRefreshed = new Date().toISOString()
        return response.data
      }
      catch (error) {
        const err = error as { error?: { message?: string } }
        this.error = err?.error?.message || 'Failed to fetch team analytics'
        throw error
      }
      finally {
        this.isLoading = false
      }
    },

    async fetchEmployeeAnalytics(employeeId: string): Promise<EmployeeAnalyticsData> {
      this.isLoading = true
      this.error = null

      try {
        const response = await analyticsService.getEmployeeAnalytics(employeeId, this.filters)
        this.employeeAnalytics = response.data
        this.lastRefreshed = new Date().toISOString()
        return response.data
      }
      catch (error) {
        const err = error as { error?: { message?: string } }
        this.error = err?.error?.message || 'Failed to fetch employee analytics'
        throw error
      }
      finally {
        this.isLoading = false
      }
    },

    async fetchKpis(params: { period?: string; department?: string } = {}): Promise<KpisData> {
      this.isLoading = true
      this.error = null

      try {
        const response = await analyticsService.getKpis(params)
        this.kpis = response.data
        this.lastRefreshed = new Date().toISOString()
        return response.data
      }
      catch (error) {
        const err = error as { error?: { message?: string } }
        this.error = err?.error?.message || 'Failed to fetch KPIs'
        throw error
      }
      finally {
        this.isLoading = false
      }
    },

    async fetchDashboardAnalytics(): Promise<DashboardAnalyticsData> {
      this.isLoading = true
      this.error = null

      try {
        const response = await analyticsService.getDashboardAnalytics(this.filters)
        this.lastRefreshed = new Date().toISOString()
        return response.data
      }
      catch (error) {
        const err = error as { error?: { message?: string } }
        this.error = err?.error?.message || 'Failed to fetch dashboard analytics'
        throw error
      }
      finally {
        this.isLoading = false
      }
    },

    async fetchDepartmentAnalytics(departmentId: string): Promise<DepartmentAnalyticsData> {
      this.isLoading = true
      this.error = null

      try {
        const response = await analyticsService.getDepartmentAnalytics(departmentId, this.filters)
        this.lastRefreshed = new Date().toISOString()
        return response.data
      }
      catch (error) {
        const err = error as { error?: { message?: string } }
        this.error = err?.error?.message || 'Failed to fetch department analytics'
        throw error
      }
      finally {
        this.isLoading = false
      }
    },

    // ============================================
    // EXPORT ACTIONS
    // ============================================

    async exportData(options: ExportOptions): Promise<ExportResponse> {
      this.isExporting = true
      this.error = null

      try {
        const response = await analyticsService.exportData({
          ...options,
          filters: this.filters
        })
        return response.data
      }
      catch (error) {
        const err = error as { error?: { message?: string } }
        this.error = err?.error?.message || 'Failed to export data'
        throw error
      }
      finally {
        this.isExporting = false
      }
    },

    // ============================================
    // FILTER ACTIONS
    // ============================================

    setFilters(filters: AnalyticsFilters): void {
      this.filters = { ...filters }
    },

    updateFilter<K extends keyof AnalyticsFilters>(key: K, value: AnalyticsFilters[K]): void {
      this.filters[key] = value
    },

    setDateRange(preset: DateRangePreset): void {
      this.filters.dateRange = preset
      // Clear custom dates when using preset
      if (preset !== 'custom') {
        this.filters.startDate = undefined
        this.filters.endDate = undefined
      }
    },

    setCustomDateRange(startDate: string, endDate: string): void {
      this.filters.dateRange = 'custom'
      this.filters.startDate = startDate
      this.filters.endDate = endDate
    },

    setSelectedCycle(cycleId: string | null): void {
      this.selectedCycleId = cycleId
      if (cycleId) {
        this.filters.reviewCycleId = cycleId
      }
      else {
        delete this.filters.reviewCycleId
      }
    },

    clearFilters(): void {
      this.filters = {
        dateRange: 'last_30_days'
      }
      this.selectedCycleId = null
    },

    // ============================================
    // UTILITY ACTIONS
    // ============================================

    clearError(): void {
      this.error = null
    },

    clearData(): void {
      this.goalAnalytics = null
      this.performanceAnalytics = null
      this.reviewCycleAnalytics = null
      this.teamAnalytics = null
      this.employeeAnalytics = null
      this.kpis = null
      this.lastRefreshed = null
    },

    reset(): void {
      this.clearData()
      this.clearFilters()
      this.error = null
      this.isLoading = false
      this.isExporting = false
    }
  }
})

