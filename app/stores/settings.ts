// Settings Store - Pinia store for settings state management
import { defineStore } from 'pinia'
import { settingsService } from '~/services/settings'
import type {
  SettingsState,
  GeneralSettingsUpdateRequest,
  NotificationPreferencesUpdateRequest,
  ReviewDefaultsUpdateRequest
} from '~/types/settings'

export const useSettingsStore = defineStore('settings', {
  state: (): SettingsState => ({
    settings: null,
    isLoading: false,
    error: null
  }),

  actions: {
    async fetchSettings(): Promise<void> {
      this.isLoading = true
      this.error = null
      try {
        const response = await settingsService.getSettings()
        this.settings = response.data
      }
      catch (error) {
        const err = error as { error?: { message?: string } }
        this.error = err?.error?.message || 'Failed to load settings'
        throw error
      }
      finally {
        this.isLoading = false
      }
    },

    async updateGeneralSettings(data: GeneralSettingsUpdateRequest): Promise<void> {
      const { updated, failed } = useNotification()
      this.isLoading = true
      try {
        const response = await settingsService.updateGeneralSettings(data)
        this.settings = response.data
        updated('Settings')
      }
      catch (error) {
        const err = error as { error?: { message?: string } }
        this.error = err?.error?.message || 'Failed to update general settings'
        failed('update', 'settings', 'server')
        throw error
      }
      finally {
        this.isLoading = false
      }
    },

    async updateNotificationPreferences(data: NotificationPreferencesUpdateRequest): Promise<void> {
      const { updated, failed } = useNotification()
      this.isLoading = true
      try {
        const response = await settingsService.updateNotificationPreferences(data)
        this.settings = response.data
        updated('Settings')
      }
      catch (error) {
        const err = error as { error?: { message?: string } }
        this.error = err?.error?.message || 'Failed to update notification preferences'
        failed('update', 'settings', 'server')
        throw error
      }
      finally {
        this.isLoading = false
      }
    },

    async updateReviewDefaults(data: ReviewDefaultsUpdateRequest): Promise<void> {
      const { updated, failed } = useNotification()
      this.isLoading = true
      try {
        const response = await settingsService.updateReviewDefaults(data)
        this.settings = response.data
        updated('Settings')
      }
      catch (error) {
        const err = error as { error?: { message?: string } }
        this.error = err?.error?.message || 'Failed to update review defaults'
        failed('update', 'settings', 'server')
        throw error
      }
      finally {
        this.isLoading = false
      }
    }
  }
})
