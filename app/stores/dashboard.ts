// Dashboard Store - Pinia store for dashboard state management
import { defineStore } from 'pinia'
import type { UserRole } from '~/types/auth'
import type {
  DashboardData,
  EmployeeDashboardData,
  ManagerDashboardData,
  HRDashboardData,
  CSuiteDashboardData,
  AdminDashboardData
} from '~/types/dashboard'
import { dashboardService } from '~/services/dashboard'

const REFRESH_INTERVAL = 5 * 60 * 1000 // 5 minutes

interface DashboardState {
  data: DashboardData | null
  isLoading: boolean
  error: string | null
  lastRefreshed: Date | null
  userRole: UserRole | null
}

export const useDashboardStore = defineStore('dashboard', {
  state: (): DashboardState => ({
    data: null,
    isLoading: false,
    error: null,
    lastRefreshed: null,
    userRole: null
  }),

  getters: {
    // Type-safe getters for each dashboard type
    employeeData: (state): EmployeeDashboardData | null => {
      if (state.userRole === 'employee' && state.data) {
        return state.data as EmployeeDashboardData
      }
      return null
    },

    managerData: (state): ManagerDashboardData | null => {
      if (state.userRole === 'manager' && state.data) {
        return state.data as ManagerDashboardData
      }
      return null
    },

    hrData: (state): HRDashboardData | null => {
      if (state.userRole === 'hr' && state.data) {
        return state.data as HRDashboardData
      }
      return null
    },

    csuiteData: (state): CSuiteDashboardData | null => {
      if (state.userRole === 'csuite' && state.data) {
        return state.data as CSuiteDashboardData
      }
      return null
    },

    adminData: (state): AdminDashboardData | null => {
      if (state.userRole === 'admin' && state.data) {
        return state.data as AdminDashboardData
      }
      return null
    },

    // Check if data needs refresh
    needsRefresh: (state): boolean => {
      if (!state.lastRefreshed) return true
      return Date.now() - state.lastRefreshed.getTime() > REFRESH_INTERVAL
    },

    // Time since last refresh in human readable format
    lastRefreshedText: (state): string => {
      if (!state.lastRefreshed) return 'Never'
      const seconds = Math.floor((Date.now() - state.lastRefreshed.getTime()) / 1000)
      if (seconds < 60) return 'Just now'
      const minutes = Math.floor(seconds / 60)
      if (minutes < 60) return `${minutes}m ago`
      const hours = Math.floor(minutes / 60)
      return `${hours}h ago`
    }
  },

  actions: {
    async fetchDashboard(role: UserRole): Promise<void> {
      this.isLoading = true
      this.error = null
      this.userRole = role

      try {
        const response = await dashboardService.getDashboard(role)
        this.data = response.data
        this.lastRefreshed = new Date()
      }
      catch (err) {
        this.error = err instanceof Error ? err.message : 'Failed to load dashboard'
        console.error('Dashboard fetch error:', err)
      }
      finally {
        this.isLoading = false
      }
    },

    async refresh(): Promise<void> {
      if (this.userRole) {
        await this.fetchDashboard(this.userRole)
      }
    },

    clearDashboard(): void {
      this.data = null
      this.error = null
      this.lastRefreshed = null
      this.userRole = null
    }
  }
})
