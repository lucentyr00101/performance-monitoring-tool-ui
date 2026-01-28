// Dashboard Service - API integration
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

// Dashboard Service
export const dashboardService = {
  async getDashboard(role: UserRole): Promise<DashboardResponse<DashboardData>> {
    const response = await $fetch<DashboardResponse<DashboardData>>(`/api/dashboard/${role}`)
    return response
  }
}
