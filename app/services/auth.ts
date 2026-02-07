// Auth Service - API calls for authentication
import { api } from '~/utils/api'
import type {
  LoginRequest,
  LoginResponse,
  RefreshResponse,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  MessageResponse,
  User
} from '~/types/auth'

/**
 * Auth Service - API calls for authentication
 */
export const authService = {
  /**
   * Login with email and password
   * Proxied through server route for httpOnly cookie handling
   */
  async login(credentials: LoginRequest) {
    return $fetch<{ data: LoginResponse }>('/api/auth/login', {
      method: 'POST',
      body: credentials
    })
  },

  /**
   * Logout current user
   * Proxied through server route to clear httpOnly cookie
   */
  async logout() {
    const authStore = useAuthStore()
    return $fetch<{ data: MessageResponse }>('/api/auth/logout', {
      method: 'POST',
      headers: authStore.accessToken
        ? { Authorization: `Bearer ${authStore.accessToken}` }
        : {}
    })
  },

  /**
   * Refresh access token
   * Proxied through server route — refresh token is in httpOnly cookie
   */
  async refresh() {
    return $fetch<{ data: RefreshResponse }>('/api/auth/refresh', {
      method: 'POST'
    })
  },

  /**
   * Request password reset email
   * POST /api/v1/auth/forgot-password
   */
  async forgotPassword(email: string) {
    const body: ForgotPasswordRequest = { email }
    return api.post<MessageResponse>('/auth/forgot-password', body, { skipAuth: true })
  },

  /**
   * Reset password with token
   * POST /api/v1/auth/reset-password
   */
  async resetPassword(data: ResetPasswordRequest) {
    return api.post<MessageResponse>('/auth/reset-password', data, { skipAuth: true })
  },

  /**
   * Get current authenticated user
   * GET /api/v1/auth/me
   */
  async getCurrentUser() {
    return api.get<User>('/auth/me')
  }
}
