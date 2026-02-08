<script setup lang="ts">
import type { AdhocReviewListItem } from '~/types/adhoc-review'

type BadgeColor = 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error' | 'neutral'

const props = defineProps<{
  review: AdhocReviewListItem
  variant?: 'default' | 'compact'
}>()

const emit = defineEmits<{
  view: [id: string]
  remind: [id: string]
  cancel: [id: string]
}>()

const adhocReviewsStore = useAdhocReviewsStore()

// Default status config
const defaultStatusConfig = { label: 'In Progress', color: 'info' as BadgeColor, icon: 'i-heroicons-clock' }

// Status badge config
const statusConfig = computed(() => {
  const configs: Record<string, { label: string; color: BadgeColor; icon: string }> = {
    initiated: { label: 'In Progress', color: 'info', icon: 'i-heroicons-clock' },
    pending_acknowledgment: { label: 'Pending Acknowledgment', color: 'warning', icon: 'i-heroicons-eye' },
    completed: { label: 'Completed', color: 'success', icon: 'i-heroicons-check-circle' },
    cancelled: { label: 'Cancelled', color: 'neutral', icon: 'i-heroicons-x-circle' }
  }
  return configs[props.review.status] ?? defaultStatusConfig
})

// Employee name
const employeeName = computed(() => {
  if (!props.review.employee) return 'Unknown Employee'
  if (!props.review.employee) return 'Unknown Employee'
  return `${props.review.employee.firstName || ''} ${props.review.employee.lastName || ''}`.trim() || 'Unknown Employee'
})

// Triggered by name
const triggeredByName = computed(() => {
  if (!props.review.triggeredBy) return 'Unknown User'
  if (!props.review.triggeredBy) return 'Unknown User'
  return `${props.review.triggeredBy.firstName || ''} ${props.review.triggeredBy.lastName || ''}`.trim() || 'Unknown User'
})

// Days remaining
const daysRemaining = computed(() => adhocReviewsStore.getDaysRemaining(props.review))

const isOverdue = computed(() => adhocReviewsStore.isOverdue(props.review))

// Badge color computed
const badgeColor = computed((): BadgeColor => isOverdue.value ? 'error' : (statusConfig.value?.color ?? 'info'))

// Review progress
const selfReviewDone = computed(() => props.review.selfReviewStatus === 'submitted')
const managerReviewDone = computed(() => props.review.managerReviewStatus === 'submitted')

// Due date formatted
const dueDateFormatted = computed(() => {
  const date = new Date(props.review.dueDate)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
})

// Triggered date formatted
const triggeredDateFormatted = computed(() => {
  const date = new Date(props.review.triggeredAt)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
})

function handleView() {
  emit('view', props.review.id)
}

function handleRemind() {
  emit('remind', props.review.id)
}

function handleCancel() {
  emit('cancel', props.review.id)
}
</script>

<template>
  <div
    class="bg-gray-900 border border-gray-800 rounded-lg p-4 hover:border-gray-700 transition-colors cursor-pointer"
    :class="{ 'border-red-500/50': isOverdue }"
    @click="handleView"
  >
    <!-- Compact variant -->
    <template v-if="variant === 'compact'">
      <div class="flex items-center justify-between gap-3">
        <div class="flex items-center gap-3 min-w-0">
          <UAvatar
            :alt="employeeName"
            size="sm"
          />
          <div class="min-w-0">
            <div class="font-medium text-white truncate">
              {{ employeeName }}
            </div>
            <div class="text-xs text-gray-400">
              Due: {{ dueDateFormatted }}
            </div>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <div class="flex gap-1">
            <UIcon
              name="i-heroicons-user"
              class="w-4 h-4"
              :class="selfReviewDone ? 'text-green-400' : 'text-gray-500'"
            />
            <UIcon
              name="i-heroicons-user-group"
              class="w-4 h-4"
              :class="managerReviewDone ? 'text-green-400' : 'text-gray-500'"
            />
          </div>
          <UBadge
            :color="badgeColor"
            variant="subtle"
            size="xs"
          >
            {{ isOverdue ? 'Overdue' : statusConfig?.label ?? 'In Progress' }}
          </UBadge>
        </div>
      </div>
    </template>

    <!-- Default variant -->
    <template v-else>
      <!-- Header -->
      <div class="flex items-start justify-between gap-3 mb-3">
        <div class="flex items-center gap-3">
          <UAvatar
            :alt="employeeName"
            size="md"
          />
          <div>
            <div class="font-medium text-white">
              {{ employeeName }}
            </div>
            <div class="text-sm text-gray-400">
              {{ review.employee?.jobTitle }} • {{ review.employee?.department?.name }}
            </div>
          </div>
        </div>
        <UBadge
          :color="badgeColor"
          variant="subtle"
        >
          <UIcon :name="statusConfig?.icon ?? 'i-heroicons-clock'" class="w-3 h-3 mr-1" />
          {{ isOverdue ? 'Overdue' : statusConfig?.label ?? 'In Progress' }}
        </UBadge>
      </div>

      <!-- Reason -->
      <p v-if="review.reason" class="text-sm text-gray-400 mb-3 line-clamp-2">
        {{ review.reason }}
      </p>

      <!-- Review Progress -->
      <div class="flex items-center gap-4 mb-3">
        <div class="flex items-center gap-2 text-sm">
          <UIcon
            :name="selfReviewDone ? 'i-heroicons-check-circle-solid' : 'i-heroicons-clock'"
            class="w-4 h-4"
            :class="selfReviewDone ? 'text-green-400' : 'text-gray-500'"
          />
          <span :class="selfReviewDone ? 'text-green-400' : 'text-gray-400'">
            Self-Review
          </span>
        </div>
        <div class="flex items-center gap-2 text-sm">
          <UIcon
            :name="managerReviewDone ? 'i-heroicons-check-circle-solid' : 'i-heroicons-clock'"
            class="w-4 h-4"
            :class="managerReviewDone ? 'text-green-400' : 'text-gray-500'"
          />
          <span :class="managerReviewDone ? 'text-green-400' : 'text-gray-400'">
            Manager Review
          </span>
        </div>
      </div>

      <!-- Footer -->
      <div class="flex items-center justify-between pt-3 border-t border-gray-800">
        <div class="flex items-center gap-4 text-xs text-gray-500">
          <span>Triggered {{ triggeredDateFormatted }}</span>
          <span>by {{ triggeredByName }}</span>
        </div>
        <div class="flex items-center gap-2">
          <span 
            class="text-sm font-medium"
            :class="isOverdue ? 'text-red-400' : daysRemaining <= 3 ? 'text-yellow-400' : 'text-gray-400'"
          >
            <template v-if="isOverdue">
              {{ Math.abs(daysRemaining) }} days overdue
            </template>
            <template v-else>
              {{ daysRemaining }} days left
            </template>
          </span>
        </div>
      </div>

      <!-- Actions (on hover) -->
      <div 
        class="flex justify-end gap-2 mt-3 pt-3 border-t border-gray-800"
        @click.stop
      >
        <UButton
          v-if="review.status === 'initiated'"
          size="xs"
          variant="ghost"
          color="neutral"
          icon="i-heroicons-bell"
          @click="handleRemind"
        >
          Send Reminder
        </UButton>
        <UButton
          v-if="review.status === 'initiated'"
          size="xs"
          variant="ghost"
          color="error"
          icon="i-heroicons-x-mark"
          @click="handleCancel"
        >
          Cancel
        </UButton>
        <UButton
          size="xs"
          variant="soft"
          color="primary"
          icon="i-heroicons-eye"
          @click="handleView"
        >
          View Details
        </UButton>
      </div>
    </template>
  </div>
</template>
