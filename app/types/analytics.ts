// Analytics & Reports Types
// Based on PRD: Analytics module for performance monitoring tool

import type { GoalType, GoalStatus } from './goal'
import type { ReviewCycleType } from './review'

// ============================================
// FILTER TYPES
// ============================================

export type DateRangePreset = 'last_7_days' | 'last_30_days' | 'last_quarter' | 'last_year' | 'custom'
export type ExportFormat = 'pdf' | 'csv' | 'excel'
export type AnalyticsType = 'goals' | 'performance' | 'reviews' | 'team' | 'employee'

export interface AnalyticsFilters {
  dateRange?: DateRangePreset
  startDate?: string
  endDate?: string
  departmentId?: string
  goalType?: GoalType
  reviewCycleId?: string
}

export interface DateRange {
  start: string
  end: string
  label: string
}

// ============================================
// CHART DATA TYPES
// ============================================

export interface ChartDataPoint {
  label: string
  value: number
}

export interface TimeSeriesDataPoint {
  date: string
  value: number
}

export interface MultiSeriesDataPoint {
  label: string
  values: Record<string, number>
}

// ============================================
// GOAL ANALYTICS DATA
// ============================================

export interface GoalsByStatus {
  draft: number
  pending: number
  active: number
  completed: number
  cancelled: number
}

export interface GoalsByType {
  individual: number
  team: number
  department: number
  company: number
}

export interface GoalTrendPoint {
  month: string
  completed: number
  created: number
  completionRate: number
}

export interface DepartmentGoalStats {
  departmentId: string
  departmentName: string
  totalGoals: number
  completedGoals: number
  completionRate: number
  averageProgress: number
}

export interface GoalAnalyticsData {
  summary: {
    totalGoals: number
    completionRate: number
    averageProgress: number
    onTrackPercentage: number
    goalsCompletedThisPeriod: number
    goalsCreatedThisPeriod: number
  }
  byStatus: GoalsByStatus
  byType: GoalsByType
  trend: GoalTrendPoint[]
  byDepartment: DepartmentGoalStats[]
  topPerformers: {
    employeeId: string
    employeeName: string
    department: string
    goalsCompleted: number
    averageProgress: number
  }[]
}

// ============================================
// PERFORMANCE ANALYTICS DATA
// ============================================

export interface RatingDistribution {
  rating: number
  count: number
  percentage: number
}

export interface PerformanceTrendPoint {
  period: string
  averageRating: number
  reviewsCompleted: number
}

export interface DepartmentPerformanceStats {
  departmentId: string
  departmentName: string
  averageRating: number
  totalReviews: number
  topRatingCount: number
  improvementNeededCount: number
}

export interface TopPerformer {
  employeeId: string
  employeeName: string
  department: string
  avatarUrl?: string
  averageRating: number
  goalsCompleted: number
  reviewCount: number
}

export interface PerformanceAnalyticsData {
  summary: {
    averageRating: number
    totalReviews: number
    topPerformersCount: number
    improvementNeededCount: number
    ratingTrend: 'up' | 'down' | 'stable'
    ratingChange: number
  }
  ratingDistribution: RatingDistribution[]
  trend: PerformanceTrendPoint[]
  byDepartment: DepartmentPerformanceStats[]
  topPerformers: TopPerformer[]
}

// ============================================
// REVIEW CYCLE ANALYTICS DATA
// ============================================

export interface ReviewPhaseCompletion {
  phase: 'self' | 'manager' | 'peer'
  total: number
  completed: number
  completionRate: number
}

export interface DepartmentReviewStats {
  departmentId: string
  departmentName: string
  totalReviews: number
  completedReviews: number
  completionRate: number
  averageRating: number
}

export interface DailyCompletionTrend {
  date: string
  completed: number
  cumulativeCompleted: number
  cumulativePercentage: number
}

export interface IncompleteReview {
  reviewId: string
  employeeId: string
  employeeName: string
  department: string
  reviewType: 'self' | 'manager' | 'peer'
  reviewerName?: string
  status: 'pending' | 'in_progress'
  daysOverdue: number
}

export interface ReviewCycleAnalyticsData {
  cycle: {
    id: string
    name: string
    type: ReviewCycleType
    startDate: string
    endDate: string
    status: 'draft' | 'active' | 'completed' | 'cancelled'
  }
  summary: {
    totalReviews: number
    completedReviews: number
    completionRate: number
    daysRemaining: number
    averageRating: number
  }
  byPhase: ReviewPhaseCompletion[]
  byDepartment: DepartmentReviewStats[]
  dailyTrend: DailyCompletionTrend[]
  incompleteReviews: IncompleteReview[]
}

// ============================================
// TEAM ANALYTICS DATA (Manager View)
// ============================================

export interface TeamMemberPerformance {
  employeeId: string
  employeeName: string
  avatarUrl?: string
  jobTitle: string
  goalsTotal: number
  goalsCompleted: number
  goalProgress: number
  lastReviewRating?: number
  performanceTrend: 'up' | 'down' | 'stable'
}

export interface TeamGoalProgress {
  goalId: string
  goalTitle: string
  goalType: GoalType
  ownerName: string
  progress: number
  status: GoalStatus
  dueDate: string
}

export interface TeamAnalyticsData {
  summary: {
    teamSize: number
    averageGoalCompletion: number
    averageRating: number
    goalsOnTrack: number
    goalsAtRisk: number
    topPerformerId?: string
  }
  teamMembers: TeamMemberPerformance[]
  goalProgress: TeamGoalProgress[]
  comparison: {
    teamAvgRating: number
    departmentAvgRating: number
    companyAvgRating: number
    teamGoalCompletion: number
    departmentGoalCompletion: number
  }
}

// ============================================
// EMPLOYEE ANALYTICS DATA (Personal View)
// ============================================

export interface PersonalGoalProgress {
  goalId: string
  title: string
  type: GoalType
  progress: number
  status: GoalStatus
  dueDate: string
  keyResultsCompleted: number
  keyResultsTotal: number
}

export interface PersonalReviewHistory {
  reviewId: string
  cycleName: string
  reviewType: 'self' | 'manager' | 'peer'
  rating?: number
  submittedAt?: string
  period: string
}

export interface EmployeeAnalyticsData {
  summary: {
    totalGoals: number
    completedGoals: number
    goalCompletionRate: number
    averageRating: number
    ratingTrend: 'up' | 'down' | 'stable'
    currentStreak: number
  }
  goals: PersonalGoalProgress[]
  goalsByStatus: GoalsByStatus
  goalCompletionTrend: TimeSeriesDataPoint[]
  ratingHistory: {
    period: string
    rating: number
    reviewType: 'self' | 'manager' | 'peer'
  }[]
  reviews: PersonalReviewHistory[]
}

// ============================================
// EXPORT TYPES
// ============================================

export interface ExportOptions {
  format: ExportFormat
  type: AnalyticsType
  filters: AnalyticsFilters
  includeCharts?: boolean
  includeRawData?: boolean
  includeSummary?: boolean
}

export interface ExportResponse {
  success: boolean
  downloadUrl?: string
  fileName?: string
  expiresAt?: string
  error?: string
}

// ============================================
// KPI / DASHBOARD / DEPARTMENT ANALYTICS
// ============================================

export interface KpisData {
  averagePerformanceScore: number
  goalsCompletionRate: number
  reviewCompletionRate: number
  employeeCount: number
  activeReviewCycles: number
  trends: {
    performanceScore: number[]
    goalsCompletion: number[]
  }
}

export type DashboardAnalyticsData = Record<string, unknown>

export interface DepartmentAnalyticsData {
  departmentId: string
  departmentName: string
  employeeCount: number
  goalCompletionRate: number
  averagePerformanceScore: number
  reviewCompletionRate: number
}

// ============================================
// STORE STATE
// ============================================

export interface AnalyticsState {
  // Data
  goalAnalytics: GoalAnalyticsData | null
  performanceAnalytics: PerformanceAnalyticsData | null
  reviewCycleAnalytics: ReviewCycleAnalyticsData | null
  teamAnalytics: TeamAnalyticsData | null
  employeeAnalytics: EmployeeAnalyticsData | null
  kpis: KpisData | null

  // Filters
  filters: AnalyticsFilters
  selectedCycleId: string | null

  // UI State
  isLoading: boolean
  isExporting: boolean
  error: string | null
  lastRefreshed: string | null
}

// ============================================
// API RESPONSE TYPES
// ============================================

export interface AnalyticsResponse<T> {
  success: boolean
  data: T
  meta: {
    timestamp: string
    filtersApplied: AnalyticsFilters
    cacheHit?: boolean
  }
}

export interface AnalyticsListResponse<T> {
  success: boolean
  data: T[]
  meta: {
    timestamp: string
    total: number
  }
}
