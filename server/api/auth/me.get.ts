/**
 * Mock Get Current User Endpoint
 * GET /api/auth/me
 * 
 * Remove when real API is ready
 */

import { findUserById, tokenStore } from '../../mocks/users'
import { buildMeResponse, errorResponse } from '../../mocks/responses'

export default defineEventHandler(async (event) => {
  const authHeader = getHeader(event, 'authorization')

  if (!authHeader?.startsWith('Bearer ')) {
    setResponseStatus(event, 401)
    return errorResponse('Authorization header required', 'UNAUTHORIZED', 401)
  }

  const token = authHeader.substring(7)
  const tokenData = tokenStore.get(token)

  if (!tokenData) {
    setResponseStatus(event, 401)
    return errorResponse('Invalid or expired token', 'INVALID_TOKEN', 401)
  }

  // Check if token is expired
  if (tokenData.expiresAt < Date.now()) {
    tokenStore.delete(token)
    setResponseStatus(event, 401)
    return errorResponse('Token has expired', 'TOKEN_EXPIRED', 401)
  }

  const user = findUserById(tokenData.userId)

  if (!user) {
    setResponseStatus(event, 404)
    return errorResponse('User not found', 'USER_NOT_FOUND', 404)
  }

  if (user.status !== 'active') {
    setResponseStatus(event, 403)
    return errorResponse('Account is not active', 'ACCOUNT_INACTIVE', 403)
  }

  return buildMeResponse(user)
})
