/**
 * Mock Login Endpoint
 * POST /api/auth/login
 * 
 * Remove when real API is ready
 */

import { findUserByEmail, generateMockToken, tokenStore } from '../../mocks/users'
import { buildLoginResponse, errorResponse } from '../../mocks/responses'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { email, password } = body

  // Validate required fields
  if (!email || !password) {
    setResponseStatus(event, 400)
    return errorResponse('Email and password are required', 'VALIDATION_ERROR', 400)
  }

  // Find user
  const user = findUserByEmail(email)

  // Check credentials
  if (!user || user.password !== password) {
    setResponseStatus(event, 401)
    return errorResponse('Invalid email or password', 'INVALID_CREDENTIALS', 401)
  }

  // Check user status
  if (user.status !== 'active') {
    setResponseStatus(event, 403)
    return errorResponse('Account is not active. Please contact administrator.', 'ACCOUNT_INACTIVE', 403)
  }

  // Generate tokens
  const accessToken = generateMockToken('access')
  const refreshToken = generateMockToken('refresh')

  // Store refresh token (expires in 7 days)
  tokenStore.set(refreshToken, {
    userId: user.id,
    expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000
  })

  // Store access token (expires in 1 hour)
  tokenStore.set(accessToken, {
    userId: user.id,
    expiresAt: Date.now() + 60 * 60 * 1000
  })

  return buildLoginResponse(user, accessToken, refreshToken)
})
