<script setup lang="ts">
import type { Employee, EmployeeGoalSummary, EmployeeReviewSummary, EmployeeTeamMember } from '~/types/employee'

interface Props {
  employee: Employee
  goals: EmployeeGoalSummary[]
  reviews: EmployeeReviewSummary[]
  directReports: EmployeeTeamMember[]
  isLoadingGoals?: boolean
  isLoadingReviews?: boolean
  isLoadingTeam?: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  viewEmployee: [id: string]
  tabChange: [tab: string]
}>()

// Current tab
const activeTab = ref('overview')

const tabs = [
  { id: 'overview', label: 'Overview', icon: 'i-heroicons-information-circle' },
  { id: 'goals', label: 'Goals', icon: 'i-heroicons-flag' },
  { id: 'reviews', label: 'Reviews', icon: 'i-heroicons-document-text' },
  { id: 'activity', label: 'Activity', icon: 'i-heroicons-clock' }
]

// Watch tab changes
watch(activeTab, (tab) => {
  emit('tabChange', tab)
})

// Goals from props
const goals = computed(() => props.goals || [])
const reviews = computed(() => props.reviews || [])

// Computed performance metrics
const performanceMetrics = computed(() => {
  const activeGoals = goals.value.filter(g => g.status === 'active')
  const avgProgress = activeGoals.length > 0
    ? Math.round(activeGoals.reduce((sum, g) => sum + g.progress, 0) / activeGoals.length)
    : 0

  const completedReviews = reviews.value.filter(r => r.status === 'submitted' || r.status === 'acknowledged')
  const latestRating = completedReviews.find(r => r.rating)?.rating

  return {
    activeGoalsCount: activeGoals.length,
    averageGoalProgress: avgProgress,
    currentRating: latestRating
  }
})

// Goal status helpers
const goalStatusColors: Record<string, string> = {
  active: 'bg-primary-500/10 text-primary-400 border-primary-500/20',
  completed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  cancelled: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  draft: 'bg-amber-500/10 text-amber-400 border-amber-500/20'
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return 'No date'
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}
</script>

<template>
  <div>
    <!-- Tab Navigation -->
    <div class="border-b border-gray-800 mb-6">
      <nav class="flex gap-4 -mb-px">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          class="flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors"
          :class="activeTab === tab.id
            ? 'border-primary-500 text-primary-400'
            : 'border-transparent text-gray-400 hover:text-white hover:border-gray-600'"
          @click="activeTab = tab.id"
        >
          <UIcon :name="tab.icon" class="w-4 h-4" />
          {{ tab.label }}
        </button>
      </nav>
    </div>

    <!-- Tab Content -->
    <div>
      <!-- Overview Tab -->
      <div v-if="activeTab === 'overview'" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Left Column: Personal & Professional Info -->
        <div class="lg:col-span-2">
          <EmployeesEmployeeProfileOverview :employee="employee" />
        </div>

        <!-- Right Column: Performance & Reporting -->
        <div class="space-y-6">
          <EmployeesEmployeePerformanceSummary
            :current-rating="performanceMetrics.currentRating"
            :active-goals-count="performanceMetrics.activeGoalsCount"
            :average-goal-progress="performanceMetrics.averageGoalProgress"
            :recent-reviews="reviews.slice(0, 3)"
            :is-loading="isLoadingReviews"
            @view-all-goals="activeTab = 'goals'"
            @view-all-reviews="activeTab = 'reviews'"
          />
          
          <EmployeesReportingStructure
            :employee="employee"
            :direct-reports="directReports"
            :is-loading="isLoadingTeam"
            @view-employee="emit('viewEmployee', $event)"
          />
        </div>
      </div>

      <!-- Goals Tab -->
      <div v-else-if="activeTab === 'goals'">
        <!-- Loading -->
        <div v-if="isLoadingGoals" class="space-y-4">
          <div v-for="i in 3" :key="i" class="animate-pulse bg-gray-900 border border-gray-800 rounded-lg p-4">
            <div class="h-5 w-48 bg-gray-800 rounded mb-2" />
            <div class="h-3 w-full bg-gray-800 rounded" />
          </div>
        </div>

        <!-- Empty -->
        <div v-else-if="goals.length === 0" class="text-center py-12 bg-gray-900 border border-gray-800 rounded-lg">
          <UIcon name="i-heroicons-flag" class="w-12 h-12 text-gray-700 mx-auto mb-3" />
          <h3 class="text-lg font-medium text-white mb-2">No goals yet</h3>
          <p class="text-gray-500">Goals assigned to this employee will appear here.</p>
        </div>

        <!-- Goals List -->
        <div v-else class="space-y-4">
          <div
            v-for="goal in goals"
            :key="goal.id"
            class="bg-gray-900 border border-gray-800 rounded-lg p-4 hover:border-gray-700 transition-colors"
          >
            <div class="flex items-start justify-between mb-3">
              <div>
                <h4 class="font-medium text-white">{{ goal.title }}</h4>
                <p class="text-sm text-gray-400 mt-0.5">
                  Due: {{ formatDate(goal.due_date) }}
                </p>
              </div>
              <span
                class="px-2.5 py-0.5 text-xs font-medium rounded-full border"
                :class="goalStatusColors[goal.status] || goalStatusColors.active"
              >
                {{ goal.status }}
              </span>
            </div>
            
            <div class="flex items-center gap-4">
              <div class="flex-1">
                <div class="flex items-center justify-between text-sm mb-1">
                  <span class="text-gray-500">Progress</span>
                  <span class="text-white">{{ goal.progress }}%</span>
                </div>
                <div class="w-full bg-gray-800 rounded-full h-2">
                  <div
                    class="h-2 rounded-full transition-all duration-300"
                    :class="goal.progress >= 100 ? 'bg-emerald-500' : 'bg-primary-500'"
                    :style="{ width: `${Math.min(goal.progress, 100)}%` }"
                  />
                </div>
              </div>
              <span class="text-sm text-gray-500">
                {{ goal.key_results_completed }}/{{ goal.key_results_count }} KRs
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Reviews Tab -->
      <div v-else-if="activeTab === 'reviews'">
        <!-- Loading -->
        <div v-if="isLoadingReviews" class="space-y-4">
          <div v-for="i in 3" :key="i" class="animate-pulse bg-gray-900 border border-gray-800 rounded-lg p-4">
            <div class="h-5 w-32 bg-gray-800 rounded mb-2" />
            <div class="h-3 w-48 bg-gray-800 rounded" />
          </div>
        </div>

        <!-- Empty -->
        <div v-else-if="reviews.length === 0" class="text-center py-12 bg-gray-900 border border-gray-800 rounded-lg">
          <UIcon name="i-heroicons-document-text" class="w-12 h-12 text-gray-700 mx-auto mb-3" />
          <h3 class="text-lg font-medium text-white mb-2">No reviews yet</h3>
          <p class="text-gray-500">Performance reviews will appear here.</p>
        </div>

        <!-- Reviews List -->
        <div v-else class="space-y-4">
          <div
            v-for="review in reviews"
            :key="review.id"
            class="bg-gray-900 border border-gray-800 rounded-lg p-4 hover:border-gray-700 transition-colors"
          >
            <div class="flex items-start justify-between">
              <div>
                <h4 class="font-medium text-white">{{ review.cycle.name }}</h4>
                <p class="text-sm text-gray-400 mt-0.5 capitalize">
                  {{ review.type }} review
                  <span v-if="review.reviewer">
                    by {{ review.reviewer.first_name }} {{ review.reviewer.last_name }}
                  </span>
                </p>
              </div>
              <div class="text-right">
                <span
                  class="px-2.5 py-0.5 text-xs font-medium rounded-full"
                  :class="{
                    'bg-emerald-500/10 text-emerald-400': review.status === 'submitted' || review.status === 'acknowledged',
                    'bg-amber-500/10 text-amber-400': review.status === 'pending'
                  }"
                >
                  {{ review.status }}
                </span>
                <p v-if="review.rating" class="text-lg font-semibold text-amber-400 mt-1">
                  {{ review.rating.toFixed(1) }} ★
                </p>
              </div>
            </div>
            <p v-if="review.submitted_at" class="text-xs text-gray-500 mt-2">
              Submitted {{ formatDate(review.submitted_at) }}
            </p>
          </div>
        </div>
      </div>

      <!-- Activity Tab -->
      <div v-else-if="activeTab === 'activity'" class="text-center py-12 bg-gray-900 border border-gray-800 rounded-lg">
        <UIcon name="i-heroicons-clock" class="w-12 h-12 text-gray-700 mx-auto mb-3" />
        <h3 class="text-lg font-medium text-white mb-2">Activity Timeline</h3>
        <p class="text-gray-500">Activity timeline feature coming soon.</p>
      </div>
    </div>
  </div>
</template>
