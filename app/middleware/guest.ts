// Guest middleware - redirects authenticated users away from auth pages
export default defineNuxtRouteMiddleware(async (to) => {
  const auth = useAuth()

  const isAuthenticated = await auth.checkAuth()

  if (isAuthenticated) {
    // Redirect to intended destination or dashboard
    const redirect = to.query.redirect as string
    return navigateTo(redirect || '/')
  }
})
