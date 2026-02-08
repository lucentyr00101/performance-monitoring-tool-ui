// Auth Store - Pinia store for authentication state
import { defineStore } from 'pinia'
import { authService } from '~/services/auth'
import type { AuthState, User, LoginRequest, ApiError, UserRole } from '~/types/auth'

const _ACCESS_TOKEN_EXPIRY = 60 * 60 * 1000 // 1 hour in ms
const SESSION_WARNING_TIME = 5 * 60 * 1000 // 5 minutes before expiry
const LOCKOUT_DURATION = 15 * 60 * 1000 // 15 minutes
const MAX_LOGIN_ATTEMPTS = 5

// Session timer reference for cleanup
let sessionTimerInterval: ReturnType<typeof setInterval> | null = null

// Clean up timer on HMR to prevent leaks
if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    if (sessionTimerInterval) {
      clearInterval(sessionTimerInterval)
      sessionTimerInterval = null
    }
  })
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    accessToken: null,
    isAuthenticated: false,
    isLoading: false,
    sessionExpiresAt: null,
    loginAttempts: 0,
    isLockedOut: false,
    lockoutEndsAt: null
  }),

  getters: {
    currentUser: (state): User | null => state.user,

    userRole: (state): UserRole | null => state.user?.role || null,

    userFullName: (state): string => {
      const emp = state.user?.employee as { firstName?: string; lastName?: string; first_name?: string; last_name?: string; fullName?: string } | undefined
      if (!emp) return state.user?.email || ''
      // Support both camelCase (mock) and snake_case (production)
      return emp.fullName || `${emp.firstName || emp.first_name || ''} ${emp.lastName || emp.last_name || ''}`.trim()
    },

    sessionTimeRemaining: (state): number => {
      if (!state.sessionExpiresAt) return 0
      return Math.max(0, state.sessionExpiresAt - Date.now())
    },

    showSessionWarning(): boolean {
      const remaining = this.sessionTimeRemaining
      return remaining > 0 && remaining <= SESSION_WARNING_TIME
    },

    lockoutTimeRemaining: (state): number => {
      if (!state.lockoutEndsAt) return 0
      return Math.max(0, state.lockoutEndsAt - Date.now())
    }
  },

  actions: {
    async login(credentials: LoginRequest): Promise<void> {
      const { success, error: notifyError } = useNotification()
      // Check lockout
      if (this.isLockedOut && this.lockoutEndsAt && Date.now() < this.lockoutEndsAt) {
        const minutesLeft = Math.ceil(this.lockoutTimeRemaining / 60000)
        throw {
          success: false,
          error: {
            code: 'AUTHORIZATION_ERROR',
            message: `Account locked. Try again in ${minutesLeft} minutes.`
          }
        } as ApiError
      }

      // Reset lockout if expired
      if (this.isLockedOut && this.lockoutEndsAt && Date.now() >= this.lockoutEndsAt) {
        this.isLockedOut = false
        this.lockoutEndsAt = null
        this.loginAttempts = 0
      }

      this.isLoading = true

      try {
        const response = await authService.login(credentials)
        const data = response.data

        // Store access token (refresh token is now in httpOnly cookie, not exposed to client)
        this.accessToken = data.access_token
        this.user = data.user
        this.isAuthenticated = true
        this.sessionExpiresAt = Date.now() + (data.expires_in * 1000)
        this.loginAttempts = 0

        // Start session timer
        this.startSessionTimer()
        success('Logged in successfully')
      }
      catch (error) {
        this.loginAttempts++

        // Check for lockout
        if (this.loginAttempts >= MAX_LOGIN_ATTEMPTS) {
          this.isLockedOut = true
          this.lockoutEndsAt = Date.now() + LOCKOUT_DURATION
          notifyError('Account locked due to multiple failed attempts', 'validation')
        } else {
          notifyError('Login failed. Please check your credentials.', 'validation')
        }

        throw error
      }
      finally {
        this.isLoading = false
      }
    },

    async logout(): Promise<void> {
      const { success } = useNotification()
      try {
        await authService.logout()
        success('Logged out successfully')
      }
      catch {
        // Ignore logout errors, clear state anyway
      }
      finally {
        this.clearAuth()
      }
    },

    async refreshToken(): Promise<void> {
      const response = await authService.refresh()
      const data = response.data

      // Store access token (refresh token handled server-side in httpOnly cookie)
      this.accessToken = data.access_token
      this.sessionExpiresAt = Date.now() + (data.expires_in * 1000)

      // Restart session timer
      this.startSessionTimer()
    },

    async fetchCurrentUser(): Promise<void> {
      if (!this.accessToken) return

      this.isLoading = true
      try {
        const response = await authService.getCurrentUser()
        this.user = response.data
        this.isAuthenticated = true
      }
      catch {
        this.clearAuth()
      }
      finally {
        this.isLoading = false
      }
    },

    async checkAuth(): Promise<boolean> {
      // If we have a token and user in memory, we're authenticated
      if (this.accessToken && this.user) {
        return true
      }

      // Token restored from cookie but no user data yet — validate and fetch user
      if (this.accessToken) {
        try {
          await this.fetchCurrentUser()
          if (this.user) {
            this.isAuthenticated = true
            this.sessionExpiresAt = Date.now() + _ACCESS_TOKEN_EXPIRY
            this.startSessionTimer()
            return true
          }
        }
        catch {
          // Token from cookie is invalid/expired — clear and try refresh
          this.accessToken = null
        }
      }

      // Try to refresh using httpOnly cookie (server handles token)
      try {
        await this.refreshToken()
        await this.fetchCurrentUser()
        return true
      }
      catch {
        return false
      }
    },

    clearAuth(): void {
      // Stop session timer to prevent memory leaks
      this.stopSessionTimer()

      this.user = null
      this.accessToken = null
      this.isAuthenticated = false
      this.sessionExpiresAt = null
      this.loginAttempts = 0
      this.isLockedOut = false
      this.lockoutEndsAt = null

      // Clear access token cookie
      if (import.meta.client) {
        document.cookie = 'access_token=; path=/; max-age=0'
      }
    },

    startSessionTimer(): void {
      if (import.meta.server) return

      // Clear existing timer to prevent memory leaks
      if (sessionTimerInterval) {
        clearInterval(sessionTimerInterval)
        sessionTimerInterval = null
      }

      // Check for session expiry every minute
      sessionTimerInterval = setInterval(() => {
        if (!this.sessionExpiresAt) {
          if (sessionTimerInterval) {
            clearInterval(sessionTimerInterval)
            sessionTimerInterval = null
          }
          return
        }

        if (Date.now() >= this.sessionExpiresAt) {
          if (sessionTimerInterval) {
            clearInterval(sessionTimerInterval)
            sessionTimerInterval = null
          }
          this.clearAuth()
          navigateTo('/auth/login?reason=session_expired')
        }
      }, 60000)
    },

    stopSessionTimer(): void {
      if (sessionTimerInterval) {
        clearInterval(sessionTimerInterval)
        sessionTimerInterval = null
      }
    },

    async extendSession(): Promise<void> {
      await this.refreshToken()
    }
  }
})
