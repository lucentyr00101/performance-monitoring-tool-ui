// Server-side logout proxy — clears httpOnly refresh token cookie
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const apiUrl = config.public.apiGatewayUrl || 'http://localhost:4000'

  // Forward logout to backend (best-effort)
  try {
    const authHeader = getHeader(event, 'authorization')
    await $fetch(`${apiUrl}/api/v1/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader ? { Authorization: authHeader } : {})
      }
    })
  }
  catch {
    // Ignore backend errors — clear cookie regardless
  }

  // Clear the httpOnly cookie
  deleteCookie(event, 'refresh_token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/'
  })

  return { success: true, data: { message: 'Logged out successfully' } }
})
