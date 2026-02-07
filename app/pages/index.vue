<script setup lang="ts">
import type { UserRole } from '~/types/auth'
import type {
  EmployeeDashboardData,
  ManagerDashboardData,
  HRDashboardData,
  CSuiteDashboardData,
  AdminDashboardData
} from '~/types/dashboard'

definePageMeta({
  middleware: 'auth'
})

const { user, userRole, userFullName } = useAuth()
const dashboardStore = useDashboardStore()

const { data, isLoading, error, lastRefreshedText } = storeToRefs(dashboardStore)

// Auto-refresh interval
const REFRESH_INTERVAL = 5 * 60 * 1000 // 5 minutes
let refreshTimer: ReturnType<typeof setInterval> | null = null

// Fetch dashboard data on mount
onMounted(async () => {
  if (userRole.value) {
    await dashboardStore.fetchDashboard(userRole.value as UserRole)
  }
  
  // Set up auto-refresh
  refreshTimer = setInterval(() => {
    if (userRole.value) {
      dashboardStore.refresh()
    }
  }, REFRESH_INTERVAL)
})

// Clean up on unmount
onUnmounted(() => {
  if (refreshTimer) {
    clearInterval(refreshTimer)
  }
})

// Watch for role changes
watch(userRole, async (newRole) => {
  if (newRole) {
    await dashboardStore.fetchDashboard(newRole as UserRole)
  }
})

// Manual refresh handler
async function handleRefresh() {
  await dashboardStore.refresh()
}

// Type-safe computed data for each dashboard
const employeeData = computed(() => data.value as EmployeeDashboardData | null)
const managerData = computed(() => data.value as ManagerDashboardData | null)
const hrData = computed(() => data.value as HRDashboardData | null)
const csuiteData = computed(() => data.value as CSuiteDashboardData | null)
const adminData = computed(() => data.value as AdminDashboardData | null)

// Get user's first name for greeting
const userName = computed(() => {
  const emp = user.value?.employee as { firstName?: string; first_name?: string } | undefined
  return emp?.firstName || emp?.first_name || userFullName.value?.split(' ')[0] || 'there'
})
</script>

<template>
  <div>
    <!-- Refresh bar -->
    <div class="flex items-center justify-end gap-3 mb-4 text-sm text-gray-500">
      <span v-if="lastRefreshedText">Last updated: {{ lastRefreshedText }}</span>
      <UButton
        icon="i-heroicons-arrow-path"
        size="xs"
        variant="ghost"
        color="neutral"
        :loading="isLoading"
        @click="handleRefresh"
      >
        Refresh
      </UButton>
    </div>

    <!-- Error state -->
    <UCard v-if="error" class="bg-red-900/20 ring-red-800 mb-6">
      <div class="flex items-center gap-4">
        <UIcon name="i-heroicons-exclamation-triangle" class="w-8 h-8 text-red-500" />
        <div class="flex-1">
          <p class="text-white font-medium">Failed to load dashboard</p>
          <p class="text-sm text-gray-400">{{ error }}</p>
        </div>
        <UButton color="primary" @click="handleRefresh">
          Retry
        </UButton>
      </div>
    </UCard>

    <!-- Role-specific dashboards -->
    <UiErrorBoundary v-if="!error" title="Dashboard failed to load" :show-retry="true" @retry="handleRefresh">
      <!-- Employee Dashboard -->
      <DashboardEmployeeDashboard
        v-if="userRole === 'employee' && employeeData"
        :data="employeeData"
        :loading="isLoading"
        :user-name="userName"
        @refresh="handleRefresh"
      />

      <!-- Manager Dashboard -->
      <DashboardManagerDashboard
        v-else-if="userRole === 'manager' && managerData"
        :data="managerData"
        :loading="isLoading"
        @refresh="handleRefresh"
      />

      <!-- HR Dashboard -->
      <DashboardHRDashboard
        v-else-if="userRole === 'hr' && hrData"
        :data="hrData"
        :loading="isLoading"
        @refresh="handleRefresh"
      />

      <!-- C-Suite Dashboard -->
      <DashboardCSuiteDashboard
        v-else-if="userRole === 'csuite' && csuiteData"
        :data="csuiteData"
        :loading="isLoading"
        @refresh="handleRefresh"
      />

      <!-- Admin Dashboard -->
      <DashboardAdminDashboard
        v-else-if="userRole === 'admin' && adminData"
        :data="adminData"
        :loading="isLoading"
        @refresh="handleRefresh"
      />

      <!-- Loading state when data hasn't arrived yet -->
      <div v-else-if="isLoading" class="space-y-4">
        <div v-for="i in 3" :key="i" class="bg-gray-900 border border-gray-800 rounded-lg p-6 animate-pulse">
          <div class="w-48 h-6 bg-gray-800 rounded mb-4" />
          <div class="w-full h-4 bg-gray-800 rounded mb-2" />
          <div class="w-3/4 h-4 bg-gray-800 rounded" />
        </div>
      </div>

      <!-- Fallback to Employee Dashboard for unknown roles -->
      <DashboardEmployeeDashboard
        v-else-if="employeeData"
        :data="employeeData"
        :loading="isLoading"
        :user-name="userName"
        @refresh="handleRefresh"
      />
    </UiErrorBoundary>
  </div>
</template>
