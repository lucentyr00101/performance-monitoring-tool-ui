<script setup lang="ts">
import type { UserRole } from '~/types/auth'

definePageMeta({
  middleware: 'auth'
})

const { user, userRole } = useAuth()

const roleLabels: Record<UserRole, string> = {
  admin: 'Administrator',
  hr: 'HR Manager',
  manager: 'Manager',
  employee: 'Employee',
  csuite: 'Executive'
}

const greeting = computed(() => {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
})

// Quick stats placeholder
const stats = [
  { label: 'Active Goals', value: '8', icon: 'i-heroicons-flag', color: 'primary' },
  { label: 'Pending Reviews', value: '3', icon: 'i-heroicons-document-text', color: 'amber' },
  { label: 'Team Members', value: '12', icon: 'i-heroicons-users', color: 'emerald' },
  { label: 'Completion Rate', value: '85%', icon: 'i-heroicons-chart-bar', color: 'violet' }
]
</script>

<template>
  <div class="space-y-6">
    <!-- Welcome header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-white">
          {{ greeting }}, {{ user?.employee?.first_name || 'User' }}!
        </h1>
        <p class="text-gray-400 mt-1">
          Here's what's happening with your performance today.
        </p>
      </div>
      <UBadge :color="userRole === 'admin' ? 'red' : userRole === 'hr' ? 'amber' : 'primary'" size="lg">
        {{ roleLabels[userRole as UserRole] || userRole }}
      </UBadge>
    </div>

    <!-- Stats grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <UCard v-for="stat in stats" :key="stat.label" class="bg-gray-900 ring-gray-800">
        <div class="flex items-center gap-4">
          <div
            class="w-12 h-12 rounded-lg flex items-center justify-center"
            :class="`bg-${stat.color}-500/10`"
          >
            <UIcon :name="stat.icon" class="w-6 h-6" :class="`text-${stat.color}-500`" />
          </div>
          <div>
            <p class="text-2xl font-bold text-white">{{ stat.value }}</p>
            <p class="text-sm text-gray-400">{{ stat.label }}</p>
          </div>
        </div>
      </UCard>
    </div>

    <!-- Placeholder content -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <UCard class="bg-gray-900 ring-gray-800">
        <template #header>
          <h3 class="font-semibold text-white">Recent Activity</h3>
        </template>
        <div class="text-center py-8 text-gray-500">
          <UIcon name="i-heroicons-clock" class="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No recent activity</p>
          <p class="text-sm">Your activity will appear here</p>
        </div>
      </UCard>

      <UCard class="bg-gray-900 ring-gray-800">
        <template #header>
          <h3 class="font-semibold text-white">Upcoming Deadlines</h3>
        </template>
        <div class="text-center py-8 text-gray-500">
          <UIcon name="i-heroicons-calendar" class="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No upcoming deadlines</p>
          <p class="text-sm">Your deadlines will appear here</p>
        </div>
      </UCard>
    </div>
  </div>
</template>
