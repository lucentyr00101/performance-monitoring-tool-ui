<script setup lang="ts">
import type { GoalProgressItem } from '~/types/dashboard'

defineProps<{
  title: string
  items: GoalProgressItem[]
  loading?: boolean
  viewAllLink?: string
  maxItems?: number
}>()

function getStatusColor(status: GoalProgressItem['status']): 'primary' | 'warning' | 'error' | 'success' {
  const colors: Record<GoalProgressItem['status'], 'primary' | 'warning' | 'error' | 'success'> = {
    on_track: 'primary',
    at_risk: 'warning',
    behind: 'error',
    completed: 'success'
  }
  return colors[status]
}

function getProgressColor(status: GoalProgressItem['status']): string {
  const colors: Record<GoalProgressItem['status'], string> = {
    on_track: 'bg-primary-500',
    at_risk: 'bg-amber-500',
    behind: 'bg-red-500',
    completed: 'bg-emerald-500'
  }
  return colors[status]
}

function getStatusLabel(status: GoalProgressItem['status']): string {
  const labels: Record<GoalProgressItem['status'], string> = {
    on_track: 'On Track',
    at_risk: 'At Risk',
    behind: 'Behind',
    completed: 'Completed'
  }
  return labels[status]
}
</script>

<template>
  <UCard class="bg-gray-900 ring-gray-800">
    <template #header>
      <div class="flex items-center justify-between">
        <h3 class="font-semibold text-white">{{ title }}</h3>
        <NuxtLink
          v-if="viewAllLink"
          :to="viewAllLink"
          class="text-sm text-primary-500 hover:text-primary-400 transition-colors"
        >
          View All →
        </NuxtLink>
      </div>
    </template>

    <!-- Loading skeleton -->
    <template v-if="loading">
      <div class="space-y-4">
        <div v-for="i in 3" :key="i" class="space-y-2">
          <div class="flex items-center justify-between">
            <USkeleton class="h-4 w-48" />
            <USkeleton class="h-4 w-12" />
          </div>
          <USkeleton class="h-2 w-full rounded-full" />
        </div>
      </div>
    </template>

    <!-- Empty state -->
    <template v-else-if="!items?.length">
      <div class="text-center py-8 text-gray-500">
        <UIcon name="i-heroicons-flag" class="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p>No goals to display</p>
        <p class="text-sm">Create a goal to get started</p>
      </div>
    </template>

    <!-- Content -->
    <template v-else>
      <div class="space-y-4 max-h-80 overflow-y-auto">
        <div
          v-for="item in items.slice(0, maxItems || 5)"
          :key="item.id"
          class="group"
        >
          <div class="flex items-start justify-between gap-2 mb-1.5">
            <p class="text-sm text-gray-200 line-clamp-1 group-hover:text-white transition-colors">
              {{ item.title }}
            </p>
            <div class="flex items-center gap-2 shrink-0">
              <UBadge :color="getStatusColor(item.status)" size="xs" variant="subtle">
                {{ getStatusLabel(item.status) }}
              </UBadge>
              <span class="text-sm font-medium text-white">{{ item.progress }}%</span>
            </div>
          </div>
          <div class="h-2 bg-gray-800 rounded-full overflow-hidden">
            <div
              class="h-full rounded-full transition-all duration-500"
              :class="getProgressColor(item.status)"
              :style="{ width: `${item.progress}%` }"
            />
          </div>
          <p v-if="item.daysRemaining !== undefined" class="text-xs text-gray-500 mt-1">
            {{ item.daysRemaining }} days remaining
          </p>
        </div>
      </div>
    </template>
  </UCard>
</template>
