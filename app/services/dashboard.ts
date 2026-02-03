// Dashboard Service - API integration
import { api } from '~/utils/api'
import type { UserRole } from '~/types/auth'
import type {
  EmployeeDashboardData,
  ManagerDashboardData,
  HRDashboardData,
  CSuiteDashboardData,
  AdminDashboardData,
  DashboardResponse
} from '~/types/dashboard'

type DashboardData = EmployeeDashboardData | ManagerDashboardData | HRDashboardData | CSuiteDashboardData | AdminDashboardData

/**
 * Dashboard Service - Communicates with the API Gateway
 */
export const dashboardService = {
  /**
   * Get role-specific dashboard data
   * GET /api/v1/analytics/dashboard
   */
  async getDashboard(role: UserRole): Promise<DashboardResponse<DashboardData>> {
    const response = await api.get<DashboardData>(`/analytics/dashboard?role=${role}`)
    return response as DashboardResponse<DashboardData>
  }
}
