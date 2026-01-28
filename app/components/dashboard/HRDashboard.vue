<script setup lang="ts">
import type { HRDashboardData, ReviewCycle } from '~/types/dashboard'

defineProps<{
  data: HRDashboardData
  loading?: boolean
}>()

defineEmits<{
  refresh: []
}>()

function getCycleStatusColor(status: ReviewCycle['status']): 'primary' | 'warning' | 'success' {
  const colors: Record<ReviewCycle['status'], 'primary' | 'warning' | 'success'> = {
    active: 'primary',
    upcoming: 'warning',
    completed: 'success'
  }
  return colors[status]
}

function getCycleStatusLabel(status: ReviewCycle['status']): string {
  const labels: Record<ReviewCycle['status'], string> = {
    active: 'Active',
    upcoming: 'Upcoming',
    completed: 'Completed'
  }
  return labels[status]
}
</script>

<template>
  <div class="space-y-6 animate-in fade-in duration-300">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-white">HR Dashboard</h1>
        <p class="text-gray-400 mt-1">
          Organization-wide performance metrics and review cycles.
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

    <!-- Active Review Cycles -->
    <UCard class="bg-gray-900 ring-gray-800">
      <template #header>
        <div class="flex items-center justify-between">
          <h3 class="font-semibold text-white">Active Review Cycles</h3>
          <NuxtLink
            to="/reviews"
            class="text-sm text-primary-500 hover:text-primary-400 transition-colors"
          >
            View All →
          </NuxtLink>
        </div>
      </template>

      <!-- Loading -->
      <template v-if="loading">
        <div class="space-y-4">
          <div v-for="i in 2" :key="i" class="space-y-3">
            <USkeleton class="h-5 w-64" />
            <USkeleton class="h-3 w-full rounded-full" />
            <div class="flex gap-4">
              <USkeleton class="h-4 w-32" />
              <USkeleton class="h-4 w-32" />
            </div>
          </div>
        </div>
      </template>

      <!-- Empty state -->
      <template v-else-if="!data?.reviewCycles?.length">
        <div class="text-center py-8 text-gray-500">
          <UIcon name="i-heroicons-document-text" class="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No active review cycles</p>
          <UButton class="mt-3" color="primary" size="sm" to="/reviews/cycles/new">
            Create Review Cycle
          </UButton>
        </div>
      </template>

      <!-- Content -->
      <template v-else>
        <div class="space-y-6">
          <div
            v-for="cycle in data.reviewCycles"
            :key="cycle.id"
            class="p-4 rounded-lg bg-gray-800/50"
          >
            <div class="flex items-center justify-between mb-3">
              <div class="flex items-center gap-3">
                <h4 class="font-medium text-white">{{ cycle.name }}</h4>
                <UBadge :color="getCycleStatusColor(cycle.status)" variant="subtle" size="xs">
                  {{ getCycleStatusLabel(cycle.status) }}
                </UBadge>
              </div>
              <NuxtLink
                :to="cycle.link || '#'"
                class="text-sm text-primary-500 hover:text-primary-400 transition-colors"
              >
                Manage →
              </NuxtLink>
            </div>

            <!-- Progress bar -->
            <div class="mb-3">
              <div class="flex items-center justify-between text-sm mb-1">
                <span class="text-gray-400">Overall Progress</span>
                <span class="text-white font-medium">{{ cycle.progress }}%</span>
              </div>
              <div class="h-2 bg-gray-700 rounded-full overflow-hidden">
                <div
                  class="h-full bg-primary-500 rounded-full transition-all duration-500"
                  :style="{ width: `${cycle.progress}%` }"
                />
              </div>
            </div>

            <!-- Breakdown -->
            <div class="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span class="text-gray-500">Self-Assessment:</span>
                <span class="text-white ml-2">{{ cycle.selfAssessmentProgress }}%</span>
              </div>
              <div>
                <span class="text-gray-500">Manager Review:</span>
                <span class="text-white ml-2">{{ cycle.managerReviewProgress }}%</span>
              </div>
            </div>
          </div>
        </div>
      </template>
    </UCard>

    <!-- Department Comparison and Performance Distribution -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Department Comparison -->
      <UCard class="bg-gray-900 ring-gray-800">
        <template #header>
          <h3 class="font-semibold text-white">Department Comparison</h3>
        </template>

        <!-- Loading -->
        <template v-if="loading">
          <div class="space-y-3">
            <div v-for="i in 5" :key="i" class="flex items-center gap-3">
              <USkeleton class="h-4 w-24" />
              <USkeleton class="h-3 flex-1 rounded-full" />
              <USkeleton class="h-4 w-8" />
            </div>
          </div>
        </template>

        <!-- Content -->
        <template v-else>
          <div class="space-y-3">
            <div
              v-for="dept in data?.departmentPerformance || []"
              :key="dept.id"
              class="space-y-1"
            >
              <div class="flex items-center justify-between text-sm">
                <span class="text-gray-300">{{ dept.name }}</span>
                <span class="text-white font-medium">{{ dept.averageRating.toFixed(1) }}</span>
              </div>
              <div class="h-2 bg-gray-800 rounded-full overflow-hidden">
                <div
                  class="h-full bg-primary-500 rounded-full"
                  :style="{ width: `${(dept.averageRating / 5) * 100}%` }"
                />
              </div>
              <p class="text-xs text-gray-500">
                {{ dept.employeeCount }} employees • {{ dept.goalsCompleted }}/{{ dept.goalsTotal }} goals
              </p>
            </div>
          </div>
        </template>
      </UCard>

      <!-- Performance Distribution -->
      <DashboardChartWidget
        title="Performance Distribution"
        :data="data?.performanceDistribution || { labels: [], datasets: [] }"
        :loading="loading"
        type="doughnut"
        height="280px"
      />
    </div>

    <!-- Recent Activity -->
    <UCard class="bg-gray-900 ring-gray-800">
      <template #header>
        <h3 class="font-semibold text-white">Recent Activity</h3>
      </template>

      <!-- Loading -->
      <template v-if="loading">
        <div class="space-y-4">
          <div v-for="i in 4" :key="i" class="flex items-center gap-3">
            <USkeleton class="w-8 h-8 rounded-full" />
            <div class="flex-1 space-y-2">
              <USkeleton class="h-4 w-48" />
              <USkeleton class="h-3 w-32" />
            </div>
          </div>
        </div>
      </template>

      <!-- Empty state -->
      <template v-else-if="!data?.recentActivity?.length">
        <div class="text-center py-6 text-gray-500">
          <p>No recent activity</p>
        </div>
      </template>

      <!-- Content -->
      <template v-else>
        <div class="space-y-4">
          <div
            v-for="activity in data.recentActivity"
            :key="activity.id"
            class="flex items-start gap-3"
          >
            <UAvatar
              v-if="activity.user"
              :alt="activity.user.name"
              :src="activity.user.avatarUrl"
              size="sm"
            />
            <div
              v-else
              class="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center"
            >
              <UIcon name="i-heroicons-bolt" class="w-4 h-4 text-gray-500" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm text-gray-200">
                <span class="font-medium text-white">{{ activity.title }}</span>
                <span class="text-gray-400"> - {{ activity.description }}</span>
              </p>
              <p class="text-xs text-gray-500 mt-0.5">
                {{ new Date(activity.timestamp).toLocaleString() }}
              </p>
            </div>
          </div>
        </div>
      </template>
    </UCard>
  </div>
</template>
