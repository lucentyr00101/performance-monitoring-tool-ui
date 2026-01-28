/**
 * Mock Login Endpoint
 * POST /api/auth/login
 * 
 * Remove when real API is ready
 */

import { findUserByEmail, generateMockToken, tokenStore } from '../../mocks/users'
import { buildLoginResponse, errorResponse } from '../../mocks/responses'

// IP-based rate limiting store
const ipAttempts: Map<string, { count: number; resetAt: number }> = new Map()
const IP_RATE_LIMIT = 5 // Max attempts per minute
const IP_RATE_WINDOW = 60 * 1000 // 1 minute

function getClientIP(event: Parameters<typeof defineEventHandler>[0] extends (e: infer E) => unknown ? E : never): string {
  // Try to get real IP from various headers
  const xForwardedFor = getHeader(event, 'x-forwarded-for')
  if (xForwardedFor) {
    const firstIp = xForwardedFor.split(',')[0]
    if (firstIp) return firstIp.trim()
  }
  const xRealIP = getHeader(event, 'x-real-ip')
  if (xRealIP) {
    return xRealIP
  }
  // Fallback to remote address or mock IP
  return 'mock-ip'
}

function checkIPRateLimit(ip: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now()
  const record = ipAttempts.get(ip)
  
  // Clean up expired records
  if (record && now > record.resetAt) {
    ipAttempts.delete(ip)
  }
  
  const current = ipAttempts.get(ip)
  
  if (!current) {
    // First attempt from this IP
    ipAttempts.set(ip, { count: 1, resetAt: now + IP_RATE_WINDOW })
    return { allowed: true }
  }
  
  if (current.count >= IP_RATE_LIMIT) {
    // Rate limited
    const retryAfter = Math.ceil((current.resetAt - now) / 1000)
    return { allowed: false, retryAfter }
  }
  
  // Increment counter
  current.count++
  return { allowed: true }
}

export default defineEventHandler(async (event) => {
  // Check IP-based rate limit
  const clientIP = getClientIP(event)
  const rateCheck = checkIPRateLimit(clientIP)
  
  if (!rateCheck.allowed) {
    setResponseStatus(event, 429)
    return errorResponse(
      `Too many login attempts. Please try again in ${rateCheck.retryAfter} seconds.`,
      'RATE_LIMITED',
      429
    )
  }

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
