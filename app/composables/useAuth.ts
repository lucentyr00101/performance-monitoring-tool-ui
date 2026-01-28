// useAuth composable - Exposes auth store with role/permission helpers
import { storeToRefs } from 'pinia'
import { useAuthStore } from '~/stores/auth'
import { ROLE_PERMISSIONS, type UserRole, type LoginRequest } from '~/types/auth'

export function useAuth() {
  const store = useAuthStore()
  const {
    user,
    isAuthenticated,
    isLoading,
    userRole,
    userFullName,
    showSessionWarning,
    sessionTimeRemaining,
    isLockedOut,
    lockoutTimeRemaining
  } = storeToRefs(store)

  // Get refresh token cookie
  const refreshCookie = useCookie('refresh_token', {
    maxAge: 7 * 24 * 60 * 60, // 7 days
    secure: true,
    sameSite: 'strict'
  })

  /**
   * Login with credentials
   */
  async function login(credentials: LoginRequest) {
    return store.login(credentials, refreshCookie)
  }

  /**
   * Logout current user
   */
  async function logout() {
    await store.logout()
    refreshCookie.value = null
  }

  /**
   * Check authentication status
   */
  async function checkAuth() {
    return store.checkAuth(refreshCookie.value, refreshCookie)
  }

  /**
   * Extend current session
   */
  async function extendSession() {
    if (refreshCookie.value) {
      return store.extendSession(refreshCookie.value, refreshCookie)
    }
  }

  /**
   * Check if user has a specific role
   */
  function hasRole(role: UserRole | UserRole[]): boolean {
    if (!userRole.value) return false

    if (Array.isArray(role)) {
      return role.includes(userRole.value)
    }
    return userRole.value === role
  }

  /**
   * Check if user has a specific permission
   */
  function hasPermission(permission: string): boolean {
    if (!userRole.value) return false

    const permissions = ROLE_PERMISSIONS[userRole.value] || []
    return permissions.includes(permission)
  }

  /**
   * Check if user has any of the given permissions
   */
  function hasAnyPermission(permissions: string[]): boolean {
    return permissions.some(p => hasPermission(p))
  }

  /**
   * Check if user has all of the given permissions
   */
  function hasAllPermissions(permissions: string[]): boolean {
    return permissions.every(p => hasPermission(p))
  }

  /**
   * Check if user is at least a manager (admin, hr, manager, csuite)
   */
  function isManagerOrAbove(): boolean {
    return hasRole(['admin', 'hr', 'manager', 'csuite'])
  }

  /**
   * Check if user can access admin features
   */
  function isAdmin(): boolean {
    return hasRole('admin')
  }

  /**
   * Check if user can manage employees (admin or hr)
   */
  function canManageEmployees(): boolean {
    return hasRole(['admin', 'hr'])
  }

  return {
    // State
    user,
    isAuthenticated,
    isLoading,
    userRole,
    userFullName,
    showSessionWarning,
    sessionTimeRemaining,
    isLockedOut,
    lockoutTimeRemaining,

    // Actions
    login,
    logout,
    checkAuth,
    extendSession,

    // Role helpers
    hasRole,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    isManagerOrAbove,
    isAdmin,
    canManageEmployees
  }
}
