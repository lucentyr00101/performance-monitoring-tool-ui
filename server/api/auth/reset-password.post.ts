/**
 * Mock Reset Password Endpoint
 * POST /api/auth/reset-password
 * 
 * Remove when real API is ready
 */

import { buildResetPasswordResponse, errorResponse } from '../../mocks/responses'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { token, password, confirmPassword } = body

  // Validate required fields
  if (!token) {
    setResponseStatus(event, 400)
    return errorResponse('Reset token is required', 'VALIDATION_ERROR', 400)
  }

  if (!password) {
    setResponseStatus(event, 400)
    return errorResponse('New password is required', 'VALIDATION_ERROR', 400)
  }

  if (password !== confirmPassword) {
    setResponseStatus(event, 400)
    return errorResponse('Passwords do not match', 'VALIDATION_ERROR', 400)
  }

  // Validate password strength
  if (password.length < 8) {
    setResponseStatus(event, 400)
    return errorResponse('Password must be at least 8 characters', 'VALIDATION_ERROR', 400)
  }

  // In a real app, we would:
  // 1. Verify the reset token
  // 2. Check token expiration
  // 3. Update the user's password
  // 4. Invalidate the reset token
  // 5. Optionally invalidate all existing sessions

  // For mock, we just accept any token that starts with "mock_reset_token"
  if (!token.startsWith('mock_reset_token')) {
    setResponseStatus(event, 400)
    return errorResponse('Invalid or expired reset token', 'INVALID_TOKEN', 400)
  }

  console.log(`[MOCK] Password reset completed for token: ${token}`)

  return buildResetPasswordResponse()
})
