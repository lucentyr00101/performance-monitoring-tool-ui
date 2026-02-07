// Server-side login proxy — sets refresh token as httpOnly cookie
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const body = await readBody(event)
  const apiUrl = config.public.apiGatewayUrl || 'http://localhost:4000'

  const response = await $fetch<Record<string, unknown>>(`${apiUrl}/api/v1/auth/login`, {
    method: 'POST',
    body,
    headers: { 'Content-Type': 'application/json' }
  })

  // Extract refresh token and set as httpOnly cookie
  const data = response.data as Record<string, unknown> | undefined
  const refreshToken = data?.refresh_token as string | undefined

  if (refreshToken) {
    setCookie(event, 'refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/'
    })

    // Remove refresh_token from response body sent to client
    if (data) {
      delete data.refresh_token
    }
  }

  return response
})
