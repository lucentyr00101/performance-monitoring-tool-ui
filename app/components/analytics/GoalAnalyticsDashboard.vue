<script setup lang="ts">
import type { GoalAnalyticsData } from '~/types/analytics'

const props = withDefaults(defineProps<{
  data: GoalAnalyticsData | null
  loading?: boolean
}>(), {
  loading: false
})

// Prepare chart data
const trendLabels = computed(() =>
  props.data?.trend.map(t => {
    const [year, month] = t.month.split('-')
    return new Date(Number(year), Number(month) - 1).toLocaleDateString('en-US', { month: 'short' })
  }) || []
)

const trendDatasets = computed(() => [
  {
    label: 'Completed',
    data: props.data?.trend.map(t => t.completed) || [],
    color: '#10b981',
    fill: true
  },
  {
    label: 'Created',
    data: props.data?.trend.map(t => t.created) || [],
    color: '#3b82f6'
  }
])

const statusLabels = computed(() =>
  ['Draft', 'Pending', 'Active', 'Completed', 'Cancelled']
)

const statusData = computed(() => props.data ? [
  props.data.byStatus.draft,
  props.data.byStatus.pending,
  props.data.byStatus.active,
  props.data.byStatus.completed,
  props.data.byStatus.cancelled
] : [])

const typeLabels = computed(() => ['Individual', 'Team', 'Department', 'Company'])

const typeData = computed(() => props.data ? [
  props.data.byType.individual,
  props.data.byType.team,
  props.data.byType.department,
  props.data.byType.company
] : [])

const departmentLabels = computed(() =>
  props.data?.byDepartment.map(d => d.departmentName) || []
)

const departmentDatasets = computed(() => [{
  label: 'Completion Rate',
  data: props.data?.byDepartment.map(d => d.completionRate) || []
}])
</script>

<template>
  <div class="space-y-6">
    <!-- Summary Metrics -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <MetricCard
        label="Total Goals"
        :value="data?.summary.totalGoals ?? '-'"
        icon="heroicons:flag"
        color="primary"
        :loading="loading"
      />
      <MetricCard
        label="Completion Rate"
        :value="data ? `${data.summary.completionRate}%` : '-'"
        icon="heroicons:check-circle"
        color="success"
        :trend="data ? { direction: 'up', value: '+5%', isPositive: true } : undefined"
        :loading="loading"
      />
      <MetricCard
        label="Avg Progress"
        :value="data ? `${data.summary.averageProgress}%` : '-'"
        icon="heroicons:chart-bar"
        color="warning"
        :loading="loading"
      />
      <MetricCard
        label="On Track"
        :value="data ? `${data.summary.onTrackPercentage}%` : '-'"
        icon="heroicons:arrow-trending-up"
        color="success"
        :loading="loading"
      />
    </div>

    <!-- Charts Row 1 -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Completion Trend -->
      <UCard class="bg-gray-900 ring-gray-800">
        <template #header>
          <h3 class="font-semibold text-white">Goal Completion Trend</h3>
        </template>
        <LineChart
          :labels="trendLabels"
          :datasets="trendDatasets"
          height="280px"
          :loading="loading"
          y-axis-label="Goals"
        />
      </UCard>

      <!-- Goals by Department -->
      <UCard class="bg-gray-900 ring-gray-800">
        <template #header>
          <h3 class="font-semibold text-white">Completion by Department</h3>
        </template>
        <BarChart
          :labels="departmentLabels"
          :datasets="departmentDatasets"
          height="280px"
          :loading="loading"
          y-axis-label="Completion %"
        />
      </UCard>
    </div>

    <!-- Charts Row 2 -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Goals by Status -->
      <UCard class="bg-gray-900 ring-gray-800">
        <template #header>
          <h3 class="font-semibold text-white">Goals by Status</h3>
        </template>
        <DoughnutChart
          :labels="statusLabels"
          :data="statusData"
          :colors="['#6b7280', '#eab308', '#3b82f6', '#10b981', '#ef4444']"
          height="280px"
          :loading="loading"
          :center-value="data?.summary.totalGoals"
          center-text="Total"
        />
      </UCard>

      <!-- Goals by Type -->
      <UCard class="bg-gray-900 ring-gray-800">
        <template #header>
          <h3 class="font-semibold text-white">Goals by Type</h3>
        </template>
        <DoughnutChart
          :labels="typeLabels"
          :data="typeData"
          :colors="['#3b82f6', '#8b5cf6', '#f59e0b', '#10b981']"
          height="280px"
          :loading="loading"
        />
      </UCard>
    </div>

    <!-- Top Performers -->
    <UCard class="bg-gray-900 ring-gray-800">
      <template #header>
        <h3 class="font-semibold text-white">Top Goal Achievers</h3>
      </template>

      <template v-if="loading">
        <div class="space-y-3">
          <USkeleton v-for="i in 5" :key="i" class="h-12 w-full" />
        </div>
      </template>

      <template v-else-if="data?.topPerformers.length">
        <div class="divide-y divide-gray-800">
          <div
            v-for="(performer, index) in data.topPerformers"
            :key="performer.employeeId"
            class="flex items-center gap-4 py-3"
          >
            <div class="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-gray-800 text-sm font-medium text-gray-400">
              {{ index + 1 }}
            </div>
            <div class="flex-1 min-w-0">
              <p class="font-medium text-white truncate">{{ performer.employeeName }}</p>
              <p class="text-sm text-gray-500">{{ performer.department }}</p>
            </div>
            <div class="text-right">
              <p class="font-semibold text-white">{{ performer.goalsCompleted }} goals</p>
              <p class="text-sm text-gray-500">{{ performer.averageProgress }}% avg progress</p>
            </div>
          </div>
        </div>
      </template>

      <template v-else>
        <div class="text-center py-8 text-gray-500">
          <UIcon name="heroicons:users" class="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No top performers data available</p>
        </div>
      </template>
    </UCard>
  </div>
</template>
