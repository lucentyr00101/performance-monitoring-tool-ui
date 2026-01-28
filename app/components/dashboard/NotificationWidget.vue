<script setup lang="ts">
import type { NotificationItem } from '~/types/dashboard'

const props = defineProps<{
  title?: string
  notifications: NotificationItem[]
  loading?: boolean
  viewAllLink?: string
  maxItems?: number
}>()

const emit = defineEmits<{
  markRead: [notificationId: string]
}>()

function getTypeIcon(type: NotificationItem['type']): string {
  const icons: Record<NotificationItem['type'], string> = {
    review_reminder: 'i-heroicons-bell-alert',
    goal_update: 'i-heroicons-flag',
    feedback: 'i-heroicons-chat-bubble-left-right',
    approval: 'i-heroicons-check-circle',
    system: 'i-heroicons-cog-6-tooth'
  }
  return icons[type]
}

function getTypeColor(type: NotificationItem['type']): string {
  const colors: Record<NotificationItem['type'], string> = {
    review_reminder: 'amber',
    goal_update: 'primary',
    feedback: 'emerald',
    approval: 'cyan',
    system: 'gray'
  }
  return colors[type]
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  
  if (diffHours < 1) return 'Just now'
  if (diffHours < 24) return `${diffHours}h ago`
  const diffDays = Math.floor(diffHours / 24)
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  return date.toLocaleDateString()
}

function handleMarkRead(notificationId: string) {
  emit('markRead', notificationId)
}

const unreadCount = computed(() => {
  return props.notifications?.filter(n => !n.isRead).length || 0
})
</script>

<template>
  <UCard class="bg-gray-900 ring-gray-800">
    <template #header>
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <h3 class="font-semibold text-white">{{ title || 'Notifications' }}</h3>
          <UBadge v-if="unreadCount > 0" color="error" size="xs">
            {{ unreadCount }}
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
          <USkeleton class="w-8 h-8 rounded-lg shrink-0" />
          <div class="flex-1 space-y-2">
            <USkeleton class="h-4 w-40" />
            <USkeleton class="h-3 w-full" />
          </div>
        </div>
      </div>
    </template>

    <!-- Empty state -->
    <template v-else-if="!notifications?.length">
      <div class="text-center py-8 text-gray-500">
        <UIcon name="i-heroicons-bell-slash" class="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p>No notifications</p>
        <p class="text-sm">You're all caught up!</p>
      </div>
    </template>

    <!-- Content -->
    <template v-else>
      <div class="space-y-1 max-h-80 overflow-y-auto">
        <component
          :is="notification.link ? 'NuxtLink' : 'div'"
          v-for="notification in notifications.slice(0, maxItems || 5)"
          :key="notification.id"
          :to="notification.link"
          class="flex items-start gap-3 p-2 -mx-2 rounded-lg hover:bg-gray-800/50 transition-colors group cursor-pointer"
          :class="{ 'opacity-60': notification.isRead }"
          @click="handleMarkRead(notification.id)"
        >
          <!-- Type icon -->
          <div
            class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            :class="`bg-${getTypeColor(notification.type)}-500/10`"
          >
            <UIcon
              :name="getTypeIcon(notification.type)"
              class="w-4 h-4"
              :class="`text-${getTypeColor(notification.type)}-500`"
            />
          </div>

          <!-- Content -->
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2">
              <p class="text-sm font-medium text-gray-200 group-hover:text-white transition-colors truncate">
                {{ notification.title }}
              </p>
              <div v-if="!notification.isRead" class="w-2 h-2 bg-primary-500 rounded-full shrink-0" />
            </div>
            <p class="text-xs text-gray-400 line-clamp-2 mt-0.5">
              {{ notification.message }}
            </p>
            <p class="text-xs text-gray-500 mt-1">
              {{ formatTimeAgo(notification.createdAt) }}
            </p>
          </div>
        </component>
      </div>
    </template>
  </UCard>
</template>
