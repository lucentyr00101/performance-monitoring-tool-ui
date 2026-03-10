// Settings Types
// For system-wide configuration - General, Notification Preferences, and Review Defaults

// General organisation settings
export interface GeneralSettings {
  organizationName: string
  timezone: string
  dateFormat: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD'
  language: string
}

// Email notification preference per notification type
export interface NotificationPreferencesSettings {
  emailEnabled: boolean
  inAppEnabled: boolean
  /** Per-type email enable/disable */
  emailTypes: {
    adhocReviewTriggered: boolean
    selfReviewDue: boolean
    managerReviewDue: boolean
    reviewReminder: boolean
    reviewCompleted: boolean
    goalAssigned: boolean
    goalDueSoon: boolean
    cycleStarted: boolean
  }
  /** Digest frequency — 'immediate' sends per event */
  digestFrequency: 'immediate' | 'daily' | 'weekly'
  /** Quiet hours (24h format strings, e.g. '22:00') */
  quietHoursStart?: string
  quietHoursEnd?: string
}

// Review-related organisation defaults
export interface ReviewDefaultsSettings {
  /** ID of the default company-wide review form */
  defaultFormId?: string
  /** Reminder interval in days before due date */
  reviewReminderDays: number
  /** Minimum days an employee has to complete self-review after cycle start */
  selfReviewWindowDays: number
  /** Rating scale bounds */
  ratingScale: {
    min: number
    max: number
  }
}

// Aggregated settings from GET /api/v1/settings
export interface AppSettings {
  general: GeneralSettings
  notifications: NotificationPreferencesSettings
  reviewDefaults: ReviewDefaultsSettings
}

export interface SettingsState {
  settings: AppSettings | null
  isLoading: boolean
  error: string | null
}

// API Response
export interface SettingsResponse {
  success: boolean
  data: AppSettings
  meta: {
    timestamp: string
  }
}

export interface GeneralSettingsUpdateRequest {
  organizationName?: string
  timezone?: string
  dateFormat?: GeneralSettings['dateFormat']
  language?: string
}

export interface NotificationPreferencesUpdateRequest extends Partial<NotificationPreferencesSettings> { }

export interface ReviewDefaultsUpdateRequest extends Partial<ReviewDefaultsSettings> { }
