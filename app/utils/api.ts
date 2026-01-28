// API utility with auth interceptor for external microservices
import type { ApiResponse, ApiError } from '~/types/auth'
import type { NitroFetchOptions } from 'nitropack'

/**
 * API Client for communicating with external microservices
 * Falls back to internal Nuxt server mock endpoints when no external URL is configured
 * 
 * Architecture:
 * Frontend (Nuxt) -> API Gateway -> Auth Service -> MongoDB
 *                                -> Employee Service -> MongoDB
 *                                -> Goals Service -> MongoDB
 *                                -> Reviews Service -> MongoDB
 * 
 * Development Mode (no external URLs):
 * Frontend (Nuxt) -> Nuxt Server (/api/auth/*) -> Mock Data
 */

interface FetchOptions {
  skipAuth?: boolean
  service?: 'auth' | 'employees' | 'goals' | 'reviews' | 'analytics'
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: unknown
}

class ApiClient {
  private getBaseUrl(service: string = 'auth'): string {
    const config = useRuntimeConfig()

    // If API Gateway is configured, use it for all services
    const gatewayUrl = config.public.apiGatewayUrl as string | undefined
    if (gatewayUrl) {
      return `${gatewayUrl}/api/v1`
    }

    // Service-specific URLs for microservices architecture
    const serviceUrls: Record<string, string | undefined> = {
      auth: config.public.authServiceUrl as string | undefined,
      employees: config.public.employeeServiceUrl as string | undefined,
      goals: config.public.goalsServiceUrl as string | undefined,
      reviews: config.public.reviewsServiceUrl as string | undefined,
      analytics: config.public.analyticsServiceUrl as string | undefined
    }

    const serviceUrl = serviceUrls[service]
    
    // If service URL is configured, use external microservice
    if (serviceUrl) {
      return `${serviceUrl}/api/v1`
    }

    // Fall back to internal Nuxt server mock endpoints (development mode)
    return '/api'
  }

  private getAccessToken(): string | null {
    if (import.meta.server) return null
    const authStore = useAuthStore()
    return authStore.accessToken
  }

  async fetch<T>(endpoint: string, options: FetchOptions = {}): Promise<ApiResponse<T>> {
    const { skipAuth = false, service = 'auth', method = 'GET', body, ...restOptions } = options
    const baseUrl = this.getBaseUrl(service)

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }

    // Add auth header if token exists and not skipping auth
    if (!skipAuth) {
      const token = this.getAccessToken()
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
    }

    try {
      const fetchOptions: NitroFetchOptions<string> = {
        method,
        headers,
        ...restOptions
      }

      if (body) {
        fetchOptions.body = body
      }

      const response = await $fetch<ApiResponse<T>>(`${baseUrl}${endpoint}`, fetchOptions)

      return response
    }
    catch (error: unknown) {
      // Handle FetchError from $fetch
      const fetchError = error as { response?: { status?: number }; data?: ApiError; message?: string }

      // Handle 401 Unauthorized - try to refresh token
      if (fetchError?.response?.status === 401 && !skipAuth) {
        const refreshed = await this.tryRefreshToken()
        if (refreshed) {
          // Retry the original request with new token
          return this.fetch<T>(endpoint, options)
        }
        
        // Refresh failed, redirect to login
        if (import.meta.client) {
          const authStore = useAuthStore()
          authStore.clearAuth()
          navigateTo('/auth/login')
        }
      }

      // Handle other errors
      if (fetchError?.data) {
        throw fetchError.data as ApiError
      }

      // Handle network errors or unexpected errors
      throw {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: fetchError?.message || 'An unexpected error occurred'
        },
        meta: {
          timestamp: new Date().toISOString()
        }
      } as ApiError
    }
  }

  private async tryRefreshToken(): Promise<boolean> {
    try {
      const authStore = useAuthStore()
      await authStore.refreshToken()
      return true
    }
    catch {
      return false
    }
  }

  async get<T>(endpoint: string, options: Omit<FetchOptions, 'method' | 'body'> = {}): Promise<ApiResponse<T>> {
    return this.fetch<T>(endpoint, { ...options, method: 'GET' })
  }

  async post<T>(endpoint: string, body?: unknown, options: Omit<FetchOptions, 'method' | 'body'> = {}): Promise<ApiResponse<T>> {
    return this.fetch<T>(endpoint, {
      ...options,
      method: 'POST',
      body
    })
  }

  async put<T>(endpoint: string, body?: unknown, options: Omit<FetchOptions, 'method' | 'body'> = {}): Promise<ApiResponse<T>> {
    return this.fetch<T>(endpoint, {
      ...options,
      method: 'PUT',
      body
    })
  }

  async patch<T>(endpoint: string, body?: unknown, options: Omit<FetchOptions, 'method' | 'body'> = {}): Promise<ApiResponse<T>> {
    return this.fetch<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body
    })
  }

  async delete<T>(endpoint: string, options: Omit<FetchOptions, 'method' | 'body'> = {}): Promise<ApiResponse<T>> {
    return this.fetch<T>(endpoint, { ...options, method: 'DELETE' })
  }
}

export const api = new ApiClient()
