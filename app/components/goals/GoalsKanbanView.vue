<script setup lang="ts">
import type { GoalListItem, GoalStatus } from '~/types/goal'

const props = defineProps<{
  goals: GoalListItem[]
  searchQuery?: string
}>()

const emit = defineEmits<{
  goalClick: [goal: GoalListItem]
}>()

interface KanbanColumn {
  status: GoalStatus
  label: string
  color: string
  badgeColor: string
}

const columns: KanbanColumn[] = [
  { status: 'draft', label: 'Draft', color: 'border-gray-600', badgeColor: 'neutral' },
  { status: 'pending', label: 'Pending', color: 'border-blue-500', badgeColor: 'primary' },
  { status: 'active', label: 'Active', color: 'border-blue-500', badgeColor: 'primary' },
  { status: 'completed', label: 'Completed', color: 'border-green-500', badgeColor: 'success' },
  { status: 'cancelled', label: 'Cancelled', color: 'border-red-500', badgeColor: 'error' }
]

function getGoalsForColumn(status: GoalStatus): GoalListItem[] {
  return props.goals.filter(g => g.status === status)
}
</script>

<template>
  <div class="flex gap-4 overflow-x-auto pb-4">
    <div
      v-for="column in columns"
      :key="column.status"
      class="flex-shrink-0 min-w-[280px] flex flex-col"
    >
      <!-- Column Header -->
      <div class="flex items-center gap-2 mb-2 px-1">
        <span class="text-sm font-medium text-gray-300">{{ column.label }}</span>
        <UBadge :color="(column.badgeColor as any)" variant="subtle" size="xs">
          {{ getGoalsForColumn(column.status).length }}
        </UBadge>
      </div>

      <!-- Column Body -->
      <div
        class="bg-gray-900/50 rounded-lg p-2 min-h-[200px] flex flex-col gap-2"
        :class="`border-t-2 ${column.color}`"
      >
        <GoalsGoalCard
          v-for="goal in getGoalsForColumn(column.status)"
          :key="goal.id"
          :goal="goal"
          :search-query="searchQuery"
          @click="emit('goalClick', goal)"
        />

        <div
          v-if="getGoalsForColumn(column.status).length === 0"
          class="flex-1 flex items-center justify-center text-gray-600 text-sm"
        >
          No goals
        </div>
      </div>
    </div>
  </div>
</template>
