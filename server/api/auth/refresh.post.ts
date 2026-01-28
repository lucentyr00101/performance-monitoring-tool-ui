/**
 * Mock Token Refresh Endpoint
 * POST /api/auth/refresh
 * 
 * Remove when real API is ready
 */

import { findUserById, generateMockToken, tokenStore } from '../../mocks/users'
import { buildRefreshResponse, errorResponse } from '../../mocks/responses'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { refreshToken } = body

  if (!refreshToken) {
    setResponseStatus(event, 400)
    return errorResponse('Refresh token is required', 'VALIDATION_ERROR', 400)
  }

  // Find token in store
  const tokenData = tokenStore.get(refreshToken)

  if (!tokenData) {
    setResponseStatus(event, 401)
    return errorResponse('Invalid refresh token', 'INVALID_TOKEN', 401)
  }

  // Check if token is expired
  if (tokenData.expiresAt < Date.now()) {
    tokenStore.delete(refreshToken)
    setResponseStatus(event, 401)
    return errorResponse('Refresh token has expired', 'TOKEN_EXPIRED', 401)
  }

  // Verify user still exists and is active
  const user = findUserById(tokenData.userId)
  if (!user || user.status !== 'active') {
    tokenStore.delete(refreshToken)
    setResponseStatus(event, 401)
    return errorResponse('User not found or inactive', 'USER_INVALID', 401)
  }

  // Invalidate old refresh token
  tokenStore.delete(refreshToken)

  // Generate new tokens
  const newAccessToken = generateMockToken('access')
  const newRefreshToken = generateMockToken('refresh')

  // Store new tokens
  tokenStore.set(newAccessToken, {
    userId: user.id,
    expiresAt: Date.now() + 60 * 60 * 1000 // 1 hour
  })

  tokenStore.set(newRefreshToken, {
    userId: user.id,
    expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 days
  })

  return buildRefreshResponse(newAccessToken, newRefreshToken)
})
