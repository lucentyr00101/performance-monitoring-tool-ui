// Server-side refresh proxy — reads refresh token from httpOnly cookie
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const apiUrl = config.public.apiGatewayUrl || 'http://localhost:4000'
  const refreshToken = getCookie(event, 'refresh_token')

  if (!refreshToken) {
    throw createError({
      statusCode: 401,
      message: 'No refresh token available'
    })
  }

  const response = await $fetch<Record<string, unknown>>(`${apiUrl}/api/v1/auth/refresh`, {
    method: 'POST',
    body: { refresh_token: refreshToken },
    headers: { 'Content-Type': 'application/json' }
  })

  const data = response.data as Record<string, unknown> | undefined
  const newAccessToken = data?.access_token as string | undefined
  const newRefreshToken = data?.refresh_token as string | undefined
  const expiresIn = (data?.expires_in as number) || 3600

  // Update access token cookie
  if (newAccessToken) {
    setCookie(event, 'access_token', newAccessToken, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: expiresIn,
      path: '/'
    })
  }

  // Update httpOnly cookie with new refresh token
  if (newRefreshToken) {
    setCookie(event, 'refresh_token', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60,
      path: '/'
    })

    if (data) {
      delete data.refresh_token
    }
  }

  return response
})
