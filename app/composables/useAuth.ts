// useAuth composable - Exposes auth store with role/permission helpers
import { storeToRefs } from 'pinia'
import { useAuthStore } from '~/stores/auth'
import { ROLE_PERMISSIONS, type UserRole } from '~/types/auth'

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
    login: store.login.bind(store),
    logout: store.logout.bind(store),
    checkAuth: store.checkAuth.bind(store),
    extendSession: store.extendSession.bind(store),

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
