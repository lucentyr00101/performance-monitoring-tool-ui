<script setup lang="ts">
import type { GeneralSettingsUpdateRequest, NotificationPreferencesUpdateRequest, ReviewDefaultsUpdateRequest } from '~/types/settings'

definePageMeta({
  layout: 'default',
  middleware: ['auth']
})

const { userRole, user } = useAuth()
const settingsStore = useSettingsStore()
const reviewFormsStore = useReviewFormsStore()

// Redirect non-admins
if (userRole.value !== 'admin') {
  navigateTo('/403')
}

// ============================================================
// DATA LOADING
// ============================================================

const { forms: reviewForms, isLoading: formsLoading } = storeToRefs(reviewFormsStore)

const reviewFormOptions = computed(() => [
  { label: 'No default form', value: '' },
  ...reviewForms.value.map(f => ({
    label: `${f.name}${f.isDefault ? ' ✓ Current Default' : ''}`,
    value: f.id
  }))
])

const timezoneOptions = [
  { label: 'UTC', value: 'UTC' },
  { label: 'Asia/Manila (PHT)', value: 'Asia/Manila' },
  { label: 'America/New_York (EST)', value: 'America/New_York' },
  { label: 'America/Los_Angeles (PST)', value: 'America/Los_Angeles' },
  { label: 'Europe/London (GMT)', value: 'Europe/London' },
  { label: 'Asia/Singapore (SGT)', value: 'Asia/Singapore' },
  { label: 'Australia/Sydney (AEDT)', value: 'Australia/Sydney' }
]

const dateFormatOptions = [
  { label: 'MM/DD/YYYY', value: 'MM/DD/YYYY' },
  { label: 'DD/MM/YYYY', value: 'DD/MM/YYYY' },
  { label: 'YYYY-MM-DD', value: 'YYYY-MM-DD' }
]

const digestOptions = [
  { label: 'Immediately (per event)', value: 'immediate' },
  { label: 'Daily digest', value: 'daily' },
  { label: 'Weekly digest', value: 'weekly' }
]

// ============================================================
// FORM STATE - clones from settings for local editing
// ============================================================

/** General Settings local form state */
const generalForm = reactive<GeneralSettingsUpdateRequest>({
  organizationName: '',
  timezone: 'UTC',
  dateFormat: 'MM/DD/YYYY',
  language: 'en'
})

/** Notification Preferences local form state */
const notifForm = reactive<NotificationPreferencesUpdateRequest>({
  emailEnabled: true,
  inAppEnabled: true,
  digestFrequency: 'immediate',
  emailTypes: {
    adhocReviewTriggered: true,
    selfReviewDue: true,
    managerReviewDue: true,
    reviewReminder: true,
    reviewCompleted: true,
    goalAssigned: true,
    goalDueSoon: true,
    cycleStarted: true
  }
})

/** Review Defaults local form state */
const reviewForm = reactive<ReviewDefaultsUpdateRequest>({
  defaultFormId: '',
  reviewReminderDays: 3,
  selfReviewWindowDays: 7,
  ratingScale: { min: 1, max: 5 }
})

function applySettingsToForms() {
  const data = settingsStore.settings
  if (!data) return
  Object.assign(generalForm, data.general)
  Object.assign(notifForm, {
    ...data.notifications,
    emailTypes: { ...data.notifications.emailTypes }
  })
  Object.assign(reviewForm, {
    ...data.reviewDefaults,
    ratingScale: { ...data.reviewDefaults.ratingScale }
  })
}

async function loadSettings() {
  try {
    await settingsStore.fetchSettings()
    applySettingsToForms()
  }
  catch {
    // Error stored in settingsStore.error
  }
}

// ============================================================
// SAVE HANDLERS
// ============================================================

const isSavingGeneral = ref(false)
const isSavingNotif = ref(false)
const isSavingReview = ref(false)

async function saveGeneral() {
  isSavingGeneral.value = true
  try {
    await settingsStore.updateGeneralSettings(generalForm)
  }
  catch {
    // Notification handled by store
  }
  finally {
    isSavingGeneral.value = false
  }
}

async function saveNotifPreferences() {
  isSavingNotif.value = true
  try {
    await settingsStore.updateNotificationPreferences(notifForm)
  }
  catch {
    // Notification handled by store
  }
  finally {
    isSavingNotif.value = false
  }
}

async function saveReviewDefaults() {
  isSavingReview.value = true
  try {
    await settingsStore.updateReviewDefaults(reviewForm)
  }
  catch {
    // Notification handled by store
  }
  finally {
    isSavingReview.value = false
  }
}

onMounted(async () => {
  await Promise.all([
    loadSettings(),
    reviewFormsStore.fetchForms({ status: 'published', perPage: 100 })
  ])
})
</script>

<template>
  <div class="px-4 py-8 max-w-3xl">
    <h1 class="text-2xl font-bold text-white mb-8">Settings</h1>

    <!-- Load Error -->
    <div v-if="settingsStore.error" class="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6">
      <div class="flex items-center gap-3">
        <UIcon name="i-heroicons-exclamation-triangle" class="w-5 h-5 text-red-400" />
        <p class="text-red-400">{{ settingsStore.error }}</p>
        <UButton class="ml-auto" variant="outline" color="error" size="sm" @click="loadSettings">
          Retry
        </UButton>
      </div>
    </div>

    <!-- Loading skeleton -->
    <div v-if="settingsStore.isLoading" class="space-y-6">
      <div v-for="i in 3" :key="i" class="bg-gray-900 border border-gray-800 rounded-lg p-6 animate-pulse">
        <div class="w-40 h-5 bg-gray-800 rounded mb-4" />
        <div class="space-y-3">
          <div class="w-full h-9 bg-gray-800 rounded" />
          <div class="w-full h-9 bg-gray-800 rounded" />
        </div>
      </div>
    </div>

    <div v-else-if="!settingsStore.isLoading" class="space-y-6">
      <!-- =============================== -->
      <!-- GENERAL SETTINGS               -->
      <!-- =============================== -->
      <div class="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <div class="flex items-center gap-2 mb-6">
          <UIcon name="i-heroicons-cog-6-tooth" class="w-5 h-5 text-primary-400" />
          <h2 class="text-lg font-semibold text-white">General Settings</h2>
        </div>

        <div class="space-y-4">
          <UFormField label="Organisation Name">
            <UInput
              v-model="generalForm.organizationName"
              placeholder="e.g. Acme Corporation"
              class="w-full"
            />
          </UFormField>

          <div class="grid grid-cols-2 gap-4">
            <UFormField label="Timezone">
              <USelect
                v-model="generalForm.timezone"
                :items="timezoneOptions"
                value-key="value"
                class="w-full"
              />
            </UFormField>

            <UFormField label="Date Format">
              <USelect
                v-model="generalForm.dateFormat"
                :items="dateFormatOptions"
                value-key="value"
                class="w-full"
              />
            </UFormField>
          </div>
        </div>

        <div class="flex justify-end mt-6 pt-4 border-t border-gray-800">
          <UButton color="primary" :loading="isSavingGeneral" @click="saveGeneral">
            Save General Settings
          </UButton>
        </div>
      </div>

      <!-- =============================== -->
      <!-- REVIEW DEFAULTS                -->
      <!-- =============================== -->
      <div class="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <div class="flex items-center gap-2 mb-6">
          <UIcon name="i-heroicons-document-text" class="w-5 h-5 text-primary-400" />
          <h2 class="text-lg font-semibold text-white">Review Defaults</h2>
        </div>

        <div class="space-y-4">
          <UFormField
            label="Default Review Form"
            hint="Applied to review cycles that don't have a department-specific form assigned."
          >
            <USelect
              v-model="reviewForm.defaultFormId"
              :items="reviewFormOptions"
              value-key="value"
              :loading="formsLoading"
              placeholder="No default form"
              class="w-full"
            />
          </UFormField>

          <div class="grid grid-cols-2 gap-4">
            <UFormField
              label="Reminder Interval (days)"
              hint="Days before due date to send a reminder."
            >
              <UInput
                v-model.number="reviewForm.reviewReminderDays"
                type="number"
                :min="1"
                :max="30"
                class="w-full"
              />
            </UFormField>

            <UFormField
              label="Self-Review Window (days)"
              hint="Days from cycle start for employees to complete self-review."
            >
              <UInput
                v-model.number="reviewForm.selfReviewWindowDays"
                type="number"
                :min="1"
                :max="90"
                class="w-full"
              />
            </UFormField>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <UFormField label="Rating Scale Min">
              <UInput
                v-model.number="reviewForm.ratingScale!.min"
                type="number"
                :min="1"
                :max="3"
                class="w-full"
              />
            </UFormField>
            <UFormField label="Rating Scale Max">
              <UInput
                v-model.number="reviewForm.ratingScale!.max"
                type="number"
                :min="3"
                :max="10"
                class="w-full"
              />
            </UFormField>
          </div>
        </div>

        <div class="flex justify-end mt-6 pt-4 border-t border-gray-800">
          <UButton color="primary" :loading="isSavingReview" @click="saveReviewDefaults">
            Save Review Defaults
          </UButton>
        </div>
      </div>

      <!-- =============================== -->
      <!-- NOTIFICATION PREFERENCES        -->
      <!-- =============================== -->
      <div class="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <div class="flex items-center gap-2 mb-6">
          <UIcon name="i-heroicons-bell" class="w-5 h-5 text-primary-400" />
          <h2 class="text-lg font-semibold text-white">Notification Preferences</h2>
        </div>

        <div class="space-y-6">
          <!-- Channels -->
          <div>
            <p class="text-sm font-medium text-gray-300 mb-3">Channels</p>
            <div class="space-y-2">
              <UCheckbox v-model="notifForm.emailEnabled" label="Email notifications" />
              <UCheckbox v-model="notifForm.inAppEnabled" label="In-app notifications" />
            </div>
          </div>

          <!-- Digest frequency -->
          <UFormField label="Email Digest Frequency">
            <USelect
              v-model="notifForm.digestFrequency"
              :items="digestOptions"
              value-key="value"
              class="w-full max-w-xs"
            />
          </UFormField>

          <!-- Per-type toggles -->
          <div>
            <p class="text-sm font-medium text-gray-300 mb-3">Email Notification Types</p>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <UCheckbox v-model="notifForm.emailTypes!.adhocReviewTriggered" label="Ad-Hoc Review Triggered" />
              <UCheckbox v-model="notifForm.emailTypes!.selfReviewDue" label="Self-Review Due" />
              <UCheckbox v-model="notifForm.emailTypes!.managerReviewDue" label="Manager Review Due" />
              <UCheckbox v-model="notifForm.emailTypes!.reviewReminder" label="Review Reminders" />
              <UCheckbox v-model="notifForm.emailTypes!.reviewCompleted" label="Review Completed" />
              <UCheckbox v-model="notifForm.emailTypes!.goalAssigned" label="Goal Assigned" />
              <UCheckbox v-model="notifForm.emailTypes!.goalDueSoon" label="Goal Due Soon" />
              <UCheckbox v-model="notifForm.emailTypes!.cycleStarted" label="Cycle Started" />
            </div>
          </div>
        </div>

        <div class="flex justify-end mt-6 pt-4 border-t border-gray-800">
          <UButton color="primary" :loading="isSavingNotif" @click="saveNotifPreferences">
            Save Notification Preferences
          </UButton>
        </div>
      </div>
      <!-- =============================== -->
      <!-- SYSTEM AUDIT (admin only)       -->
      <!-- =============================== -->
      <div v-if="user?.role === 'admin'" class="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <div class="flex items-center gap-2 mb-1">
          <UIcon name="i-heroicons-shield-check" class="w-5 h-5 text-primary-400" />
          <h2 class="text-lg font-semibold text-white">System Audit</h2>
        </div>
        <p class="text-sm text-gray-400 mb-4">View a full log of all administrative actions taken in the system.</p>
        <UButton variant="outline" color="neutral" to="/settings/audit" trailing-icon="i-heroicons-arrow-right">
          View Audit Logs
        </UButton>
      </div>
    </div>
  </div>
</template>
