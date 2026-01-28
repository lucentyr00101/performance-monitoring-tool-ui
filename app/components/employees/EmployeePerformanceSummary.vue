<script setup lang="ts">
import type { EmployeeGoalSummary as _EmployeeGoalSummary, EmployeeReviewSummary } from '~/types/employee'

interface Props {
  currentRating?: number
  activeGoalsCount: number
  averageGoalProgress: number
  recentReviews: EmployeeReviewSummary[]
  isLoading?: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  viewAllGoals: []
  viewAllReviews: []
}>()

function getRatingStars(rating: number): string {
  const fullStars = Math.floor(rating)
  const hasHalf = rating % 1 >= 0.5
  const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0)
  
  return '★'.repeat(fullStars) + (hasHalf ? '½' : '') + '☆'.repeat(emptyStars)
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric'
  })
}
</script>

<template>
  <div class="space-y-6">
    <!-- Performance Summary Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <!-- Current Rating -->
      <div class="bg-gray-900 border border-gray-800 rounded-lg p-5">
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm font-medium text-gray-400">Current Rating</span>
          <UIcon name="i-heroicons-star" class="w-5 h-5 text-amber-400" />
        </div>
        <div v-if="currentRating" class="flex items-baseline gap-2">
          <span class="text-3xl font-bold text-white">{{ currentRating.toFixed(1) }}</span>
          <span class="text-gray-500">/5</span>
        </div>
        <p v-else class="text-gray-500">No rating yet</p>
        <p v-if="currentRating" class="text-amber-400 mt-1">
          {{ getRatingStars(currentRating) }}
        </p>
      </div>

      <!-- Active Goals -->
      <div class="bg-gray-900 border border-gray-800 rounded-lg p-5">
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm font-medium text-gray-400">Active Goals</span>
          <UIcon name="i-heroicons-flag" class="w-5 h-5 text-primary-400" />
        </div>
        <span class="text-3xl font-bold text-white">{{ activeGoalsCount }}</span>
        <div class="mt-2">
          <div class="flex items-center justify-between text-sm mb-1">
            <span class="text-gray-500">Avg Progress</span>
            <span class="text-white">{{ averageGoalProgress }}%</span>
          </div>
          <div class="w-full bg-gray-800 rounded-full h-2">
            <div
              class="bg-primary-500 h-2 rounded-full transition-all duration-300"
              :style="{ width: `${averageGoalProgress}%` }"
            />
          </div>
        </div>
        <button
          class="mt-3 text-sm text-primary-400 hover:text-primary-300 transition-colors flex items-center gap-1"
          @click="emit('viewAllGoals')"
        >
          View All Goals
          <UIcon name="i-heroicons-arrow-right" class="w-4 h-4" />
        </button>
      </div>

      <!-- Recent Reviews Summary -->
      <div class="bg-gray-900 border border-gray-800 rounded-lg p-5">
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm font-medium text-gray-400">Recent Reviews</span>
          <UIcon name="i-heroicons-document-text" class="w-5 h-5 text-emerald-400" />
        </div>
        <span class="text-3xl font-bold text-white">{{ recentReviews.length }}</span>
        <p class="text-sm text-gray-500 mt-1">completed this quarter</p>
        <button
          class="mt-3 text-sm text-primary-400 hover:text-primary-300 transition-colors flex items-center gap-1"
          @click="emit('viewAllReviews')"
        >
          View History
          <UIcon name="i-heroicons-arrow-right" class="w-4 h-4" />
        </button>
      </div>
    </div>

    <!-- Recent Reviews List -->
    <div class="bg-gray-900 border border-gray-800 rounded-lg p-5">
      <h3 class="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <UIcon name="i-heroicons-clipboard-document-list" class="w-5 h-5 text-gray-400" />
        Recent Reviews
      </h3>

      <!-- Loading -->
      <div v-if="isLoading" class="space-y-3">
        <div v-for="i in 3" :key="i" class="animate-pulse flex items-center gap-3">
          <div class="h-4 w-24 bg-gray-800 rounded" />
          <div class="h-4 w-16 bg-gray-800 rounded" />
          <div class="h-4 w-12 bg-gray-800 rounded ml-auto" />
        </div>
      </div>

      <!-- Empty -->
      <div v-else-if="recentReviews.length === 0" class="text-center py-8">
        <UIcon name="i-heroicons-document-text" class="w-12 h-12 text-gray-700 mx-auto mb-3" />
        <p class="text-gray-500">No reviews yet</p>
      </div>

      <!-- Reviews List -->
      <div v-else class="space-y-3">
        <div
          v-for="review in recentReviews.slice(0, 3)"
          :key="review.id"
          class="flex items-center justify-between py-2 border-b border-gray-800 last:border-0"
        >
          <div class="flex items-center gap-3">
            <span class="text-white font-medium">{{ review.cycle.name }}</span>
            <span
              class="px-2 py-0.5 text-xs rounded-full"
              :class="{
                'bg-emerald-500/10 text-emerald-400': review.status === 'submitted' || review.status === 'acknowledged',
                'bg-amber-500/10 text-amber-400': review.status === 'pending'
              }"
            >
              {{ review.status }}
            </span>
          </div>
          <div class="flex items-center gap-3">
            <span v-if="review.rating" class="text-amber-400">
              {{ review.rating.toFixed(1) }} ★
            </span>
            <span class="text-sm text-gray-500">
              {{ formatDate(review.submitted_at) }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
