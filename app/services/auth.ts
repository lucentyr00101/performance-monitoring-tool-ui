// Auth Service - API calls for authentication
import { api } from '~/utils/api'
import type {
  LoginRequest,
  LoginResponse,
  RefreshRequest,
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
   * POST /api/v1/auth/login
   */
  async login(credentials: LoginRequest) {
    return api.post<LoginResponse>('/auth/login', credentials, { skipAuth: true })
  },

  /**
   * Logout current user
   * POST /api/v1/auth/logout
   */
  async logout() {
    return api.post<MessageResponse>('/auth/logout')
  },

  /**
   * Refresh access token
   * POST /api/v1/auth/refresh
   */
  async refresh(refreshToken: string) {
    const body = { refresh_token: refreshToken }
    return api.post<RefreshResponse>('/auth/refresh', body, { skipAuth: true })
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
