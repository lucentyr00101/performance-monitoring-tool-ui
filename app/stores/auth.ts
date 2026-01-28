// Auth Store - Pinia store for authentication state
import { defineStore } from 'pinia'
import { authService } from '~/services/auth'
import type { AuthState, User, LoginRequest, ApiError, UserRole } from '~/types/auth'

// Type for cookie ref (compatible with useCookie return type)
type CookieRef = { value: string | null | undefined }

const _ACCESS_TOKEN_EXPIRY = 60 * 60 * 1000 // 1 hour in ms
const SESSION_WARNING_TIME = 5 * 60 * 1000 // 5 minutes before expiry
const LOCKOUT_DURATION = 15 * 60 * 1000 // 15 minutes
const MAX_LOGIN_ATTEMPTS = 5

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
    async login(credentials: LoginRequest, refreshTokenCookie?: CookieRef): Promise<void> {
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
        const { user, tokens } = response.data

        // Store tokens
        this.accessToken = tokens.accessToken
        this.user = user
        this.isAuthenticated = true
        this.sessionExpiresAt = Date.now() + (tokens.expiresIn * 1000)
        this.loginAttempts = 0

        // Store refresh token in cookie if provided
        if (refreshTokenCookie) {
          refreshTokenCookie.value = tokens.refreshToken
        }

        // Start session timer
        this.startSessionTimer()
      }
      catch (error) {
        this.loginAttempts++

        // Check for lockout
        if (this.loginAttempts >= MAX_LOGIN_ATTEMPTS) {
          this.isLockedOut = true
          this.lockoutEndsAt = Date.now() + LOCKOUT_DURATION
        }

        throw error
      }
      finally {
        this.isLoading = false
      }
    },

    async logout(): Promise<void> {
      try {
        await authService.logout()
      }
      catch {
        // Ignore logout errors, clear state anyway
      }
      finally {
        this.clearAuth()
      }
    },

    async refreshToken(refreshTokenValue: string, refreshTokenCookie?: CookieRef): Promise<void> {
      if (!refreshTokenValue) {
        throw new Error('No refresh token available')
      }

      const response = await authService.refresh(refreshTokenValue)
      const { accessToken, refreshToken, expiresIn } = response.data

      this.accessToken = accessToken
      this.sessionExpiresAt = Date.now() + (expiresIn * 1000)

      // Update refresh token cookie if provided
      if (refreshTokenCookie) {
        refreshTokenCookie.value = refreshToken
      }

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

    async checkAuth(refreshTokenValue?: string | null, refreshTokenCookie?: CookieRef): Promise<boolean> {
      // If we have a token in memory, we're authenticated
      if (this.accessToken && this.user) {
        return true
      }

      // Try to refresh using provided token
      if (refreshTokenValue) {
        try {
          await this.refreshToken(refreshTokenValue, refreshTokenCookie)
          await this.fetchCurrentUser()
          return true
        }
        catch {
          if (refreshTokenCookie) {
            refreshTokenCookie.value = null
          }
          return false
        }
      }

      return false
    },

    clearAuth(refreshTokenCookie?: CookieRef): void {
      this.user = null
      this.accessToken = null
      this.isAuthenticated = false
      this.sessionExpiresAt = null

      // Clear refresh token cookie if provided
      if (refreshTokenCookie) {
        refreshTokenCookie.value = null
      }
    },

    startSessionTimer(): void {
      if (import.meta.server) return

      // Check for session expiry every minute
      const checkInterval = setInterval(() => {
        if (!this.sessionExpiresAt) {
          clearInterval(checkInterval)
          return
        }

        if (Date.now() >= this.sessionExpiresAt) {
          clearInterval(checkInterval)
          this.clearAuth()
          navigateTo('/auth/login?reason=session_expired')
        }
      }, 60000)
    },

    async extendSession(refreshTokenValue: string, refreshTokenCookie?: CookieRef): Promise<void> {
      await this.refreshToken(refreshTokenValue, refreshTokenCookie)
    }
  }
})
