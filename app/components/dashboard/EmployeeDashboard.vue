<script setup lang="ts">
import type { EmployeeDashboardData } from '~/types/dashboard'

defineProps<{
  data: EmployeeDashboardData
  loading?: boolean
  userName?: string
}>()

defineEmits<{
  refresh: []
}>()

const greeting = computed(() => {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
})
</script>

<template>
  <div class="space-y-6 animate-in fade-in duration-300">
    <!-- Header with greeting and quick actions -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-white">
          {{ greeting }}, {{ userName || 'there' }}!
        </h1>
        <p class="text-gray-400 mt-1">
          Here's what's happening with your performance today.
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
      <!-- Loading skeleton -->
      <template v-if="loading && !data?.kpis?.length">
        <DashboardKpiCard
          v-for="i in 4"
          :key="i"
          :kpi="{ id: String(i), label: '', value: '' }"
          loading
        />
      </template>
    </div>

    <!-- Main content grid -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Goals Progress -->
      <DashboardProgressListWidget
        title="My Goals Progress"
        :items="data?.goalsProgress || []"
        :loading="loading"
        view-all-link="/goals"
        :max-items="5"
      />

      <!-- Upcoming Deadlines -->
      <UCard class="bg-gray-900 ring-gray-800">
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="font-semibold text-white">Upcoming Deadlines</h3>
            <NuxtLink
              to="/goals"
              class="text-sm text-primary-500 hover:text-primary-400 transition-colors"
            >
              View All →
            </NuxtLink>
          </div>
        </template>

        <!-- Loading -->
        <template v-if="loading">
          <div class="space-y-4">
            <div v-for="i in 3" :key="i" class="flex items-center gap-3">
              <USkeleton class="w-10 h-10 rounded-lg" />
              <div class="flex-1 space-y-2">
                <USkeleton class="h-4 w-40" />
                <USkeleton class="h-3 w-24" />
              </div>
            </div>
          </div>
        </template>

        <!-- Empty state -->
        <template v-else-if="!data?.upcomingDeadlines?.length">
          <div class="text-center py-8 text-gray-500">
            <UIcon name="i-heroicons-calendar" class="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No upcoming deadlines</p>
            <p class="text-sm">Your deadlines will appear here</p>
          </div>
        </template>

        <!-- Content -->
        <template v-else>
          <div class="space-y-3">
            <NuxtLink
              v-for="deadline in data.upcomingDeadlines"
              :key="deadline.id"
              :to="deadline.link || '#'"
              class="flex items-center gap-3 p-2 -mx-2 rounded-lg hover:bg-gray-800/50 transition-colors group"
            >
              <div
                class="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                :class="deadline.daysRemaining <= 7 ? 'bg-amber-500/10' : 'bg-gray-800'"
              >
                <UIcon
                  :name="deadline.type === 'goal' ? 'i-heroicons-flag' : deadline.type === 'review' ? 'i-heroicons-document-text' : 'i-heroicons-pencil-square'"
                  class="w-5 h-5"
                  :class="deadline.daysRemaining <= 7 ? 'text-amber-500' : 'text-gray-400'"
                />
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-gray-200 group-hover:text-white transition-colors truncate">
                  {{ deadline.title }}
                </p>
                <p class="text-xs text-gray-500">
                  Due {{ deadline.dueDate }}
                </p>
              </div>
              <UBadge
                :color="deadline.daysRemaining <= 7 ? 'warning' : 'neutral'"
                variant="subtle"
                size="xs"
              >
                {{ deadline.daysRemaining }} days
              </UBadge>
            </NuxtLink>
          </div>
        </template>
      </UCard>
    </div>

    <!-- Secondary content grid -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Performance Trend -->
      <DashboardChartWidget
        title="Performance Trend"
        :data="data?.performanceTrend || { labels: [], datasets: [] }"
        :loading="loading"
        type="line"
        height="200px"
      />

      <!-- Notifications -->
      <DashboardNotificationWidget
        :notifications="data?.notifications || []"
        :loading="loading"
        view-all-link="/notifications"
        :max-items="5"
      />
    </div>
  </div>
</template>
