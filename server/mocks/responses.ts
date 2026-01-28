/**
 * Mock API response templates
 * These match the expected API response format from TSD
 * Remove this file when real API is ready
 */

import type { MockUser } from './users'

// Standard success response wrapper
export function successResponse<T>(data: T, meta?: Record<string, unknown>) {
  return {
    success: true,
    data,
    meta: {
      timestamp: new Date().toISOString(),
      ...meta
    }
  }
}

// Standard error response wrapper
export function errorResponse(
  message: string,
  code: string = 'ERROR',
  _statusCode: number = 400,
  details?: Record<string, unknown>
) {
  return {
    success: false,
    error: {
      code,
      message,
      details
    },
    meta: {
      timestamp: new Date().toISOString()
    }
  }
}

// Login response builder
export function buildLoginResponse(user: MockUser, accessToken: string, refreshToken: string) {
  return successResponse({
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
      employee: {
        id: user.employee.id,
        firstName: user.employee.firstName,
        lastName: user.employee.lastName,
        fullName: `${user.employee.firstName} ${user.employee.lastName}`,
        jobTitle: user.employee.jobTitle,
        department: user.employee.department,
        avatarUrl: user.employee.avatarUrl
      }
    },
    tokens: {
      accessToken,
      refreshToken,
      expiresIn: 3600, // 1 hour
      tokenType: 'Bearer'
    }
  })
}

// Current user response builder
export function buildMeResponse(user: MockUser) {
  return successResponse({
    id: user.id,
    email: user.email,
    role: user.role,
    status: user.status,
    employee: {
      id: user.employee.id,
      firstName: user.employee.firstName,
      lastName: user.employee.lastName,
      fullName: `${user.employee.firstName} ${user.employee.lastName}`,
      jobTitle: user.employee.jobTitle,
      department: user.employee.department,
      avatarUrl: user.employee.avatarUrl
    }
  })
}

// Token refresh response builder
export function buildRefreshResponse(accessToken: string, refreshToken: string) {
  return successResponse({
    accessToken,
    refreshToken,
    expiresIn: 3600,
    tokenType: 'Bearer'
  })
}

// Password reset request response
export function buildForgotPasswordResponse(email: string) {
  return successResponse({
    message: 'If this email exists, a password reset link has been sent.',
    email
  })
}

// Password reset success response
export function buildResetPasswordResponse() {
  return successResponse({
    message: 'Password has been reset successfully. Please login with your new password.'
  })
}

// Logout response
export function buildLogoutResponse() {
  return successResponse({
    message: 'Logged out successfully'
  })
}
