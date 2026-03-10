// Settings Service - API calls for system-wide settings management
import { api } from '~/utils/api'
import type {
  AppSettings,
  SettingsResponse,
  GeneralSettingsUpdateRequest,
  NotificationPreferencesUpdateRequest,
  ReviewDefaultsUpdateRequest
} from '~/types/settings'

/**
 * Settings service — manages GET/PUT calls for system-wide org settings.
 * All endpoints require admin role.
 */
export const settingsService = {
  /**
   * Fetch all settings sections in one call.
   * GET /api/v1/settings
   */
  async getSettings(): Promise<SettingsResponse> {
    return api.get<AppSettings>('/settings')
  },

  /**
   * Update general organisation settings.
   * PUT /api/v1/settings/general
   */
  async updateGeneralSettings(data: GeneralSettingsUpdateRequest): Promise<SettingsResponse> {
    return api.put<AppSettings>('/settings/general', data)
  },

  /**
   * Update notification preference settings.
   * PUT /api/v1/settings/notifications
   */
  async updateNotificationPreferences(data: NotificationPreferencesUpdateRequest): Promise<SettingsResponse> {
    return api.put<AppSettings>('/settings/notifications', data)
  },

  /**
   * Update review defaults.
   * PUT /api/v1/settings/review-defaults
   */
  async updateReviewDefaults(data: ReviewDefaultsUpdateRequest): Promise<SettingsResponse> {
    return api.put<AppSettings>('/settings/review-defaults', data)
  }
}
