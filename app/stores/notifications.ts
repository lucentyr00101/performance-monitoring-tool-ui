// Notification Store - Pinia store for notifications state management
import { defineStore } from 'pinia'
import { notificationsService } from '~/services/notifications'
import type {
  NotificationListItem,
  NotificationFilters,
  NotificationListParams,
  NotificationCounts,
  NotificationState
} from '~/types/notification'

const DEFAULT_PER_PAGE = 20

export const useNotificationsStore = defineStore('notifications', {
  state: (): NotificationState => ({
    notifications: [],
    counts: {
      total: 0,
      unread: 0,
      byType: {} as NotificationCounts['byType']
    },
    filters: {},
    pagination: {
      page: 1,
      perPage: DEFAULT_PER_PAGE,
      totalItems: 0,
      totalPages: 0
    },
    isLoading: false,
    error: null
  }),

  getters: {
    unreadCount: (state): number => state.counts.unread,

    unreadNotifications: (state): NotificationListItem[] =>
      state.notifications.filter(n => n.status === 'unread'),

    hasNextPage: (state): boolean => state.pagination.page < state.pagination.totalPages,

    hasPreviousPage: (state): boolean => state.pagination.page > 1
  },

  actions: {
    async fetchNotifications(params?: Partial<NotificationListParams>): Promise<void> {
      this.isLoading = true
      this.error = null

      try {
        const listParams: NotificationListParams = {
          page: params?.page ?? this.pagination.page,
          perPage: params?.perPage ?? this.pagination.perPage,
          ...this.filters,
          ...params
        }

        const response = await notificationsService.listNotifications(listParams)

        this.notifications = response.data
        this.pagination = {
          page: response.meta.pagination.page,
          perPage: response.meta.pagination.per_page,
          totalItems: response.meta.pagination.total_items,
          totalPages: response.meta.pagination.total_pages
        }

        if (response.meta.counts) {
          this.counts = response.meta.counts
        }
      }
      catch (error) {
        const err = error as { error?: { message?: string } }
        this.error = err?.error?.message || 'Failed to fetch notifications'
      }
      finally {
        this.isLoading = false
      }
    },

    async fetchCounts(): Promise<void> {
      try {
        const response = await notificationsService.getCounts()
        this.counts = response.data
      }
      catch {
        // Silently fail — counts are non-critical
      }
    },

    async markAsRead(id: string): Promise<void> {
      try {
        await notificationsService.markAsRead(id)

        // Update local state
        const notification = this.notifications.find(n => n.id === id)
        if (notification) {
          notification.status = 'read'
          notification.readAt = new Date().toISOString()
        }

        if (this.counts.unread > 0) {
          this.counts.unread--
        }
      }
      catch (error) {
        const err = error as { error?: { message?: string } }
        this.error = err?.error?.message || 'Failed to mark notification as read'
      }
    },

    async markAllAsRead(): Promise<void> {
      try {
        await notificationsService.markAllAsRead()

        // Update local state
        for (const notification of this.notifications) {
          notification.status = 'read'
          notification.readAt = new Date().toISOString()
        }
        this.counts.unread = 0
      }
      catch (error) {
        const err = error as { error?: { message?: string } }
        this.error = err?.error?.message || 'Failed to mark all as read'
      }
    },

    setFilters(filters: NotificationFilters): void {
      this.filters = { ...filters }
      this.pagination.page = 1
    },

    clearFilters(): void {
      this.filters = {}
      this.pagination.page = 1
    },

    setPage(page: number): void {
      this.pagination.page = page
    },

    nextPage(): void {
      if (this.hasNextPage) {
        this.pagination.page++
      }
    },

    previousPage(): void {
      if (this.hasPreviousPage) {
        this.pagination.page--
      }
    }
  }
})
