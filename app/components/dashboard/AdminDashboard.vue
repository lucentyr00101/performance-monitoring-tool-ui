<script setup lang="ts">
import type { AdminDashboardData, SystemHealthItem } from '~/types/dashboard'

defineProps<{
  data: AdminDashboardData
  loading?: boolean
}>()

defineEmits<{
  refresh: []
}>()

function getHealthStatusColor(status: SystemHealthItem['status']): string {
  const colors: Record<SystemHealthItem['status'], string> = {
    healthy: 'emerald',
    warning: 'amber',
    error: 'red'
  }
  return colors[status]
}

function getHealthStatusIcon(status: SystemHealthItem['status']): string {
  const icons: Record<SystemHealthItem['status'], string> = {
    healthy: 'i-heroicons-check-circle',
    warning: 'i-heroicons-exclamation-triangle',
    error: 'i-heroicons-x-circle'
  }
  return icons[status]
}

function formatLoginTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / (1000 * 60))
  
  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours}h ago`
  return date.toLocaleDateString()
}
</script>

<template>
  <div class="space-y-6 animate-in fade-in duration-300">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-white">Admin Dashboard</h1>
        <p class="text-gray-400 mt-1">
          System health, user activity, and administration.
        </p>
      </div>
      <DashboardQuickActions
        :actions="data?.quickActions || []"
        :loading="loading"
        variant="buttons"
      />
    </div>

    <!-- KPI Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <DashboardKpiCard
        v-for="kpi in data?.kpis || []"
        :key="kpi.id"
        :kpi="kpi"
        :loading="loading"
      />
      <template v-if="loading && !data?.kpis?.length">
        <DashboardKpiCard
          v-for="i in 4"
          :key="i"
          :kpi="{ id: String(i), label: '', value: '' }"
          loading
        />
      </template>
    </div>

    <!-- System Health -->
    <UCard class="bg-gray-900 ring-gray-800">
      <template #header>
        <div class="flex items-center justify-between">
          <h3 class="font-semibold text-white">System Health</h3>
          <UBadge
            v-if="data?.systemHealth?.every(s => s.status === 'healthy')"
            color="success"
            variant="subtle"
          >
            All Systems Operational
          </UBadge>
          <UBadge
            v-else-if="data?.systemHealth?.some(s => s.status === 'error')"
            color="error"
            variant="subtle"
          >
            Issues Detected
          </UBadge>
          <UBadge
            v-else-if="data?.systemHealth?.some(s => s.status === 'warning')"
            color="warning"
            variant="subtle"
          >
            Warnings
          </UBadge>
        </div>
      </template>

      <!-- Loading -->
      <template v-if="loading">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <USkeleton v-for="i in 6" :key="i" class="h-20 rounded-lg" />
        </div>
      </template>

      <!-- Content -->
      <template v-else>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            v-for="item in data?.systemHealth || []"
            :key="item.id"
            class="p-4 rounded-lg bg-gray-800/50"
          >
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm font-medium text-white">{{ item.name }}</span>
              <UIcon
                :name="getHealthStatusIcon(item.status)"
                class="w-5 h-5"
                :class="`text-${getHealthStatusColor(item.status)}-500`"
              />
            </div>
            <p class="text-lg font-bold text-white">{{ item.value }}</p>
            <p class="text-xs text-gray-500 mt-1">{{ item.description }}</p>
          </div>
        </div>
      </template>
    </UCard>

    <!-- User Activity and Recent Logins -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- User Activity Chart -->
      <DashboardChartWidget
        title="User Activity (Last 7 Days)"
        :data="data?.userActivity || { labels: [], datasets: [] }"
        :loading="loading"
        type="bar"
        height="240px"
      />

      <!-- Recent Logins -->
      <UCard class="bg-gray-900 ring-gray-800">
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="font-semibold text-white">Recent Logins</h3>
            <NuxtLink
              to="/settings/audit"
              class="text-sm text-primary-500 hover:text-primary-400 transition-colors"
            >
              View All →
            </NuxtLink>
          </div>
        </template>

        <!-- Loading -->
        <template v-if="loading">
          <div class="space-y-3">
            <div v-for="i in 5" :key="i" class="flex items-center gap-3">
              <USkeleton class="w-8 h-8 rounded-full" />
              <div class="flex-1 space-y-2">
                <USkeleton class="h-4 w-32" />
                <USkeleton class="h-3 w-48" />
              </div>
            </div>
          </div>
        </template>

        <!-- Empty state -->
        <template v-else-if="!data?.recentLogins?.length">
          <div class="text-center py-6 text-gray-500">
            <p>No recent logins</p>
          </div>
        </template>

        <!-- Content -->
        <template v-else>
          <div class="space-y-3 max-h-60 overflow-y-auto">
            <div
              v-for="login in data.recentLogins"
              :key="login.id"
              class="flex items-center gap-3"
            >
              <UAvatar
                :alt="login.userName"
                :src="login.avatarUrl"
                size="sm"
              />
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-white truncate">
                  {{ login.userName }}
                </p>
                <p class="text-xs text-gray-500 truncate">
                  {{ login.device }}
                </p>
              </div>
              <span class="text-xs text-gray-500 shrink-0">
                {{ formatLoginTime(login.loginTime) }}
              </span>
            </div>
          </div>
        </template>
      </UCard>
    </div>
  </div>
</template>
