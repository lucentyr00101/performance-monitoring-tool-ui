<script setup lang="ts">
import type { PendingAction } from '~/types/dashboard'

defineProps<{
  title: string
  actions: PendingAction[]
  loading?: boolean
  viewAllLink?: string
  maxItems?: number
}>()

const emit = defineEmits<{
  action: [actionId: string, action: string]
}>()

function getTypeIcon(type: PendingAction['type']): string {
  const icons: Record<PendingAction['type'], string> = {
    goal_approval: 'i-heroicons-flag',
    review_pending: 'i-heroicons-document-text',
    feedback_request: 'i-heroicons-chat-bubble-left-right'
  }
  return icons[type]
}

function getTypeColor(type: PendingAction['type']): string {
  const colors: Record<PendingAction['type'], string> = {
    goal_approval: 'primary',
    review_pending: 'amber',
    feedback_request: 'emerald'
  }
  return colors[type]
}

function handleAction(actionId: string, action: string) {
  emit('action', actionId, action)
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  return date.toLocaleDateString()
}
</script>

<template>
  <UCard class="bg-gray-900 ring-gray-800">
    <template #header>
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <h3 class="font-semibold text-white">{{ title }}</h3>
          <UBadge v-if="actions?.length" color="error" size="xs">
            {{ actions.length }}
          </UBadge>
        </div>
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
        <div v-for="i in 3" :key="i" class="flex items-start gap-3">
          <USkeleton class="w-10 h-10 rounded-lg shrink-0" />
          <div class="flex-1 space-y-2">
            <USkeleton class="h-4 w-48" />
            <USkeleton class="h-3 w-32" />
          </div>
          <USkeleton class="h-8 w-20" />
        </div>
      </div>
    </template>

    <!-- Empty state -->
    <template v-else-if="!actions?.length">
      <div class="text-center py-8 text-gray-500">
        <UIcon name="i-heroicons-check-circle" class="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p>No pending actions</p>
        <p class="text-sm">You're all caught up!</p>
      </div>
    </template>

    <!-- Content -->
    <template v-else>
      <div class="space-y-4 max-h-96 overflow-y-auto">
        <div
          v-for="action in actions.slice(0, maxItems || 5)"
          :key="action.id"
          class="flex items-start gap-3 p-3 -mx-3 rounded-lg hover:bg-gray-800/50 transition-colors"
        >
          <!-- Type icon -->
          <div
            class="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
            :class="`bg-${getTypeColor(action.type)}-500/10`"
          >
            <UIcon
              :name="getTypeIcon(action.type)"
              class="w-5 h-5"
              :class="`text-${getTypeColor(action.type)}-500`"
            />
          </div>

          <!-- Content -->
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-white truncate">
              {{ action.title }}
            </p>
            <p class="text-xs text-gray-400 truncate">
              {{ action.employeeName }} • {{ formatTimeAgo(action.createdAt) }}
            </p>
          </div>

          <!-- Actions -->
          <div class="flex items-center gap-2 shrink-0">
            <UButton
              v-if="action.actions.primary"
              size="xs"
              :color="action.type === 'goal_approval' ? 'primary' : 'neutral'"
              @click="handleAction(action.id, action.actions.primary.action)"
            >
              {{ action.actions.primary.label }}
            </UButton>
            <UButton
              v-if="action.actions.secondary"
              size="xs"
              variant="ghost"
              color="neutral"
              @click="handleAction(action.id, action.actions.secondary.action)"
            >
              {{ action.actions.secondary.label }}
            </UButton>
          </div>
        </div>
      </div>
    </template>
  </UCard>
</template>
