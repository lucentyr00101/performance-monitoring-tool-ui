// Auth middleware - protects routes that require authentication
import type { UserRole } from '~/types/auth'

export default defineNuxtRouteMiddleware(async (to) => {
  const auth = useAuth()

  // Check authentication
  const isAuthenticated = await auth.checkAuth()

  if (!isAuthenticated) {
    // Store intended destination for redirect after login
    const redirectTo = to.fullPath !== '/' ? to.fullPath : undefined
    return navigateTo({
      path: '/auth/login',
      query: redirectTo ? { redirect: redirectTo } : undefined
    })
  }

  // Check role requirements from route meta
  const requiredRoles = to.meta.roles as UserRole[] | undefined

  if (requiredRoles && requiredRoles.length > 0) {
    const hasRequiredRole = auth.hasRole(requiredRoles)
    if (!hasRequiredRole) {
      return navigateTo('/403')
    }
  }
})
