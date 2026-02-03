<script setup lang="ts">
import type { TeamAnalyticsData } from '~/types/analytics'

const props = withDefaults(defineProps<{
  data: TeamAnalyticsData | null
  loading?: boolean
}>(), {
  loading: false
})

// Prepare chart data for team goal progress
const goalLabels = computed(() =>
  props.data?.goalProgress.map(g => g.goalTitle.length > 25 ? g.goalTitle.substring(0, 25) + '...' : g.goalTitle) || []
)

const goalDatasets = computed(() => [{
  label: 'Progress',
  data: props.data?.goalProgress.map(g => g.progress) || [],
  color: '#3b82f6'
}])

// Comparison radar data
const comparisonLabels = computed(() => ['Avg Rating', 'Goal Completion'])

const comparisonDatasets = computed(() => {
  if (!props.data?.comparison) return []
  return [
    {
      label: 'Team',
      data: [
        (props.data.comparison.teamAvgRating / 5) * 100,
        props.data.comparison.teamGoalCompletion
      ],
      color: '#3b82f6'
    },
    {
      label: 'Department',
      data: [
        (props.data.comparison.departmentAvgRating / 5) * 100,
        props.data.comparison.departmentGoalCompletion
      ],
      color: '#10b981'
    }
  ]
})

// Get trend icon and color
function getTrendInfo(trend: 'up' | 'down' | 'stable') {
  switch (trend) {
    case 'up':
      return { icon: 'heroicons:arrow-trending-up', color: 'text-green-400' }
    case 'down':
      return { icon: 'heroicons:arrow-trending-down', color: 'text-red-400' }
    default:
      return { icon: 'heroicons:minus', color: 'text-gray-400' }
  }
}

// Get status color for goal
function getGoalStatusColor(status: string) {
  switch (status) {
    case 'completed': return 'text-green-400'
    case 'active': return 'text-blue-400'
    case 'at_risk': return 'text-amber-400'
    default: return 'text-gray-400'
  }
}

// Get progress bar color
function getProgressBarColor(progress: number) {
  if (progress >= 80) return 'bg-green-500'
  if (progress >= 50) return 'bg-amber-500'
  return 'bg-red-500'
}
</script>

<template>
  <div class="space-y-6">
    <!-- Summary Metrics -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <MetricCard
        label="Team Size"
        :value="data?.summary.teamSize ?? '-'"
        icon="heroicons:users"
        color="primary"
        :loading="loading"
      />
      <MetricCard
        label="Avg Goal Completion"
        :value="data ? `${data.summary.averageGoalCompletion}%` : '-'"
        icon="heroicons:flag"
        color="success"
        :loading="loading"
      />
      <MetricCard
        label="Avg Rating"
        :value="data ? data.summary.averageRating.toFixed(1) : '-'"
        icon="heroicons:star"
        color="warning"
        :loading="loading"
      />
      <MetricCard
        label="Goals At Risk"
        :value="data?.summary.goalsAtRisk ?? '-'"
        icon="heroicons:exclamation-triangle"
        color="error"
        :loading="loading"
      />
    </div>

    <!-- Team vs Department Comparison -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Comparison Stats -->
      <UCard class="bg-gray-900 ring-gray-800 lg:col-span-1">
        <template #header>
          <h3 class="font-semibold text-white">Team vs Department</h3>
        </template>

        <template v-if="loading">
          <div class="space-y-4">
            <USkeleton v-for="i in 4" :key="i" class="h-12 w-full" />
          </div>
        </template>

        <template v-else-if="data?.comparison">
          <div class="space-y-4">
            <div>
              <div class="flex justify-between text-sm mb-1">
                <span class="text-gray-400">Team Avg Rating</span>
                <span class="text-white font-medium">{{ data.comparison.teamAvgRating.toFixed(1) }}</span>
              </div>
              <div class="flex justify-between text-sm mb-1">
                <span class="text-gray-400">Department Avg</span>
                <span class="text-gray-500">{{ data.comparison.departmentAvgRating.toFixed(1) }}</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-gray-400">Company Avg</span>
                <span class="text-gray-500">{{ data.comparison.companyAvgRating.toFixed(1) }}</span>
              </div>
            </div>
            <div class="border-t border-gray-800 pt-4">
              <div class="flex justify-between text-sm mb-1">
                <span class="text-gray-400">Team Goal Completion</span>
                <span class="text-white font-medium">{{ data.comparison.teamGoalCompletion }}%</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-gray-400">Department Avg</span>
                <span class="text-gray-500">{{ data.comparison.departmentGoalCompletion }}%</span>
              </div>
            </div>
          </div>
        </template>
      </UCard>

      <!-- Team Goals Progress -->
      <UCard class="bg-gray-900 ring-gray-800 lg:col-span-2">
        <template #header>
          <h3 class="font-semibold text-white">Team Goal Progress</h3>
        </template>
        <BarChart
          :labels="goalLabels"
          :datasets="goalDatasets"
          height="250px"
          :loading="loading"
          horizontal
          y-axis-label="Progress %"
        />
      </UCard>
    </div>

    <!-- Team Members -->
    <UCard class="bg-gray-900 ring-gray-800">
      <template #header>
        <h3 class="font-semibold text-white">Team Member Performance</h3>
      </template>

      <template v-if="loading">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <USkeleton v-for="i in 8" :key="i" class="h-32 w-full" />
        </div>
      </template>

      <template v-else-if="data?.teamMembers.length">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div
            v-for="member in data.teamMembers"
            :key="member.employeeId"
            class="bg-gray-800 rounded-lg p-4"
          >
            <div class="flex items-start gap-3">
              <!-- Avatar -->
              <div class="flex-shrink-0 w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
                <span class="text-sm font-medium text-gray-300">
                  {{ member.employeeName.split(' ').map((n: string) => n[0]).join('') }}
                </span>
              </div>
              <!-- Info -->
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2">
                  <p class="font-medium text-white truncate">{{ member.employeeName }}</p>
                  <UIcon
                    :name="getTrendInfo(member.performanceTrend).icon"
                    :class="['w-4 h-4', getTrendInfo(member.performanceTrend).color]"
                  />
                </div>
                <p class="text-xs text-gray-500">{{ member.jobTitle }}</p>
              </div>
            </div>

            <!-- Stats -->
            <div class="mt-3 space-y-2">
              <!-- Goal Progress -->
              <div>
                <div class="flex justify-between text-xs mb-1">
                  <span class="text-gray-400">Goal Progress</span>
                  <span class="text-white">{{ member.goalProgress }}%</span>
                </div>
                <div class="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    class="h-full rounded-full transition-all"
                    :class="getProgressBarColor(member.goalProgress)"
                    :style="{ width: `${member.goalProgress}%` }"
                  />
                </div>
              </div>
              <!-- Stats row -->
              <div class="flex justify-between text-xs pt-1">
                <span class="text-gray-500">
                  {{ member.goalsCompleted }}/{{ member.goalsTotal }} goals
                </span>
                <span v-if="member.lastReviewRating" class="flex items-center gap-1 text-amber-400">
                  <UIcon name="heroicons:star-solid" class="w-3 h-3" />
                  {{ member.lastReviewRating.toFixed(1) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </template>

      <template v-else>
        <div class="text-center py-8 text-gray-500">
          <UIcon name="heroicons:users" class="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No team members found</p>
        </div>
      </template>
    </UCard>

    <!-- Active Team Goals -->
    <UCard class="bg-gray-900 ring-gray-800">
      <template #header>
        <h3 class="font-semibold text-white">Active Team Goals</h3>
      </template>

      <template v-if="loading">
        <div class="space-y-3">
          <USkeleton v-for="i in 4" :key="i" class="h-16 w-full" />
        </div>
      </template>

      <template v-else-if="data?.goalProgress.length">
        <div class="divide-y divide-gray-800">
          <div
            v-for="goal in data.goalProgress"
            :key="goal.goalId"
            class="py-3"
          >
            <div class="flex items-start justify-between gap-4">
              <div class="flex-1 min-w-0">
                <p class="font-medium text-white">{{ goal.goalTitle }}</p>
                <div class="flex items-center gap-2 text-sm text-gray-500 mt-1">
                  <span class="capitalize">{{ goal.goalType }}</span>
                  <span>·</span>
                  <span>Due {{ new Date(goal.dueDate).toLocaleDateString() }}</span>
                </div>
              </div>
              <div class="text-right">
                <p class="font-semibold" :class="getGoalStatusColor(goal.status)">
                  {{ goal.progress }}%
                </p>
                <p class="text-xs text-gray-500 capitalize">{{ goal.status }}</p>
              </div>
            </div>
            <div class="mt-2 h-2 bg-gray-800 rounded-full overflow-hidden">
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
          <p>No active team goals</p>
        </div>
      </template>
    </UCard>
  </div>
</template>
