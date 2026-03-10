// Analytics Service - API calls for analytics data
import { api } from '~/utils/api'
import type {
  AnalyticsFilters,
  AnalyticsResponse,
  GoalAnalyticsData,
  PerformanceAnalyticsData,
  ReviewCycleAnalyticsData,
  TeamAnalyticsData,
  EmployeeAnalyticsData,
  ExportOptions,
  ExportResponse,
  KpisData,
  DashboardAnalyticsData,
  DepartmentAnalyticsData
} from '~/types/analytics'

/**
 * Build query string from analytics filters
 */
function buildFilterQuery(filters: AnalyticsFilters): string {
  const params = new URLSearchParams()

  // Query params stay snake_case per API convention
  if (filters.dateRange) params.set('date_range', filters.dateRange)
  if (filters.startDate) params.set('start_date', filters.startDate)
  if (filters.endDate) params.set('end_date', filters.endDate)
  if (filters.departmentId) params.set('department_id', filters.departmentId)
  if (filters.goalType) params.set('goal_type', filters.goalType)
  if (filters.reviewCycleId) params.set('review_cycle_id', filters.reviewCycleId)

  const query = params.toString()
  return query ? `?${query}` : ''
}

/**
 * Analytics Service - Communicates with the API Gateway
 */
export const analyticsService = {
  /**
   * Get goal analytics data
   * GET /api/v1/analytics/goals
   */
  async getGoalAnalytics(filters: AnalyticsFilters = {}) {
    const query = buildFilterQuery(filters)
    return api.get<GoalAnalyticsData>(`/analytics/goals${query}`) as Promise<AnalyticsResponse<GoalAnalyticsData>>
  },

  /**
   * Get performance analytics data
   * GET /api/v1/analytics/performance
   */
  async getPerformanceAnalytics(filters: AnalyticsFilters = {}) {
    const query = buildFilterQuery(filters)
    return api.get<PerformanceAnalyticsData>(`/analytics/performance${query}`) as Promise<AnalyticsResponse<PerformanceAnalyticsData>>
  },

  /**
   * Get review cycle analytics data
   * GET /api/v1/analytics/reviews
   */
  async getReviewCycleAnalytics(filters: AnalyticsFilters = {}) {
    const query = buildFilterQuery(filters)
    return api.get<ReviewCycleAnalyticsData>(`/analytics/reviews${query}`) as Promise<AnalyticsResponse<ReviewCycleAnalyticsData>>
  },

  /**
   * Get team analytics data (for managers)
   * GET /api/v1/analytics/team/:teamId
   */
  async getTeamAnalytics(teamId: string, filters: AnalyticsFilters = {}) {
    const query = buildFilterQuery(filters)
    return api.get<TeamAnalyticsData>(`/analytics/team/${teamId}${query}`) as Promise<AnalyticsResponse<TeamAnalyticsData>>
  },

  /**
   * Get employee analytics data (personal metrics)
   * GET /api/v1/analytics/employee/:employeeId
   */
  async getEmployeeAnalytics(employeeId: string, filters: AnalyticsFilters = {}) {
    const query = buildFilterQuery(filters)
    return api.get<EmployeeAnalyticsData>(`/analytics/employee/${employeeId}${query}`) as Promise<AnalyticsResponse<EmployeeAnalyticsData>>
  },

  /**
   * Get KPI summary data
   * GET /api/v1/analytics/kpis
   */
  async getKpis(params: { period?: string; department?: string } = {}) {
    const query = new URLSearchParams()
    if (params.period) query.set('period', params.period)
    if (params.department) query.set('department', params.department)
    const qs = query.toString()
    return api.get<KpisData>(`/analytics/kpis${qs ? `?${qs}` : ''}`) as Promise<AnalyticsResponse<KpisData>>
  },

  /**
   * Get dashboard analytics data
   * GET /api/v1/analytics/dashboard
   */
  async getDashboardAnalytics(filters: AnalyticsFilters = {}) {
    const query = buildFilterQuery(filters)
    return api.get<DashboardAnalyticsData>(`/analytics/dashboard${query}`) as Promise<AnalyticsResponse<DashboardAnalyticsData>>
  },

  /**
   * Get department analytics data
   * GET /api/v1/analytics/department/:departmentId
   */
  async getDepartmentAnalytics(departmentId: string, filters: AnalyticsFilters = {}) {
    const query = buildFilterQuery(filters)
    return api.get<DepartmentAnalyticsData>(`/analytics/department/${departmentId}${query}`) as Promise<AnalyticsResponse<DepartmentAnalyticsData>>
  },

  /**
   * Export analytics data
   * POST /api/v1/analytics/export
   */
  async exportData(options: ExportOptions) {
    return api.post<ExportResponse>('/analytics/export', options) as Promise<{ success: boolean; data: ExportResponse; meta: { timestamp: string } }>
  }
}
