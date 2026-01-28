<script setup lang="ts">
import type { CSuiteDashboardData } from '~/types/dashboard'

defineProps<{
  data: CSuiteDashboardData
  loading?: boolean
}>()

defineEmits<{
  refresh: []
}>()

function getGoalStatusColor(status: 'on_track' | 'at_risk' | 'behind' | 'completed'): 'primary' | 'warning' | 'error' | 'success' {
  const colors: Record<string, 'primary' | 'warning' | 'error' | 'success'> = {
    on_track: 'primary',
    at_risk: 'warning',
    behind: 'error',
    completed: 'success'
  }
  return colors[status] || 'primary'
}

function getGoalProgressClass(status: 'on_track' | 'at_risk' | 'behind' | 'completed'): string {
  const classes: Record<string, string> = {
    on_track: 'bg-primary-500',
    at_risk: 'bg-amber-500',
    behind: 'bg-red-500',
    completed: 'bg-emerald-500'
  }
  return classes[status] || 'bg-primary-500'
}
</script>

<template>
  <div class="space-y-6 animate-in fade-in duration-300">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-white">Executive Dashboard</h1>
        <p class="text-gray-400 mt-1">
          High-level organizational performance insights.
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

    <!-- Performance Trends -->
    <UCard class="bg-gray-900 ring-gray-800">
      <template #header>
        <div class="flex items-center justify-between">
          <h3 class="font-semibold text-white">Performance Trends</h3>
          <div class="flex items-center gap-4 text-sm">
            <div class="flex items-center gap-2">
              <div class="w-3 h-3 rounded-full bg-primary-500" />
              <span class="text-gray-400">Company</span>
            </div>
            <div class="flex items-center gap-2">
              <div class="w-3 h-3 rounded-full bg-gray-500" />
              <span class="text-gray-400">Benchmark</span>
            </div>
          </div>
        </div>
      </template>

      <!-- Loading -->
      <template v-if="loading">
        <USkeleton class="h-48 w-full rounded-lg" />
      </template>

      <!-- Content -->
      <template v-else>
        <div class="flex items-end justify-between h-48 gap-4">
          <div
            v-for="(value, index) in data?.performanceTrends?.datasets?.[0]?.data || []"
            :key="index"
            class="flex-1 flex flex-col items-center gap-2"
          >
            <div class="w-full flex flex-col items-center gap-1 flex-1 justify-end">
              <!-- Company bar -->
              <div
                class="w-full max-w-8 bg-primary-500 rounded-t transition-all duration-500"
                :style="{ height: `${(value / 5) * 100}%` }"
              />
              <!-- Benchmark line -->
              <div
                v-if="data?.performanceTrends?.datasets?.[1]"
                class="w-full h-0.5 bg-gray-500"
                :style="{ marginTop: `-${((data?.performanceTrends?.datasets?.[1]?.data?.[index] || 0) / 5) * 100}%` }"
              />
            </div>
            <div class="text-center">
              <p class="text-lg font-bold text-white">{{ value }}</p>
              <p class="text-xs text-gray-500">{{ data?.performanceTrends?.labels?.[index] }}</p>
            </div>
          </div>
        </div>
      </template>
    </UCard>

    <!-- Department Performance and Strategic Goals -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Department Performance -->
      <UCard class="bg-gray-900 ring-gray-800">
        <template #header>
          <h3 class="font-semibold text-white">Department Performance</h3>
        </template>

        <!-- Loading -->
        <template v-if="loading">
          <div class="space-y-4">
            <div v-for="i in 5" :key="i" class="space-y-2">
              <div class="flex justify-between">
                <USkeleton class="h-4 w-24" />
                <USkeleton class="h-4 w-12" />
              </div>
              <USkeleton class="h-2 w-full rounded-full" />
            </div>
          </div>
        </template>

        <!-- Content -->
        <template v-else>
          <div class="space-y-4">
            <div
              v-for="dept in data?.departmentPerformance || []"
              :key="dept.id"
            >
              <div class="flex items-center justify-between mb-1">
                <span class="text-sm text-gray-300">{{ dept.name }}</span>
                <div class="flex items-center gap-2">
                  <span class="text-xs text-gray-500">{{ dept.employeeCount }} people</span>
                  <span class="text-sm font-medium text-white">{{ dept.averageRating.toFixed(1) }}</span>
                </div>
              </div>
              <div class="h-2 bg-gray-800 rounded-full overflow-hidden">
                <div
                  class="h-full rounded-full transition-all duration-500"
                  :class="dept.averageRating >= 4 ? 'bg-emerald-500' : dept.averageRating >= 3.5 ? 'bg-primary-500' : 'bg-amber-500'"
                  :style="{ width: `${(dept.averageRating / 5) * 100}%` }"
                />
              </div>
            </div>
          </div>
        </template>
      </UCard>

      <!-- Strategic Goals -->
      <UCard class="bg-gray-900 ring-gray-800">
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="font-semibold text-white">Strategic Goals</h3>
            <NuxtLink
              to="/goals?type=strategic"
              class="text-sm text-primary-500 hover:text-primary-400 transition-colors"
            >
              View All →
            </NuxtLink>
          </div>
        </template>

        <!-- Loading -->
        <template v-if="loading">
          <div class="space-y-4">
            <div v-for="i in 4" :key="i" class="space-y-2">
              <USkeleton class="h-4 w-48" />
              <USkeleton class="h-2 w-full rounded-full" />
            </div>
          </div>
        </template>

        <!-- Empty state -->
        <template v-else-if="!data?.strategicGoals?.length">
          <div class="text-center py-6 text-gray-500">
            <p>No strategic goals defined</p>
          </div>
        </template>

        <!-- Content -->
        <template v-else>
          <div class="space-y-4">
            <div
              v-for="goal in data.strategicGoals"
              :key="goal.id"
            >
              <div class="flex items-center justify-between mb-1">
                <p class="text-sm text-gray-200 truncate flex-1 mr-3">{{ goal.title }}</p>
                <div class="flex items-center gap-2 shrink-0">
                  <UBadge :color="getGoalStatusColor(goal.status)" size="xs" variant="subtle">
                    {{ goal.progress }}%
                  </UBadge>
                </div>
              </div>
              <div class="h-2 bg-gray-800 rounded-full overflow-hidden">
                <div
                  class="h-full rounded-full transition-all duration-500"
                  :class="getGoalProgressClass(goal.status)"
                  :style="{ width: `${goal.progress}%` }"
                />
              </div>
              <p v-if="goal.daysRemaining" class="text-xs text-gray-500 mt-1">
                {{ goal.daysRemaining }} days remaining
              </p>
            </div>
          </div>
        </template>
      </UCard>
    </div>
  </div>
</template>
