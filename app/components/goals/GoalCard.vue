<script setup lang="ts">
import type { GoalListItem, ProgressIndicator } from '~/types/goal'

interface Props {
  goal: GoalListItem
  searchQuery?: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  click: [goal: GoalListItem]
}>()

const { calculateProgressIndicator, formatDueDate, isOverdue, getDaysRemaining } = useGoals()

// Highlight matching text in search results
function highlightMatch(text: string): string {
  if (!props.searchQuery || props.searchQuery.length < 2) return text
  const regex = new RegExp(`(${props.searchQuery})`, 'gi')
  return text.replace(regex, '<mark class="bg-primary-500/30 text-primary-300 rounded px-0.5">$1</mark>')
}

const progressIndicator = computed((): ProgressIndicator => {
  return calculateProgressIndicator(props.goal)
})

const daysLeft = computed(() => getDaysRemaining(props.goal))

const dueDateDisplay = computed(() => {
  if (props.goal.status === 'completed') return 'Completed'
  if (props.goal.status === 'cancelled') return 'Cancelled'
  
  if (isOverdue(props.goal)) {
    return `Overdue by ${Math.abs(daysLeft.value)} days`
  }
  
  if (daysLeft.value === 0) return 'Due today'
  if (daysLeft.value === 1) return 'Due tomorrow'
  if (daysLeft.value <= 7) return `${daysLeft.value} days left`
  
  return formatDueDate(props.goal.due_date)
})

const dueDateColor = computed(() => {
  if (props.goal.status === 'completed') return 'text-emerald-400'
  if (props.goal.status === 'cancelled') return 'text-gray-500'
  if (isOverdue(props.goal)) return 'text-red-400'
  if (daysLeft.value <= 7) return 'text-amber-400'
  return 'text-gray-400'
})
</script>

<template>
  <div
    class="group bg-gray-900 border border-gray-800 rounded-lg p-5 hover:border-gray-700 hover:bg-gray-900/80 transition-all duration-200 cursor-pointer hover:-translate-y-0.5"
    @click="emit('click', goal)"
  >
    <!-- Header: Type & Status -->
    <div class="flex items-center justify-between gap-2 mb-3">
      <GoalsGoalTypeBadge :type="goal.type" size="xs" />
      <GoalsGoalStatusBadge :status="goal.status" size="xs" />
    </div>

    <!-- Title -->
    <h3
      class="font-semibold text-white group-hover:text-primary-400 transition-colors line-clamp-2 mb-2"
      v-html="highlightMatch(goal.title)"
    />

    <!-- Description -->
    <p
      v-if="goal.description"
      class="text-sm text-gray-400 line-clamp-2 mb-4"
      v-html="highlightMatch(goal.description)"
    />

    <!-- Progress Bar -->
    <GoalsGoalProgressBar
      :progress="goal.progress"
      :indicator="progressIndicator"
      size="sm"
      class="mb-4"
    />

    <!-- Key Results Summary -->
    <div class="flex items-center gap-2 text-xs text-gray-400 mb-3">
      <UIcon name="i-heroicons-flag" class="w-3.5 h-3.5" />
      <span>{{ goal.key_results.completed }}/{{ goal.key_results.total }} Key Results</span>
    </div>

    <!-- Divider -->
    <div class="border-t border-gray-800 my-3" />

    <!-- Footer: Owner & Due Date -->
    <div class="flex items-center justify-between">
      <!-- Owner -->
      <div class="flex items-center gap-2">
        <UAvatar
          :src="goal.owner.avatar_url"
          :alt="goal.owner.name || `${goal.owner.first_name} ${goal.owner.last_name}`"
          size="xs"
        />
        <span class="text-xs text-gray-400 truncate max-w-[100px]">
          {{ goal.owner.name || `${goal.owner.first_name} ${goal.owner.last_name}` }}
        </span>
      </div>

      <!-- Due Date -->
      <div class="flex items-center gap-1" :class="dueDateColor">
        <UIcon name="i-heroicons-calendar" class="w-3.5 h-3.5" />
        <span class="text-xs">{{ dueDateDisplay }}</span>
      </div>
    </div>

    <!-- Priority indicator -->
    <div
      v-if="goal.priority === 'high'"
      class="absolute top-0 right-0 w-0 h-0 border-l-[16px] border-l-transparent border-t-[16px] border-t-red-500 rounded-tr-lg"
    />
  </div>
</template>
