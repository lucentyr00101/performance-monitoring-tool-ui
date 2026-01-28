import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

// Mock the auth service
vi.mock('~/services/auth', () => ({
  authService: {
    login: vi.fn(),
    logout: vi.fn(),
    refresh: vi.fn(),
    getCurrentUser: vi.fn()
  }
}))

// Mock useCookie
vi.mock('#app', () => ({
  useCookie: vi.fn(() => ({ value: null })),
  navigateTo: vi.fn()
}))

describe('Auth Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('should have correct initial state', async () => {
    const { useAuthStore } = await import('~/stores/auth')
    const store = useAuthStore()

    expect(store.user).toBeNull()
    expect(store.accessToken).toBeNull()
    expect(store.isAuthenticated).toBe(false)
    expect(store.isLoading).toBe(false)
    expect(store.loginAttempts).toBe(0)
    expect(store.isLockedOut).toBe(false)
  })

  it('should increment login attempts on failed login', async () => {
    const { authService } = await import('~/services/auth')
    const { useAuthStore } = await import('~/stores/auth')

    vi.mocked(authService.login).mockRejectedValue({
      success: false,
      error: { code: 'AUTHENTICATION_ERROR', message: 'Invalid credentials' }
    })

    const store = useAuthStore()

    try {
      await store.login({ email: 'test@test.com', password: 'wrong' })
    }
    catch {
      // Expected
    }

    expect(store.loginAttempts).toBe(1)
  })

  it('should lock account after 5 failed attempts', async () => {
    const { authService } = await import('~/services/auth')
    const { useAuthStore } = await import('~/stores/auth')

    vi.mocked(authService.login).mockRejectedValue({
      success: false,
      error: { code: 'AUTHENTICATION_ERROR', message: 'Invalid credentials' }
    })

    const store = useAuthStore()

    for (let i = 0; i < 5; i++) {
      try {
        await store.login({ email: 'test@test.com', password: 'wrong' })
      }
      catch {
        // Expected
      }
    }

    expect(store.loginAttempts).toBe(5)
    expect(store.isLockedOut).toBe(true)
    expect(store.lockoutEndsAt).not.toBeNull()
  })

  it('should set user and tokens on successful login', async () => {
    const { authService } = await import('~/services/auth')
    const { useAuthStore } = await import('~/stores/auth')

    const mockResponse = {
      data: {
        access_token: 'mock-access-token',
        refresh_token: 'mock-refresh-token',
        expires_in: 3600,
        user: {
          id: '123',
          email: 'test@test.com',
          role: 'employee' as const,
          status: 'active' as const
        }
      }
    }

    vi.mocked(authService.login).mockResolvedValue(mockResponse as never)

    const store = useAuthStore()
    await store.login({ email: 'test@test.com', password: 'correct' })

    expect(store.accessToken).toBe('mock-access-token')
    expect(store.user).toEqual(mockResponse.data.user)
    expect(store.isAuthenticated).toBe(true)
    expect(store.loginAttempts).toBe(0)
  })

  it('should clear auth state on logout', async () => {
    const { authService } = await import('~/services/auth')
    const { useAuthStore } = await import('~/stores/auth')

    vi.mocked(authService.logout).mockResolvedValue({ data: { message: 'Logged out' } } as never)

    const store = useAuthStore()

    // Set some state
    store.accessToken = 'test-token'
    store.user = { id: '123', email: 'test@test.com', role: 'employee', status: 'active' }
    store.isAuthenticated = true

    await store.logout()

    expect(store.accessToken).toBeNull()
    expect(store.user).toBeNull()
    expect(store.isAuthenticated).toBe(false)
  })
})
