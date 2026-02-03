<script setup lang="ts">
import type { ReviewCycleAnalyticsData } from '~/types/analytics'

const props = withDefaults(defineProps<{
  data: ReviewCycleAnalyticsData | null
  loading?: boolean
}>(), {
  loading: false
})

// Prepare chart data
const phaseLabels = computed(() =>
  props.data?.byPhase.map(p => p.phase.charAt(0).toUpperCase() + p.phase.slice(1)) || []
)

const phaseDatasets = computed(() => [{
  label: 'Completion Rate',
  data: props.data?.byPhase.map(p => p.completionRate) || [],
  color: '#3b82f6'
}])

const departmentLabels = computed(() =>
  props.data?.byDepartment.map(d => d.departmentName) || []
)

const departmentDatasets = computed(() => [{
  label: 'Completion Rate',
  data: props.data?.byDepartment.map(d => d.completionRate) || [],
  color: '#10b981'
}])

const trendLabels = computed(() =>
  props.data?.dailyTrend.map(d => {
    const date = new Date(d.date)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }) || []
)

const trendDatasets = computed(() => [{
  label: 'Cumulative Completion %',
  data: props.data?.dailyTrend.map(d => d.cumulativePercentage) || [],
  color: '#8b5cf6',
  fill: true
}])

// Progress color based on completion rate
function getProgressColor(rate: number): string {
  if (rate >= 80) return 'text-green-400'
  if (rate >= 50) return 'text-amber-400'
  return 'text-red-400'
}

// Status badge color
function getStatusBadgeColor(status: string): string {
  switch (status) {
    case 'pending': return 'bg-amber-500/20 text-amber-400'
    case 'in_progress': return 'bg-blue-500/20 text-blue-400'
    default: return 'bg-gray-500/20 text-gray-400'
  }
}
</script>

<template>
  <div class="space-y-6">
    <!-- Cycle Info Banner -->
    <div v-if="data?.cycle && !loading" class="bg-gray-800 border border-gray-700 rounded-lg p-4">
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h3 class="font-semibold text-white text-lg">{{ data.cycle.name }}</h3>
          <p class="text-gray-400 text-sm">
            {{ new Date(data.cycle.startDate).toLocaleDateString() }} - {{ new Date(data.cycle.endDate).toLocaleDateString() }}
          </p>
        </div>
        <div class="flex items-center gap-4">
          <div class="text-center">
            <p class="text-2xl font-bold" :class="getProgressColor(data.summary.completionRate)">
              {{ data.summary.completionRate }}%
            </p>
            <p class="text-xs text-gray-500">Complete</p>
          </div>
          <div class="text-center">
            <p class="text-2xl font-bold text-amber-400">{{ data.summary.daysRemaining }}</p>
            <p class="text-xs text-gray-500">Days Left</p>
          </div>
        </div>
      </div>
      <!-- Progress bar -->
      <div class="mt-4">
        <div class="h-3 bg-gray-700 rounded-full overflow-hidden">
          <div
            class="h-full bg-gradient-to-r from-primary-500 to-green-500 rounded-full transition-all duration-500"
            :style="{ width: `${data.summary.completionRate}%` }"
          />
        </div>
      </div>
    </div>

    <!-- Summary Metrics -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <MetricCard
        label="Total Reviews"
        :value="data?.summary.totalReviews ?? '-'"
        icon="heroicons:clipboard-document-list"
        color="primary"
        :loading="loading"
      />
      <MetricCard
        label="Completed"
        :value="data?.summary.completedReviews ?? '-'"
        icon="heroicons:check-circle"
        color="success"
        :loading="loading"
      />
      <MetricCard
        label="Completion Rate"
        :value="data ? `${data.summary.completionRate}%` : '-'"
        icon="heroicons:chart-pie"
        color="warning"
        :loading="loading"
      />
      <MetricCard
        label="Avg Rating"
        :value="data ? data.summary.averageRating.toFixed(1) : '-'"
        icon="heroicons:star"
        color="neutral"
        :loading="loading"
      />
    </div>

    <!-- Charts Row -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Completion by Phase -->
      <UCard class="bg-gray-900 ring-gray-800">
        <template #header>
          <h3 class="font-semibold text-white">Completion by Phase</h3>
        </template>
        <BarChart
          :labels="phaseLabels"
          :datasets="phaseDatasets"
          height="280px"
          :loading="loading"
          y-axis-label="Completion %"
        />
      </UCard>

      <!-- Completion by Department -->
      <UCard class="bg-gray-900 ring-gray-800">
        <template #header>
          <h3 class="font-semibold text-white">Completion by Department</h3>
        </template>
        <BarChart
          :labels="departmentLabels"
          :datasets="departmentDatasets"
          height="280px"
          :loading="loading"
          horizontal
        />
      </UCard>
    </div>

    <!-- Daily Completion Trend -->
    <UCard class="bg-gray-900 ring-gray-800">
      <template #header>
        <h3 class="font-semibold text-white">Daily Completion Progress</h3>
      </template>
      <LineChart
        :labels="trendLabels"
        :datasets="trendDatasets"
        height="250px"
        :loading="loading"
        y-axis-label="Cumulative %"
      />
    </UCard>

    <!-- Incomplete Reviews Table -->
    <UCard class="bg-gray-900 ring-gray-800">
      <template #header>
        <div class="flex items-center justify-between">
          <h3 class="font-semibold text-white">Incomplete Reviews</h3>
          <UBadge v-if="data?.incompleteReviews.length" color="error" variant="soft">
            {{ data.incompleteReviews.length }} pending
          </UBadge>
        </div>
      </template>

      <template v-if="loading">
        <div class="space-y-3">
          <USkeleton v-for="i in 5" :key="i" class="h-12 w-full" />
        </div>
      </template>

      <template v-else-if="data?.incompleteReviews.length">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="text-left text-sm text-gray-400 border-b border-gray-800">
                <th class="pb-3 font-medium">Employee</th>
                <th class="pb-3 font-medium">Department</th>
                <th class="pb-3 font-medium">Type</th>
                <th class="pb-3 font-medium">Status</th>
                <th class="pb-3 font-medium text-right">Overdue</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-800">
              <tr v-for="review in data.incompleteReviews" :key="review.reviewId">
                <td class="py-3">
                  <p class="font-medium text-white">{{ review.employeeName }}</p>
                  <p v-if="review.reviewerName" class="text-sm text-gray-500">
                    Reviewer: {{ review.reviewerName }}
                  </p>
                </td>
                <td class="py-3 text-gray-400">{{ review.department }}</td>
                <td class="py-3">
                  <span class="capitalize text-gray-300">{{ review.reviewType }}</span>
                </td>
                <td class="py-3">
                  <span
                    class="px-2 py-1 rounded-full text-xs font-medium"
                    :class="getStatusBadgeColor(review.status)"
                  >
                    {{ review.status.replace('_', ' ') }}
                  </span>
                </td>
                <td class="py-3 text-right">
                  <span
                    class="font-medium"
                    :class="review.daysOverdue > 3 ? 'text-red-400' : 'text-amber-400'"
                  >
                    {{ review.daysOverdue }} days
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </template>

      <template v-else>
        <div class="text-center py-8 text-gray-500">
          <UIcon name="heroicons:check-circle" class="w-12 h-12 mx-auto mb-3 text-green-500 opacity-70" />
          <p class="text-green-400">All reviews completed!</p>
        </div>
      </template>
    </UCard>
  </div>
</template>
