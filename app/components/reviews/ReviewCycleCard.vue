<script setup lang="ts">
import type { ReviewCycleListItem } from '~/types/review'

interface Props {
  cycle: ReviewCycleListItem
  searchQuery?: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  click: [cycle: ReviewCycleListItem]
}>()

const { formatDate, getCycleDaysRemaining, isCycleOverdue } = useReviews()

// Highlight matching text in search results
function highlightMatch(text: string): string {
  if (!props.searchQuery || props.searchQuery.length < 2) return text
  const regex = new RegExp(`(${props.searchQuery})`, 'gi')
  return text.replace(regex, '<mark class="bg-primary-500/30 text-primary-300 rounded px-0.5">$1</mark>')
}

const daysLeft = computed(() => getCycleDaysRemaining(props.cycle))
const isOverdue = computed(() => isCycleOverdue(props.cycle))

const dateDisplay = computed(() => {
  if (props.cycle.status === 'completed') return 'Completed'
  if (props.cycle.status === 'cancelled') return 'Cancelled'
  if (props.cycle.status === 'draft') return 'Draft'
  
  if (isOverdue.value) {
    return `Overdue by ${Math.abs(daysLeft.value)} days`
  }
  
  if (daysLeft.value === 0) return 'Ends today'
  if (daysLeft.value === 1) return 'Ends tomorrow'
  if (daysLeft.value <= 7) return `${daysLeft.value} days left`
  
  return `Ends ${formatDate(props.cycle.end_date)}`
})

const dateColor = computed(() => {
  if (props.cycle.status === 'completed') return 'text-emerald-400'
  if (props.cycle.status === 'cancelled' || props.cycle.status === 'draft') return 'text-gray-500'
  if (isOverdue.value) return 'text-red-400'
  if (daysLeft.value <= 7) return 'text-amber-400'
  return 'text-gray-400'
})

const selfProgress = computed(() => {
  if (!props.cycle.stats.by_type?.self) return 0
  const { total, completed } = props.cycle.stats.by_type.self
  return total > 0 ? Math.round((completed / total) * 100) : 0
})

const managerProgress = computed(() => {
  if (!props.cycle.stats.by_type?.manager) return 0
  const { total, completed } = props.cycle.stats.by_type.manager
  return total > 0 ? Math.round((completed / total) * 100) : 0
})
</script>

<template>
  <div
    class="group bg-gray-900 border border-gray-800 rounded-lg p-5 hover:border-gray-700 hover:bg-gray-900/80 transition-all duration-200 cursor-pointer hover:-translate-y-0.5"
    @click="emit('click', cycle)"
  >
    <!-- Header: Type & Status -->
    <div class="flex items-center justify-between gap-2 mb-3">
      <ReviewsCycleTypeBadge :type="cycle.type" size="xs" />
      <ReviewsCycleStatusBadge :status="cycle.status" size="xs" />
    </div>

    <!-- Title -->
    <h3
      class="font-semibold text-white group-hover:text-primary-400 transition-colors line-clamp-2 mb-2"
      v-html="highlightMatch(cycle.name)"
    />

    <!-- Description -->
    <p
      v-if="cycle.description"
      class="text-sm text-gray-400 line-clamp-2 mb-4"
      v-html="highlightMatch(cycle.description)"
    />

    <!-- Progress Bars -->
    <div v-if="cycle.status === 'active'" class="space-y-3 mb-4">
      <!-- Self Assessment Progress -->
      <div>
        <div class="flex items-center justify-between text-xs mb-1">
          <span class="text-gray-400">Self Assessments</span>
          <span class="text-white">{{ selfProgress }}%</span>
        </div>
        <div class="h-1.5 bg-gray-800 rounded-full overflow-hidden">
          <div 
            class="h-full bg-blue-500 rounded-full transition-all duration-300"
            :style="{ width: `${selfProgress}%` }"
          />
        </div>
      </div>

      <!-- Manager Review Progress -->
      <div>
        <div class="flex items-center justify-between text-xs mb-1">
          <span class="text-gray-400">Manager Reviews</span>
          <span class="text-white">{{ managerProgress }}%</span>
        </div>
        <div class="h-1.5 bg-gray-800 rounded-full overflow-hidden">
          <div 
            class="h-full bg-purple-500 rounded-full transition-all duration-300"
            :style="{ width: `${managerProgress}%` }"
          />
        </div>
      </div>
    </div>

    <!-- Overall Progress for completed -->
    <div v-else-if="cycle.status === 'completed'" class="mb-4">
      <div class="flex items-center justify-between text-xs mb-1">
        <span class="text-gray-400">Completion Rate</span>
        <span class="text-emerald-400">{{ cycle.stats.completion_rate }}%</span>
      </div>
      <div class="h-1.5 bg-gray-800 rounded-full overflow-hidden">
        <div 
          class="h-full bg-emerald-500 rounded-full"
          :style="{ width: `${cycle.stats.completion_rate}%` }"
        />
      </div>
    </div>

    <!-- Stats -->
    <div class="flex items-center gap-4 text-xs text-gray-400 mb-3">
      <div class="flex items-center gap-1">
        <UIcon name="i-heroicons-document-text" class="w-3.5 h-3.5" />
        <span>{{ cycle.stats.total_reviews }} reviews</span>
      </div>
      <div v-if="cycle.stats.average_rating" class="flex items-center gap-1">
        <UIcon name="i-heroicons-star" class="w-3.5 h-3.5 text-yellow-400" />
        <span>{{ cycle.stats.average_rating.toFixed(1) }} avg</span>
      </div>
    </div>

    <!-- Divider -->
    <div class="border-t border-gray-800 my-3" />

    <!-- Footer: Dates -->
    <div class="flex items-center justify-between text-xs">
      <span class="text-gray-500">
        {{ formatDate(cycle.start_date) }} - {{ formatDate(cycle.end_date) }}
      </span>
      <span :class="dateColor">
        {{ dateDisplay }}
      </span>
    </div>
  </div>
</template>
