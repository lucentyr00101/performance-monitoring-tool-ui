// Authentication Types
// Based on API spec: docs/api/auth.md

export type UserRole = 'admin' | 'hr' | 'manager' | 'employee' | 'csuite'
export type UserStatus = 'active' | 'inactive' | 'suspended'

export interface Department {
  id: string
  name: string
}

export interface ManagerInfo {
  id: string
  first_name: string
  last_name: string
}

export interface Employee {
  id: string
  employee_code: string
  first_name: string
  last_name: string
  email: string
  phone?: string
  job_title: string
  department: Department
  manager?: ManagerInfo
  hire_date: string
  employment_type: string
  avatar_url?: string
}

export interface User {
  id: string
  email: string
  role: UserRole
  status: UserStatus
  last_login_at?: string
  employee?: Employee
}

export interface LoginRequest {
  email: string
  password: string
}

export interface TokensResponse {
  accessToken: string
  refreshToken: string
  tokenType: 'Bearer'
  expiresIn: number
}

export interface LoginResponse {
  user: User
  tokens: TokensResponse
}

export interface RefreshRequest {
  refreshToken: string
}

export interface RefreshResponse {
  accessToken: string
  refreshToken: string
  tokenType: 'Bearer'
  expiresIn: number
}

export interface ForgotPasswordRequest {
  email: string
}

export interface ResetPasswordRequest {
  token: string
  password: string
  password_confirmation: string
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  meta: {
    timestamp: string
    pagination?: {
      page: number
      per_page: number
      total_items: number
      total_pages: number
    }
  }
}

export interface ApiError {
  success: false
  error: {
    code: 'VALIDATION_ERROR' | 'AUTHENTICATION_ERROR' | 'AUTHORIZATION_ERROR' | 'NOT_FOUND' | 'CONFLICT' | 'RATE_LIMIT_EXCEEDED' | 'INTERNAL_ERROR' | 'NETWORK_ERROR' | 'INVALID_CREDENTIALS' | 'INVALID_TOKEN' | 'TOKEN_EXPIRED' | 'USER_NOT_FOUND' | 'ACCOUNT_INACTIVE'
    message: string
    details?: Array<{
      field: string
      message: string
    }> | Record<string, unknown>
  }
  meta: {
    timestamp: string
  }
}

export interface AuthState {
  user: User | null
  accessToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  sessionExpiresAt: number | null
  loginAttempts: number
  isLockedOut: boolean
  lockoutEndsAt: number | null
}

export interface MessageResponse {
  message: string
}

// Permission definitions based on PRD role matrix
export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  admin: [
    'users:manage',
    'settings:manage',
    'employees:read',
    'employees:write',
    'employees:delete',
    'reviews:create',
    'reviews:write',
    'reviews:read',
    'goals:read',
    'goals:write',
    'goals:approve',
    'analytics:read',
    'analytics:export'
  ],
  hr: [
    'employees:read',
    'employees:write',
    'reviews:create',
    'reviews:write',
    'reviews:read',
    'goals:read',
    'goals:write',
    'goals:approve',
    'analytics:read',
    'analytics:export'
  ],
  manager: [
    'team:read',
    'team:write',
    'reviews:write',
    'reviews:read',
    'goals:read',
    'goals:write',
    'goals:approve',
    'analytics:team'
  ],
  employee: [
    'profile:read',
    'profile:write',
    'goals:read',
    'goals:write:own',
    'reviews:read:own'
  ],
  csuite: [
    'employees:read',
    'analytics:read',
    'analytics:export'
  ]
}
