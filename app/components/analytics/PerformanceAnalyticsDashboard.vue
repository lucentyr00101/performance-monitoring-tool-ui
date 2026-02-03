<script setup lang="ts">
import type { PerformanceAnalyticsData } from '~/types/analytics'

const props = withDefaults(defineProps<{
  data: PerformanceAnalyticsData | null
  loading?: boolean
}>(), {
  loading: false
})

// Prepare chart data
const trendLabels = computed(() =>
  props.data?.trend.map(t => t.period) || []
)

const trendDatasets = computed(() => [{
  label: 'Average Rating',
  data: props.data?.trend.map(t => t.averageRating) || [],
  color: '#3b82f6',
  fill: true
}])

const distributionLabels = computed(() =>
  props.data?.ratingDistribution.map(r => `${r.rating} Star${r.rating > 1 ? 's' : ''}`) || []
)

const distributionDatasets = computed(() => [{
  label: 'Employees',
  data: props.data?.ratingDistribution.map(r => r.count) || []
}])

const departmentLabels = computed(() =>
  props.data?.byDepartment.map(d => d.departmentName) || []
)

const departmentDatasets = computed(() => [{
  label: 'Average Rating',
  data: props.data?.byDepartment.map(d => d.averageRating) || [],
  color: '#10b981'
}])

// Trend indicator
const trendDirection = computed(() => props.data?.summary.ratingTrend || 'stable')
const trendIsPositive = computed(() => trendDirection.value === 'up')
</script>

<template>
  <div class="space-y-6">
    <!-- Summary Metrics -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <MetricCard
        label="Average Rating"
        :value="data ? data.summary.averageRating.toFixed(1) : '-'"
        icon="heroicons:star"
        color="warning"
        :trend="data ? {
          direction: trendDirection,
          value: `${data.summary.ratingChange >= 0 ? '+' : ''}${data.summary.ratingChange.toFixed(1)}`,
          isPositive: trendIsPositive
        } : undefined"
        :loading="loading"
      />
      <MetricCard
        label="Total Reviews"
        :value="data?.summary.totalReviews ?? '-'"
        icon="heroicons:clipboard-document-check"
        color="primary"
        :loading="loading"
      />
      <MetricCard
        label="Top Performers"
        :value="data?.summary.topPerformersCount ?? '-'"
        icon="heroicons:trophy"
        color="success"
        :loading="loading"
      />
      <MetricCard
        label="Needs Improvement"
        :value="data?.summary.improvementNeededCount ?? '-'"
        icon="heroicons:exclamation-triangle"
        color="error"
        :loading="loading"
      />
    </div>

    <!-- Charts Row 1 -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Rating Distribution -->
      <UCard class="bg-gray-900 ring-gray-800">
        <template #header>
          <h3 class="font-semibold text-white">Rating Distribution</h3>
        </template>
        <BarChart
          :labels="distributionLabels"
          :datasets="distributionDatasets"
          height="280px"
          :loading="loading"
          y-axis-label="Employees"
        />
      </UCard>

      <!-- Performance Trend -->
      <UCard class="bg-gray-900 ring-gray-800">
        <template #header>
          <h3 class="font-semibold text-white">Performance Trend</h3>
        </template>
        <LineChart
          :labels="trendLabels"
          :datasets="trendDatasets"
          height="280px"
          :loading="loading"
          y-axis-label="Average Rating"
        />
      </UCard>
    </div>

    <!-- Department Comparison -->
    <UCard class="bg-gray-900 ring-gray-800">
      <template #header>
        <h3 class="font-semibold text-white">Performance by Department</h3>
      </template>
      <BarChart
        :labels="departmentLabels"
        :datasets="departmentDatasets"
        height="280px"
        :loading="loading"
        horizontal
        y-axis-label="Rating"
      />
    </UCard>

    <!-- Top Performers List -->
    <UCard class="bg-gray-900 ring-gray-800">
      <template #header>
        <h3 class="font-semibold text-white">Top Performers</h3>
      </template>

      <template v-if="loading">
        <div class="space-y-3">
          <USkeleton v-for="i in 5" :key="i" class="h-16 w-full" />
        </div>
      </template>

      <template v-else-if="data?.topPerformers.length">
        <div class="divide-y divide-gray-800">
          <div
            v-for="(performer, index) in data.topPerformers"
            :key="performer.employeeId"
            class="flex items-center gap-4 py-3"
          >
            <!-- Rank -->
            <div
              class="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold"
              :class="{
                'bg-amber-500/20 text-amber-400': index === 0,
                'bg-gray-400/20 text-gray-300': index === 1,
                'bg-orange-500/20 text-orange-400': index === 2,
                'bg-gray-800 text-gray-500': index > 2
              }"
            >
              {{ index + 1 }}
            </div>

            <!-- Avatar placeholder -->
            <div class="flex-shrink-0 w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
              <span class="text-sm font-medium text-gray-300">
                {{ performer.employeeName.split(' ').map((n: string) => n[0]).join('') }}
              </span>
            </div>

            <!-- Info -->
            <div class="flex-1 min-w-0">
              <p class="font-medium text-white truncate">{{ performer.employeeName }}</p>
              <p class="text-sm text-gray-500">{{ performer.department }}</p>
            </div>

            <!-- Stats -->
            <div class="flex items-center gap-6 text-sm">
              <div class="text-center">
                <div class="flex items-center gap-1 text-amber-400">
                  <UIcon name="heroicons:star-solid" class="w-4 h-4" />
                  <span class="font-semibold">{{ performer.averageRating.toFixed(1) }}</span>
                </div>
                <p class="text-gray-500 text-xs">Rating</p>
              </div>
              <div class="text-center">
                <p class="font-semibold text-white">{{ performer.goalsCompleted }}</p>
                <p class="text-gray-500 text-xs">Goals</p>
              </div>
              <div class="text-center">
                <p class="font-semibold text-white">{{ performer.reviewCount }}</p>
                <p class="text-gray-500 text-xs">Reviews</p>
              </div>
            </div>
          </div>
        </div>
      </template>

      <template v-else>
        <div class="text-center py-8 text-gray-500">
          <UIcon name="heroicons:trophy" class="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No top performers data available</p>
        </div>
      </template>
    </UCard>
  </div>
</template>
