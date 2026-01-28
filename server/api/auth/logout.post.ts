/**
 * Mock Logout Endpoint
 * POST /api/auth/logout
 * 
 * Remove when real API is ready
 */

import { tokenStore } from '../../mocks/users'
import { buildLogoutResponse } from '../../mocks/responses'

export default defineEventHandler(async (event) => {
  const authHeader = getHeader(event, 'authorization')
  
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.substring(7)
    // Remove the token from store
    tokenStore.delete(token)
  }

  // Also try to get refresh token from body and invalidate it
  try {
    const body = await readBody(event)
    if (body?.refreshToken) {
      tokenStore.delete(body.refreshToken)
    }
  }
  catch {
    // Body might be empty, that's fine
  }

  return buildLogoutResponse()
})
