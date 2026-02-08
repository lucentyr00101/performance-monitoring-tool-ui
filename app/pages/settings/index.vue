<script setup lang="ts">
definePageMeta({
  layout: 'default',
  middleware: ['auth']
})

const { userRole } = useAuth()

// Only admin can access settings
if (userRole.value !== 'admin') {
  navigateTo('/403')
}
</script>

<template>
  <div class="px-4 py-8">
    <h1 class="text-2xl font-bold text-white mb-6">Settings</h1>

    <div class="space-y-6">
      <!-- General -->
      <div class="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <h3 class="text-lg font-medium text-white mb-4">General Settings</h3>
        <p class="text-gray-400 text-sm">
          System-wide configuration options will be available here once backend support is implemented.
        </p>
        <div class="mt-4 p-4 bg-gray-800/50 rounded-lg">
          <div class="flex items-center gap-3 text-gray-500">
            <UIcon name="i-heroicons-cog-6-tooth" class="w-5 h-5" />
            <span class="text-sm">Coming soon — Organization name, timezone, and branding settings.</span>
          </div>
        </div>
      </div>

      <!-- Review Settings -->
      <div class="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <h3 class="text-lg font-medium text-white mb-4">Review Settings</h3>
        <p class="text-gray-400 text-sm">
          Configure defaults for review cycles and ad-hoc reviews.
        </p>
        <div class="mt-4 p-4 bg-gray-800/50 rounded-lg">
          <div class="flex items-center gap-3 text-gray-500">
            <UIcon name="i-heroicons-document-text" class="w-5 h-5" />
            <span class="text-sm">Coming soon — Default review forms, cycle duration, and reminder intervals.</span>
          </div>
        </div>
      </div>

      <!-- Notification Settings -->
      <div class="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <h3 class="text-lg font-medium text-white mb-4">Notification Settings</h3>
        <p class="text-gray-400 text-sm">
          Configure email and in-app notification preferences.
        </p>
        <div class="mt-4 p-4 bg-gray-800/50 rounded-lg">
          <div class="flex items-center gap-3 text-gray-500">
            <UIcon name="i-heroicons-bell" class="w-5 h-5" />
            <span class="text-sm">Coming soon — Email digest frequency, notification channels, and quiet hours.</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
