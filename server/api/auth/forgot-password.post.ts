/**
 * Mock Forgot Password Endpoint
 * POST /api/auth/forgot-password
 * 
 * Remove when real API is ready
 */

import { findUserByEmail } from '../../mocks/users'
import { buildForgotPasswordResponse, errorResponse } from '../../mocks/responses'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { email } = body

  if (!email) {
    setResponseStatus(event, 400)
    return errorResponse('Email is required', 'VALIDATION_ERROR', 400)
  }

  // In a real app, we would:
  // 1. Generate a reset token
  // 2. Store it with expiration
  // 3. Send an email with reset link
  
  // For mock, we just check if user exists (but always return success for security)
  const user = findUserByEmail(email)
  
  if (user) {
    // Log for development (would be email in production)
    console.log(`[MOCK] Password reset requested for: ${email}`)
    console.log(`[MOCK] Reset link would be: /auth/reset-password?token=mock_reset_token_${Date.now()}`)
  }

  // Always return success to prevent email enumeration
  return buildForgotPasswordResponse(email)
})
