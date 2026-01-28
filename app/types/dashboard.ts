// Dashboard Types
import type { UserRole } from './auth'

// KPI Card Types
export interface KpiCard {
  id: string
  label: string
  value: string | number
  icon?: string
  color?: 'primary' | 'success' | 'warning' | 'error' | 'info' | 'neutral'
  trend?: {
    direction: 'up' | 'down' | 'neutral'
    value: string
    isPositive?: boolean
  }
  link?: string
}

// Goal Progress Item
export interface GoalProgressItem {
  id: string
  title: string
  progress: number
  status: 'on_track' | 'at_risk' | 'behind' | 'completed'
  dueDate?: string
  daysRemaining?: number
}

// Deadline Item
export interface DeadlineItem {
  id: string
  title: string
  type: 'goal' | 'review' | 'self_assessment'
  dueDate: string
  daysRemaining: number
  link?: string
}

// Notification Item
export interface NotificationItem {
  id: string
  type: 'review_reminder' | 'goal_update' | 'feedback' | 'approval' | 'system'
  title: string
  message: string
  createdAt: string
  isRead: boolean
  link?: string
}

// Quick Action
export interface QuickAction {
  id: string
  label: string
  icon: string
  action: string
  link?: string
  variant?: 'solid' | 'outline' | 'ghost'
  color?: 'primary' | 'success' | 'warning' | 'error' | 'neutral'
}

// Pending Action (for managers)
export interface PendingAction {
  id: string
  type: 'goal_approval' | 'review_pending' | 'feedback_request'
  title: string
  description: string
  employeeName: string
  employeeAvatar?: string
  createdAt: string
  link?: string
  actions: {
    primary?: { label: string; action: string }
    secondary?: { label: string; action: string }
  }
}

// Team Member
export interface TeamMember {
  id: string
  name: string
  title: string
  avatarUrl?: string
  progress: number
  status: 'on_track' | 'at_risk' | 'needs_attention' | 'exceeding'
  activeGoals: number
  link?: string
}

// Review Cycle
export interface ReviewCycle {
  id: string
  name: string
  progress: number
  selfAssessmentProgress: number
  managerReviewProgress: number
  startDate: string
  endDate: string
  status: 'active' | 'upcoming' | 'completed'
  link?: string
}

// Department Performance
export interface DepartmentPerformance {
  id: string
  name: string
  averageRating: number
  employeeCount: number
  goalsCompleted: number
  goalsTotal: number
}

// Chart Data
export interface ChartDataPoint {
  label: string
  value: number
}

export interface ChartDataset {
  label: string
  data: number[]
  color?: string
}

export interface ChartData {
  labels: string[]
  datasets: ChartDataset[]
}

// System Health (Admin)
export interface SystemHealthItem {
  id: string
  name: string
  status: 'healthy' | 'warning' | 'error'
  value?: string
  description?: string
}

// Recent Login (Admin)
export interface RecentLogin {
  id: string
  userName: string
  userEmail: string
  avatarUrl?: string
  loginTime: string
  ipAddress?: string
  device?: string
}

// Activity Feed Item
export interface ActivityItem {
  id: string
  type: 'goal_created' | 'goal_completed' | 'review_submitted' | 'user_joined' | 'feedback_given'
  title: string
  description: string
  timestamp: string
  user?: {
    name: string
    avatarUrl?: string
  }
}

// Role-specific Dashboard Data
export interface EmployeeDashboardData {
  kpis: KpiCard[]
  goalsProgress: GoalProgressItem[]
  upcomingDeadlines: DeadlineItem[]
  notifications: NotificationItem[]
  performanceTrend: ChartData
  quickActions: QuickAction[]
}

export interface ManagerDashboardData {
  kpis: KpiCard[]
  pendingActions: PendingAction[]
  teamMembers: TeamMember[]
  teamGoalsAlignment: ChartData
  reviewDeadlines: DeadlineItem[]
  quickActions: QuickAction[]
}

export interface HRDashboardData {
  kpis: KpiCard[]
  reviewCycles: ReviewCycle[]
  departmentPerformance: DepartmentPerformance[]
  performanceDistribution: ChartData
  recentActivity: ActivityItem[]
  quickActions: QuickAction[]
}

export interface CSuiteDashboardData {
  kpis: KpiCard[]
  performanceTrends: ChartData
  departmentPerformance: DepartmentPerformance[]
  strategicGoals: GoalProgressItem[]
  quickActions: QuickAction[]
}

export interface AdminDashboardData {
  kpis: KpiCard[]
  systemHealth: SystemHealthItem[]
  recentLogins: RecentLogin[]
  userActivity: ChartData
  quickActions: QuickAction[]
}

// Union type for all dashboard data
export type DashboardData =
  | EmployeeDashboardData
  | ManagerDashboardData
  | HRDashboardData
  | CSuiteDashboardData
  | AdminDashboardData

// Dashboard State
export interface DashboardState {
  data: DashboardData | null
  isLoading: boolean
  error: string | null
  lastRefreshed: Date | null
  userRole: UserRole | null
}

// API Response wrapper
export interface DashboardResponse<T> {
  success: boolean
  data: T
  meta?: {
    timestamp: string
  }
}
