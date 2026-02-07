// Notification Service - API calls for notifications management
import { api } from '~/utils/api'
import type {
  Notification,
  NotificationListItem,
  NotificationListParams,
  NotificationCounts,
  NotificationListResponse,
  NotificationResponse,
  NotificationMarkReadResponse,
  NotificationMarkAllReadResponse
} from '~/types/notification'

interface PaginatedResponse<T> {
  success: boolean
  data: T[]
  meta: {
    timestamp: string
    pagination: {
      page: number
      per_page: number
      total_items: number
      total_pages: number
    }
    counts: NotificationCounts
  }
}

/**
 * Notification Service - Communicates with the API Gateway
 */
export const notificationsService = {
  /**
   * List notifications with filtering and pagination
   * GET /api/v1/notifications
   */
  async listNotifications(params: NotificationListParams = {}) {
    const queryParams = new URLSearchParams()

    if (params.page) queryParams.set('page', String(params.page))
    if (params.perPage) queryParams.set('per_page', String(params.perPage))
    if (params.type) queryParams.set('type', params.type)
    if (params.status) queryParams.set('status', params.status)
    if (params.priority) queryParams.set('priority', params.priority)

    const query = queryParams.toString()
    const endpoint = `/notifications${query ? `?${query}` : ''}`

    return api.get<PaginatedResponse<NotificationListItem>['data']>(endpoint) as Promise<PaginatedResponse<NotificationListItem>>
  },

  /**
   * Get a single notification by ID
   * GET /api/v1/notifications/:id
   */
  async getNotification(id: string) {
    return api.get<Notification>(`/notifications/${id}`) as Promise<NotificationResponse>
  },

  /**
   * Mark a notification as read
   * PUT /api/v1/notifications/:id/read
   */
  async markAsRead(id: string) {
    return api.put<NotificationMarkReadResponse['data']>(`/notifications/${id}/read`, {}) as Promise<NotificationMarkReadResponse>
  },

  /**
   * Mark all notifications as read
   * PUT /api/v1/notifications/read-all
   */
  async markAllAsRead() {
    return api.put<NotificationMarkAllReadResponse['data']>('/notifications/read-all', {}) as Promise<NotificationMarkAllReadResponse>
  },

  /**
   * Get notification counts
   * GET /api/v1/notifications/counts
   */
  async getCounts() {
    return api.get<NotificationCounts>('/notifications/counts') as Promise<{ success: boolean; data: NotificationCounts; meta: { timestamp: string } }>
  }
}
