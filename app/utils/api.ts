// API utility with auth interceptor for external API Gateway
import type { ApiResponse, ApiError } from '~/types/auth'
import type { NitroFetchOptions } from 'nitropack'

/**
 * API Client for communicating with the API Gateway
 * 
 * Architecture:
 * Frontend (Nuxt) -> API Gateway (localhost:4000) -> Microservices
 *                                                 -> Auth Service
 *                                                 -> Employee Service
 *                                                 -> Goals Service
 *                                                 -> Reviews Service
 */

interface FetchOptions {
  skipAuth?: boolean
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: unknown
}

class ApiClient {
  private getBaseUrl(): string {
    const config = useRuntimeConfig()
    const gatewayUrl = config.public.apiGatewayUrl as string
    
    if (!gatewayUrl) {
      throw new Error('API Gateway URL not configured. Set NUXT_PUBLIC_API_GATEWAY_URL environment variable.')
    }
    
    return `${gatewayUrl}/api/v1`
  }

  private getAccessToken(): string | null {
    if (import.meta.server) return null
    const authStore = useAuthStore()
    return authStore.accessToken
  }

  async fetch<T>(endpoint: string, options: FetchOptions = {}): Promise<ApiResponse<T>> {
    const { skipAuth = false, method = 'GET', body, ...restOptions } = options
    const baseUrl = this.getBaseUrl()

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

      // Handle 401 Unauthorized - clear auth and redirect
      if (fetchError?.response?.status === 401 && !skipAuth) {
        // Clear auth state and redirect to login
        if (import.meta.client) {
          const authStore = useAuthStore()
          authStore.clearAuth()
          navigateTo('/auth/login?reason=session_expired')
        }
        
        // Throw unauthorized error
        throw {
          success: false,
          error: {
            code: 'TOKEN_EXPIRED',
            message: 'Your session has expired. Please log in again.'
          },
          meta: {
            timestamp: new Date().toISOString()
          }
        } as ApiError
      }

      // Handle 400 Bad Request (Validation Errors)
      if (fetchError?.response?.status === 400) {
        throw {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: fetchError?.data?.error?.message || 'Invalid data. Please check your input.'
          },
          meta: {
            timestamp: new Date().toISOString()
          }
        } as ApiError
      }

      // Handle 403 Forbidden
      if (fetchError?.response?.status === 403) {
        throw {
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'You do not have permission to perform this action.'
          },
          meta: {
            timestamp: new Date().toISOString()
          }
        } as ApiError
      }

      // Handle 404 Not Found
      if (fetchError?.response?.status === 404) {
        throw {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: fetchError?.data?.error?.message || 'The requested resource was not found.'
          },
          meta: {
            timestamp: new Date().toISOString()
          }
        } as ApiError
      }

      // Handle 500+ Server Errors
      if (fetchError?.response?.status && fetchError.response.status >= 500) {
        throw {
          success: false,
          error: {
            code: 'SERVER_ERROR',
            message: 'Server error. Please try again later.'
          },
          meta: {
            timestamp: new Date().toISOString()
          }
        } as ApiError
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
          message: fetchError?.message || 'An unexpected error occurred. Please check your connection.'
        },
        meta: {
          timestamp: new Date().toISOString()
        }
      } as ApiError
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
