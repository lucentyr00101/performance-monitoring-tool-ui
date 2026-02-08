<script setup lang="ts">
import type { NotificationType, NotificationStatus } from '~/types/notification'

definePageMeta({
  layout: 'default',
  middleware: ['auth']
})

const notificationsStore = useNotificationsStore()
const { notifications, isLoading } = storeToRefs(notificationsStore)

const selectedType = ref<NotificationType | ''>('')
const selectedStatus = ref<NotificationStatus | ''>('')

const typeOptions = [
  { value: '', label: 'All Types' },
  { value: 'adhoc_review_triggered', label: 'Review Triggered' },
  { value: 'self_review_due', label: 'Self-Review Due' },
  { value: 'manager_review_due', label: 'Manager Review Due' },
  { value: 'review_reminder', label: 'Reminder' },
  { value: 'review_completed', label: 'Review Completed' },
  { value: 'goal_assigned', label: 'Goal Assigned' },
  { value: 'goal_due_soon', label: 'Goal Due Soon' },
  { value: 'system', label: 'System' }
]

const statusOptions = [
  { value: '', label: 'All' },
  { value: 'unread', label: 'Unread' },
  { value: 'read', label: 'Read' }
]

// Apply filters
watch([selectedType, selectedStatus], () => {
  const filters: Record<string, string> = {}
  if (selectedType.value) filters.type = selectedType.value
  if (selectedStatus.value) filters.status = selectedStatus.value
  notificationsStore.setFilters(filters)
  notificationsStore.fetchNotifications()
})

async function handleMarkRead(id: string) {
  await notificationsStore.markAsRead(id)
}

async function handleMarkAllRead() {
  await notificationsStore.markAllAsRead()
}

async function handlePageChange(page: number) {
  notificationsStore.setPage(page)
  await notificationsStore.fetchNotifications()
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

onMounted(() => {
  notificationsStore.fetchNotifications()
})
</script>

<template>
  <div class="px-4 py-8">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-white">Notifications</h1>
      <UButton
        v-if="notificationsStore.unreadCount > 0"
        variant="ghost"
        color="neutral"
        size="sm"
        @click="handleMarkAllRead"
      >
        Mark all as read
      </UButton>
    </div>

    <!-- Filters -->
    <div class="flex gap-4 mb-6">
      <USelect v-model="selectedType" :options="typeOptions" class="w-48" />
      <USelect v-model="selectedStatus" :options="statusOptions" class="w-36" />
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="space-y-3">
      <div v-for="i in 5" :key="i" class="bg-gray-900 border border-gray-800 rounded-lg p-4 animate-pulse">
        <div class="flex items-start gap-3">
          <div class="w-8 h-8 bg-gray-800 rounded-lg shrink-0" />
          <div class="flex-1 space-y-2">
            <div class="w-48 h-4 bg-gray-800 rounded" />
            <div class="w-full h-3 bg-gray-800 rounded" />
          </div>
        </div>
      </div>
    </div>

    <!-- Empty -->
    <div v-else-if="!notifications.length" class="text-center py-16">
      <UIcon name="i-heroicons-bell-slash" class="w-16 h-16 text-gray-600 mx-auto mb-4" />
      <h3 class="text-lg font-medium text-gray-400 mb-2">No notifications</h3>
      <p class="text-sm text-gray-500">You're all caught up!</p>
    </div>

    <!-- List -->
    <div v-else class="space-y-2">
      <div
        v-for="notification in notifications"
        :key="notification.id"
        class="bg-gray-900 border border-gray-800 rounded-lg p-4 hover:bg-gray-800/50 transition-colors cursor-pointer"
        :class="{ 'opacity-60': notification.status === 'read' }"
        @click="handleMarkRead(notification.id)"
      >
        <div class="flex items-start gap-3">
          <div class="w-2 h-2 mt-2 rounded-full shrink-0" :class="notification.status === 'unread' ? 'bg-primary-500' : 'bg-transparent'" />
          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between gap-2">
              <p class="text-sm font-medium text-white truncate">{{ notification.title }}</p>
              <span class="text-xs text-gray-500 shrink-0">{{ formatTimeAgo(notification.createdAt) }}</span>
            </div>
            <p class="text-sm text-gray-400 mt-1">{{ notification.message }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="notificationsStore.pagination.totalPages > 1" class="flex justify-center mt-6">
      <div class="flex items-center gap-2">
        <UButton
          variant="ghost"
          color="neutral"
          size="sm"
          :disabled="!notificationsStore.hasPreviousPage"
          @click="handlePageChange(notificationsStore.pagination.page - 1)"
        >
          Previous
        </UButton>
        <span class="text-sm text-gray-400">
          Page {{ notificationsStore.pagination.page }} of {{ notificationsStore.pagination.totalPages }}
        </span>
        <UButton
          variant="ghost"
          color="neutral"
          size="sm"
          :disabled="!notificationsStore.hasNextPage"
          @click="handlePageChange(notificationsStore.pagination.page + 1)"
        >
          Next
        </UButton>
      </div>
    </div>
  </div>
</template>
