// Dashboard Service - Mock data and API integration
import type { UserRole } from '~/types/auth'
import type {
  EmployeeDashboardData,
  ManagerDashboardData,
  HRDashboardData,
  CSuiteDashboardData,
  AdminDashboardData,
  DashboardResponse
} from '~/types/dashboard'

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// Mock Data Generators
function generateEmployeeDashboard(): EmployeeDashboardData {
  return {
    kpis: [
      { id: '1', label: 'Active Goals', value: 5, icon: 'i-heroicons-flag', color: 'primary' },
      { id: '2', label: 'Completed', value: 12, icon: 'i-heroicons-check-circle', color: 'success', trend: { direction: 'up', value: '+3', isPositive: true } },
      { id: '3', label: 'Next Review', value: '15 days', icon: 'i-heroicons-calendar', color: 'warning' },
      { id: '4', label: 'Completion Rate', value: '78%', icon: 'i-heroicons-chart-bar', color: 'info', trend: { direction: 'up', value: '+5%', isPositive: true } }
    ],
    goalsProgress: [
      { id: '1', title: 'Improve customer satisfaction scores by 15%', progress: 65, status: 'on_track', daysRemaining: 45 },
      { id: '2', title: 'Complete AWS Solutions Architect certification', progress: 80, status: 'on_track', daysRemaining: 30 },
      { id: '3', title: 'Learn TypeScript and implement in 2 projects', progress: 30, status: 'at_risk', daysRemaining: 60 },
      { id: '4', title: 'Mentor 2 junior developers', progress: 50, status: 'on_track', daysRemaining: 90 },
      { id: '5', title: 'Reduce bug count by 20%', progress: 45, status: 'behind', daysRemaining: 20 }
    ],
    upcomingDeadlines: [
      { id: '1', title: 'Q1 Self-Assessment', type: 'self_assessment', dueDate: '2026-02-05', daysRemaining: 8, link: '/reviews/self-assessment' },
      { id: '2', title: 'AWS Certification Goal', type: 'goal', dueDate: '2026-02-28', daysRemaining: 31, link: '/goals/2' },
      { id: '3', title: 'Q1 Performance Review', type: 'review', dueDate: '2026-03-15', daysRemaining: 46, link: '/reviews' }
    ],
    notifications: [
      { id: '1', type: 'review_reminder', title: 'Self-assessment due soon', message: 'Your Q1 2026 self-assessment is due in 8 days', createdAt: '2026-01-28T08:00:00Z', isRead: false, link: '/reviews/self-assessment' },
      { id: '2', type: 'feedback', title: 'New feedback received', message: 'Sarah Chen left feedback on your recent project', createdAt: '2026-01-27T14:30:00Z', isRead: false, link: '/feedback' },
      { id: '3', type: 'goal_update', title: 'Goal approved', message: 'Your Q1 learning goal has been approved by your manager', createdAt: '2026-01-26T10:15:00Z', isRead: true, link: '/goals/3' }
    ],
    performanceTrend: {
      labels: ['Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan'],
      datasets: [{
        label: 'Performance Score',
        data: [3.8, 4.0, 4.1, 4.0, 4.3, 4.5],
        color: 'primary'
      }]
    },
    quickActions: [
      { id: '1', label: 'Add Goal', icon: 'i-heroicons-plus', action: 'add_goal', link: '/goals/new', variant: 'solid', color: 'primary' },
      { id: '2', label: 'View All Goals', icon: 'i-heroicons-list-bullet', action: 'view_goals', link: '/goals', variant: 'outline' },
      { id: '3', label: 'Start Self-Assessment', icon: 'i-heroicons-pencil-square', action: 'self_assessment', link: '/reviews/self-assessment', variant: 'outline' }
    ]
  }
}

function generateManagerDashboard(): ManagerDashboardData {
  return {
    kpis: [
      { id: '1', label: 'Team Size', value: 8, icon: 'i-heroicons-users', color: 'primary' },
      { id: '2', label: 'On Track', value: 6, icon: 'i-heroicons-check-circle', color: 'success' },
      { id: '3', label: 'At Risk', value: 2, icon: 'i-heroicons-exclamation-triangle', color: 'warning' },
      { id: '4', label: 'Pending Actions', value: 5, icon: 'i-heroicons-clock', color: 'error', link: '/reviews/pending' }
    ],
    pendingActions: [
      { id: '1', type: 'goal_approval', title: "Approve Alice's Q1 Goal", description: 'Improve sales conversion by 10%', employeeName: 'Alice Johnson', createdAt: '2026-01-27T09:00:00Z', link: '/goals/approve/1', actions: { primary: { label: 'Approve', action: 'approve' }, secondary: { label: 'Reject', action: 'reject' } } },
      { id: '2', type: 'review_pending', title: "Complete Bob's Performance Review", description: 'Q4 2025 performance evaluation', employeeName: 'Bob Smith', createdAt: '2026-01-26T14:00:00Z', link: '/reviews/5', actions: { primary: { label: 'Start Review', action: 'start_review' } } },
      { id: '3', type: 'goal_approval', title: "Approve Carol's Training Goal", description: 'Complete leadership training program', employeeName: 'Carol Williams', createdAt: '2026-01-25T11:00:00Z', link: '/goals/approve/3', actions: { primary: { label: 'Approve', action: 'approve' }, secondary: { label: 'Reject', action: 'reject' } } },
      { id: '4', type: 'feedback_request', title: 'Provide feedback for Dave', description: 'Project milestone completion', employeeName: 'Dave Brown', createdAt: '2026-01-24T16:00:00Z', link: '/feedback/new', actions: { primary: { label: 'Give Feedback', action: 'give_feedback' } } },
      { id: '5', type: 'review_pending', title: "Complete Emma's Performance Review", description: 'Q4 2025 performance evaluation', employeeName: 'Emma Davis', createdAt: '2026-01-23T10:00:00Z', link: '/reviews/6', actions: { primary: { label: 'Start Review', action: 'start_review' } } }
    ],
    teamMembers: [
      { id: '1', name: 'Alice Johnson', title: 'Senior Developer', progress: 85, status: 'exceeding', activeGoals: 3, link: '/employees/1' },
      { id: '2', name: 'Bob Smith', title: 'Developer', progress: 72, status: 'on_track', activeGoals: 4, link: '/employees/2' },
      { id: '3', name: 'Carol Williams', title: 'Junior Developer', progress: 45, status: 'at_risk', activeGoals: 2, link: '/employees/3' },
      { id: '4', name: 'Dave Brown', title: 'Senior Developer', progress: 90, status: 'exceeding', activeGoals: 3, link: '/employees/4' },
      { id: '5', name: 'Emma Davis', title: 'Developer', progress: 68, status: 'on_track', activeGoals: 3, link: '/employees/5' },
      { id: '6', name: 'Frank Miller', title: 'Developer', progress: 55, status: 'needs_attention', activeGoals: 4, link: '/employees/6' },
      { id: '7', name: 'Grace Lee', title: 'Junior Developer', progress: 78, status: 'on_track', activeGoals: 2, link: '/employees/7' },
      { id: '8', name: 'Henry Wilson', title: 'Senior Developer', progress: 82, status: 'on_track', activeGoals: 3, link: '/employees/8' }
    ],
    teamGoalsAlignment: {
      labels: ['Q1 Revenue', 'Customer Satisfaction', 'Product Quality', 'Team Growth', 'Innovation'],
      datasets: [{
        label: 'Team Alignment',
        data: [85, 72, 90, 65, 78],
        color: 'primary'
      }]
    },
    reviewDeadlines: [
      { id: '1', title: "Bob's Performance Review", type: 'review', dueDate: '2026-02-01', daysRemaining: 4, link: '/reviews/5' },
      { id: '2', title: "Emma's Performance Review", type: 'review', dueDate: '2026-02-03', daysRemaining: 6, link: '/reviews/6' },
      { id: '3', title: 'Team Q1 Goal Review', type: 'review', dueDate: '2026-03-15', daysRemaining: 46, link: '/reviews/team' }
    ],
    quickActions: [
      { id: '1', label: 'Review Pending', icon: 'i-heroicons-clipboard-document-check', action: 'review_pending', link: '/reviews/pending', variant: 'solid', color: 'primary' },
      { id: '2', label: 'Add Team Goal', icon: 'i-heroicons-plus', action: 'add_team_goal', link: '/goals/new?type=team', variant: 'outline' },
      { id: '3', label: 'View Analytics', icon: 'i-heroicons-chart-pie', action: 'view_analytics', link: '/analytics/team', variant: 'outline' }
    ]
  }
}

function generateHRDashboard(): HRDashboardData {
  return {
    kpis: [
      { id: '1', label: 'Total Employees', value: 156, icon: 'i-heroicons-users', color: 'primary' },
      { id: '2', label: 'Active Goals', value: 245, icon: 'i-heroicons-flag', color: 'info' },
      { id: '3', label: 'Completion Rate', value: '72%', icon: 'i-heroicons-chart-bar', color: 'success', trend: { direction: 'up', value: '+8%', isPositive: true } },
      { id: '4', label: 'Avg Rating', value: '3.9', icon: 'i-heroicons-star', color: 'warning' }
    ],
    reviewCycles: [
      { id: '1', name: 'Q1 2026 Performance Review', progress: 68, selfAssessmentProgress: 85, managerReviewProgress: 52, startDate: '2026-01-15', endDate: '2026-03-15', status: 'active', link: '/reviews/cycles/1' },
      { id: '2', name: 'Annual 2025 Review', progress: 100, selfAssessmentProgress: 100, managerReviewProgress: 100, startDate: '2025-12-01', endDate: '2025-12-31', status: 'completed', link: '/reviews/cycles/2' }
    ],
    departmentPerformance: [
      { id: '1', name: 'Engineering', averageRating: 4.1, employeeCount: 45, goalsCompleted: 78, goalsTotal: 95 },
      { id: '2', name: 'Product', averageRating: 3.9, employeeCount: 22, goalsCompleted: 35, goalsTotal: 48 },
      { id: '3', name: 'Sales', averageRating: 3.7, employeeCount: 38, goalsCompleted: 52, goalsTotal: 72 },
      { id: '4', name: 'Marketing', averageRating: 3.8, employeeCount: 18, goalsCompleted: 28, goalsTotal: 36 },
      { id: '5', name: 'Customer Success', averageRating: 4.0, employeeCount: 25, goalsCompleted: 40, goalsTotal: 52 },
      { id: '6', name: 'HR & Admin', averageRating: 3.9, employeeCount: 8, goalsCompleted: 12, goalsTotal: 15 }
    ],
    performanceDistribution: {
      labels: ['Exceeds', 'Meets', 'Developing', 'Needs Improvement'],
      datasets: [{
        label: 'Employees',
        data: [28, 89, 31, 8],
        color: 'primary'
      }]
    },
    recentActivity: [
      { id: '1', type: 'review_submitted', title: 'Review submitted', description: 'John Doe submitted self-assessment', timestamp: '2026-01-28T09:30:00Z', user: { name: 'John Doe' } },
      { id: '2', type: 'goal_completed', title: 'Goal completed', description: 'Sales Q4 target achieved', timestamp: '2026-01-28T08:15:00Z', user: { name: 'Sarah Chen' } },
      { id: '3', type: 'user_joined', title: 'New employee', description: 'Mike Johnson joined Engineering', timestamp: '2026-01-27T14:00:00Z', user: { name: 'Mike Johnson' } },
      { id: '4', type: 'feedback_given', title: 'Feedback provided', description: 'Manager feedback submitted', timestamp: '2026-01-27T11:30:00Z', user: { name: 'Lisa Wang' } }
    ],
    quickActions: [
      { id: '1', label: 'Create Review Cycle', icon: 'i-heroicons-plus-circle', action: 'create_cycle', link: '/reviews/cycles/new', variant: 'solid', color: 'primary' },
      { id: '2', label: 'Generate Report', icon: 'i-heroicons-document-arrow-down', action: 'generate_report', link: '/analytics/reports', variant: 'outline' },
      { id: '3', label: 'Manage Users', icon: 'i-heroicons-user-group', action: 'manage_users', link: '/employees', variant: 'outline' }
    ]
  }
}

function generateCSuiteDashboard(): CSuiteDashboardData {
  return {
    kpis: [
      { id: '1', label: 'Company Score', value: '4.1', icon: 'i-heroicons-chart-bar-square', color: 'primary', trend: { direction: 'up', value: '+0.3', isPositive: true } },
      { id: '2', label: 'Top Performers', value: 24, icon: 'i-heroicons-star', color: 'success', trend: { direction: 'up', value: '+5', isPositive: true } },
      { id: '3', label: 'Strategic Goals', value: '68%', icon: 'i-heroicons-flag', color: 'info' },
      { id: '4', label: 'Engagement', value: '82%', icon: 'i-heroicons-heart', color: 'warning', trend: { direction: 'up', value: '+3%', isPositive: true } }
    ],
    performanceTrends: {
      labels: ['Q2 2025', 'Q3 2025', 'Q4 2025', 'Q1 2026'],
      datasets: [
        { label: 'Company Average', data: [3.7, 3.8, 4.0, 4.1], color: 'primary' },
        { label: 'Industry Benchmark', data: [3.8, 3.8, 3.9, 3.9], color: 'neutral' }
      ]
    },
    departmentPerformance: [
      { id: '1', name: 'Engineering', averageRating: 4.1, employeeCount: 45, goalsCompleted: 78, goalsTotal: 95 },
      { id: '2', name: 'Product', averageRating: 3.9, employeeCount: 22, goalsCompleted: 35, goalsTotal: 48 },
      { id: '3', name: 'Sales', averageRating: 3.7, employeeCount: 38, goalsCompleted: 52, goalsTotal: 72 },
      { id: '4', name: 'Marketing', averageRating: 3.8, employeeCount: 18, goalsCompleted: 28, goalsTotal: 36 },
      { id: '5', name: 'Customer Success', averageRating: 4.0, employeeCount: 25, goalsCompleted: 40, goalsTotal: 52 }
    ],
    strategicGoals: [
      { id: '1', title: 'Achieve $10M ARR', progress: 72, status: 'on_track', daysRemaining: 90 },
      { id: '2', title: 'Expand to 3 new markets', progress: 33, status: 'on_track', daysRemaining: 180 },
      { id: '3', title: 'Launch Enterprise Product', progress: 85, status: 'on_track', daysRemaining: 45 },
      { id: '4', title: 'Improve NPS to 50+', progress: 60, status: 'at_risk', daysRemaining: 120 }
    ],
    quickActions: [
      { id: '1', label: 'View Reports', icon: 'i-heroicons-document-chart-bar', action: 'view_reports', link: '/analytics/executive', variant: 'solid', color: 'primary' },
      { id: '2', label: 'Export Analytics', icon: 'i-heroicons-arrow-down-tray', action: 'export', link: '/analytics/export', variant: 'outline' }
    ]
  }
}

function generateAdminDashboard(): AdminDashboardData {
  return {
    kpis: [
      { id: '1', label: 'Active Users', value: 142, icon: 'i-heroicons-users', color: 'primary' },
      { id: '2', label: 'Uptime', value: '99.9%', icon: 'i-heroicons-server', color: 'success' },
      { id: '3', label: 'Storage Used', value: '45%', icon: 'i-heroicons-circle-stack', color: 'info' },
      { id: '4', label: 'Active Sessions', value: 38, icon: 'i-heroicons-computer-desktop', color: 'warning' }
    ],
    systemHealth: [
      { id: '1', name: 'API Server', status: 'healthy', value: '12ms avg', description: 'Response time normal' },
      { id: '2', name: 'Database', status: 'healthy', value: '99.99%', description: 'All replicas healthy' },
      { id: '3', name: 'Auth Service', status: 'healthy', value: 'Operational', description: 'No issues detected' },
      { id: '4', name: 'File Storage', status: 'warning', value: '78%', description: 'Consider cleanup' },
      { id: '5', name: 'Email Service', status: 'healthy', value: 'Operational', description: 'All emails delivered' },
      { id: '6', name: 'Background Jobs', status: 'healthy', value: '0 failed', description: '142 jobs processed today' }
    ],
    recentLogins: [
      { id: '1', userName: 'Sarah Chen', userEmail: 'sarah.chen@company.com', loginTime: '2026-01-28T09:45:00Z', device: 'Chrome / Windows' },
      { id: '2', userName: 'John Doe', userEmail: 'john.doe@company.com', loginTime: '2026-01-28T09:30:00Z', device: 'Safari / macOS' },
      { id: '3', userName: 'Emily Wilson', userEmail: 'emily.wilson@company.com', loginTime: '2026-01-28T09:15:00Z', device: 'Firefox / Linux' },
      { id: '4', userName: 'Mike Brown', userEmail: 'mike.brown@company.com', loginTime: '2026-01-28T09:00:00Z', device: 'Chrome / Windows' },
      { id: '5', userName: 'Lisa Wang', userEmail: 'lisa.wang@company.com', loginTime: '2026-01-28T08:45:00Z', device: 'Edge / Windows' }
    ],
    userActivity: {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      datasets: [{
        label: 'Active Users',
        data: [132, 145, 138, 142, 128, 45, 38],
        color: 'primary'
      }]
    },
    quickActions: [
      { id: '1', label: 'Manage Users', icon: 'i-heroicons-user-plus', action: 'manage_users', link: '/settings/users', variant: 'solid', color: 'primary' },
      { id: '2', label: 'System Settings', icon: 'i-heroicons-cog-6-tooth', action: 'settings', link: '/settings', variant: 'outline' },
      { id: '3', label: 'View Audit Logs', icon: 'i-heroicons-document-magnifying-glass', action: 'audit_logs', link: '/settings/audit', variant: 'outline' }
    ]
  }
}

// Dashboard Service
export const dashboardService = {
  async getDashboard(role: UserRole): Promise<DashboardResponse<EmployeeDashboardData | ManagerDashboardData | HRDashboardData | CSuiteDashboardData | AdminDashboardData>> {
    // Simulate API delay
    await delay(500)

    let data
    switch (role) {
      case 'manager':
        data = generateManagerDashboard()
        break
      case 'hr':
        data = generateHRDashboard()
        break
      case 'csuite':
        data = generateCSuiteDashboard()
        break
      case 'admin':
        data = generateAdminDashboard()
        break
      case 'employee':
      default:
        data = generateEmployeeDashboard()
        break
    }

    return {
      success: true,
      data,
      meta: {
        timestamp: new Date().toISOString()
      }
    }
  }
}
