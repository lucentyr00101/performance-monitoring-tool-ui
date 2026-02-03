<script setup lang="ts">
import type { EmployeeAnalyticsData } from '~/types/analytics'

const props = withDefaults(defineProps<{
  data: EmployeeAnalyticsData | null
  loading?: boolean
}>(), {
  loading: false
})

// Prepare chart data
const goalTrendLabels = computed(() =>
  props.data?.goalCompletionTrend.map(t => {
    const [year, month] = t.date.split('-')
    return new Date(Number(year), Number(month) - 1).toLocaleDateString('en-US', { month: 'short' })
  }) || []
)

const goalTrendDatasets = computed(() => [{
  label: 'Goals Completed',
  data: props.data?.goalCompletionTrend.map(t => t.value) || [],
  color: '#10b981',
  fill: true
}])

const ratingLabels = computed(() =>
  props.data?.ratingHistory.map(r => r.period) || []
)

const ratingDatasets = computed(() => [{
  label: 'Performance Rating',
  data: props.data?.ratingHistory.map(r => r.rating) || [],
  color: '#f59e0b',
  fill: true
}])

const statusLabels = computed(() => ['Active', 'Completed', 'Draft', 'Pending', 'Cancelled'])

const statusData = computed(() => props.data ? [
  props.data.goalsByStatus.active,
  props.data.goalsByStatus.completed,
  props.data.goalsByStatus.draft,
  props.data.goalsByStatus.pending,
  props.data.goalsByStatus.cancelled
] : [])

// Get status color
function getStatusColor(status: string) {
  switch (status) {
    case 'completed': return 'text-green-400'
    case 'active': return 'text-blue-400'
    case 'draft': return 'text-gray-400'
    case 'pending': return 'text-amber-400'
    default: return 'text-gray-400'
  }
}

// Get progress bar color
function getProgressBarColor(progress: number) {
  if (progress >= 80) return 'bg-green-500'
  if (progress >= 50) return 'bg-amber-500'
  return 'bg-blue-500'
}

// Trend indicator
const trendDirection = computed(() => props.data?.summary.ratingTrend || 'stable')
const trendIsPositive = computed(() => trendDirection.value === 'up')
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
        label="Completed"
        :value="data?.summary.completedGoals ?? '-'"
        icon="heroicons:check-circle"
        color="success"
        :loading="loading"
      />
      <MetricCard
        label="Completion Rate"
        :value="data ? `${data.summary.goalCompletionRate}%` : '-'"
        icon="heroicons:chart-pie"
        color="warning"
        :loading="loading"
      />
      <MetricCard
        label="Avg Rating"
        :value="data ? data.summary.averageRating.toFixed(1) : '-'"
        icon="heroicons:star"
        color="neutral"
        :trend="data ? {
          direction: trendDirection,
          value: trendIsPositive ? '+0.3' : '-0.1',
          isPositive: trendIsPositive
        } : undefined"
        :loading="loading"
      />
    </div>

    <!-- Streak Banner -->
    <div
      v-if="data?.summary.currentStreak && data.summary.currentStreak > 0 && !loading"
      class="bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-lg p-4"
    >
      <div class="flex items-center gap-3">
        <div class="p-2 bg-amber-500/20 rounded-lg">
          <UIcon name="heroicons:fire" class="w-6 h-6 text-amber-400" />
        </div>
        <div>
          <p class="font-semibold text-white">{{ data.summary.currentStreak }} Quarter Streak!</p>
          <p class="text-sm text-amber-200/80">You've met your goals for {{ data.summary.currentStreak }} consecutive quarters</p>
        </div>
      </div>
    </div>

    <!-- Charts Row -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Goal Completion Trend -->
      <UCard class="bg-gray-900 ring-gray-800">
        <template #header>
          <h3 class="font-semibold text-white">Goal Completion Trend</h3>
        </template>
        <LineChart
          :labels="goalTrendLabels"
          :datasets="goalTrendDatasets"
          height="280px"
          :loading="loading"
          y-axis-label="Cumulative Goals"
        />
      </UCard>

      <!-- Rating History -->
      <UCard class="bg-gray-900 ring-gray-800">
        <template #header>
          <h3 class="font-semibold text-white">Performance Rating History</h3>
        </template>
        <LineChart
          :labels="ratingLabels"
          :datasets="ratingDatasets"
          height="280px"
          :loading="loading"
          y-axis-label="Rating"
        />
      </UCard>
    </div>

    <!-- Goals by Status -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <UCard class="bg-gray-900 ring-gray-800">
        <template #header>
          <h3 class="font-semibold text-white">Goals by Status</h3>
        </template>
        <DoughnutChart
          :labels="statusLabels"
          :data="statusData"
          :colors="['#3b82f6', '#10b981', '#6b7280', '#eab308', '#ef4444']"
          height="250px"
          :loading="loading"
          :center-value="data?.summary.totalGoals"
          center-text="Total"
        />
      </UCard>

      <!-- My Goals List -->
      <UCard class="bg-gray-900 ring-gray-800 lg:col-span-2">
        <template #header>
          <h3 class="font-semibold text-white">My Goals</h3>
        </template>

        <template v-if="loading">
          <div class="space-y-3">
            <USkeleton v-for="i in 4" :key="i" class="h-16 w-full" />
          </div>
        </template>

        <template v-else-if="data?.goals.length">
          <div class="divide-y divide-gray-800 max-h-80 overflow-y-auto">
            <div
              v-for="goal in data.goals"
              :key="goal.goalId"
              class="py-3"
            >
              <div class="flex items-start justify-between gap-4">
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2">
                    <UIcon
                      v-if="goal.status === 'completed'"
                      name="heroicons:check-circle-solid"
                      class="w-4 h-4 text-green-400 flex-shrink-0"
                    />
                    <p class="font-medium text-white truncate">{{ goal.title }}</p>
                  </div>
                  <div class="flex items-center gap-2 text-sm text-gray-500 mt-1">
                    <span class="capitalize">{{ goal.type }}</span>
                    <span>·</span>
                    <span>Due {{ new Date(goal.dueDate).toLocaleDateString() }}</span>
                    <span>·</span>
                    <span>{{ goal.keyResultsCompleted }}/{{ goal.keyResultsTotal }} KRs</span>
                  </div>
                </div>
                <div class="text-right">
                  <p class="font-semibold" :class="getStatusColor(goal.status)">
                    {{ goal.progress }}%
                  </p>
                  <p class="text-xs text-gray-500 capitalize">{{ goal.status }}</p>
                </div>
              </div>
              <div v-if="goal.status !== 'completed'" class="mt-2 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                <div
                  class="h-full rounded-full transition-all"
                  :class="getProgressBarColor(goal.progress)"
                  :style="{ width: `${goal.progress}%` }"
                />
              </div>
            </div>
          </div>
        </template>

        <template v-else>
          <div class="text-center py-8 text-gray-500">
            <UIcon name="heroicons:flag" class="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No goals found</p>
          </div>
        </template>
      </UCard>
    </div>

    <!-- Review History -->
    <UCard class="bg-gray-900 ring-gray-800">
      <template #header>
        <h3 class="font-semibold text-white">Review History</h3>
      </template>

      <template v-if="loading">
        <div class="space-y-3">
          <USkeleton v-for="i in 4" :key="i" class="h-12 w-full" />
        </div>
      </template>

      <template v-else-if="data?.reviews.length">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="text-left text-sm text-gray-400 border-b border-gray-800">
                <th class="pb-3 font-medium">Period</th>
                <th class="pb-3 font-medium">Cycle</th>
                <th class="pb-3 font-medium">Type</th>
                <th class="pb-3 font-medium text-center">Rating</th>
                <th class="pb-3 font-medium text-right">Submitted</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-800">
              <tr v-for="review in data.reviews" :key="review.reviewId">
                <td class="py-3 font-medium text-white">{{ review.period }}</td>
                <td class="py-3 text-gray-400">{{ review.cycleName }}</td>
                <td class="py-3">
                  <span class="capitalize text-gray-300">{{ review.reviewType }}</span>
                </td>
                <td class="py-3 text-center">
                  <span v-if="review.rating" class="flex items-center justify-center gap-1 text-amber-400">
                    <UIcon name="heroicons:star-solid" class="w-4 h-4" />
                    {{ review.rating.toFixed(1) }}
                  </span>
                  <span v-else class="text-gray-500">-</span>
                </td>
                <td class="py-3 text-right text-gray-500">
                  {{ review.submittedAt ? new Date(review.submittedAt).toLocaleDateString() : '-' }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </template>

      <template v-else>
        <div class="text-center py-8 text-gray-500">
          <UIcon name="heroicons:clipboard-document-list" class="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No review history found</p>
        </div>
      </template>
    </UCard>
  </div>
</template>
