<script setup lang="ts">
import type { AdhocReview } from '~/types/adhoc-review'

definePageMeta({
  layout: 'default',
  middleware: ['auth']
})

const route = useRoute()
const router = useRouter()
const adhocReviewsStore = useAdhocReviewsStore()
const authStore = useAuthStore()

const reviewId = computed(() => route.params.id as string)
const review = ref<AdhocReview | null>(null)
const isLoading = ref(true)
const isSendingReminder = ref(false)
const showCancelModal = ref(false)
const isCancelling = ref(false)

// User permissions
const currentUser = computed(() => authStore.user)
const isEmployee = computed(() => review.value?.employee.id === currentUser.value?.id)
const isManager = computed(() => review.value?.manager.id === currentUser.value?.id)
const canManageReview = computed(() => {
  const role = currentUser.value?.role
  return role === 'hr' || isManager.value
})

type BadgeColor = 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error' | 'neutral'

// Status helpers
const statusConfig = computed(() => {
  const configs: Record<string, { label: string; color: BadgeColor; icon: string; description: string }> = {
    initiated: { 
      label: 'In Progress', 
      color: 'info', 
      icon: 'i-heroicons-clock',
      description: 'Waiting for self-review and manager evaluation'
    },
    pending_acknowledgment: { 
      label: 'Pending Acknowledgment', 
      color: 'warning', 
      icon: 'i-heroicons-eye',
      description: 'Both reviews submitted, awaiting employee acknowledgment'
    },
    completed: { 
      label: 'Completed', 
      color: 'success', 
      icon: 'i-heroicons-check-circle',
      description: 'Review completed and acknowledged'
    },
    cancelled: { 
      label: 'Cancelled', 
      color: 'neutral', 
      icon: 'i-heroicons-x-circle',
      description: 'This review was cancelled'
    }
  }
  return configs[review.value?.status || 'initiated'] ?? configs.initiated
})

// Badge color computed property to avoid ESLint false positive
const badgeColor = computed((): BadgeColor => {
  if (isOverdue.value) return 'error'
  return statusConfig.value?.color ?? 'info'
})

// Load review
async function loadReview() {
  isLoading.value = true
  try {
    review.value = await adhocReviewsStore.fetchAdhocReview(reviewId.value)
  } catch {
    // Notification handled by store
    router.push('/reviews/adhoc')
  } finally {
    isLoading.value = false
  }
}

// Send reminder
async function handleSendReminder() {
  isSendingReminder.value = true
  try {
    await adhocReviewsStore.sendReminder(reviewId.value)
  } catch {
    // Notification handled by store
  } finally {
    isSendingReminder.value = false
  }
}

// Cancel review
async function handleCancel() {
  isCancelling.value = true
  try {
    await adhocReviewsStore.cancelAdhocReview(reviewId.value)
    showCancelModal.value = false
    router.push('/reviews/adhoc')
  } catch {
    // Notification handled by store
  } finally {
    isCancelling.value = false
  }
}

// Days remaining
const daysRemaining = computed(() => {
  if (!review.value) return 0
  return adhocReviewsStore.getDaysRemaining(review.value)
})
const isOverdue = computed(() => review.value && adhocReviewsStore.isOverdue(review.value))

// Date formatting
function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })
}

// Load on mount
onMounted(() => {
  loadReview()
})
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <!-- Back button -->
    <UButton
      variant="ghost"
      color="neutral"
      icon="i-heroicons-arrow-left"
      class="mb-6"
      @click="router.push('/reviews/adhoc')"
    >
      Back to Ad-Hoc Reviews
    </UButton>

    <!-- Loading state -->
    <div v-if="isLoading" class="space-y-4">
      <div class="bg-gray-900 border border-gray-800 rounded-lg p-6 animate-pulse">
        <div class="flex items-center gap-4">
          <div class="w-16 h-16 bg-gray-800 rounded-full" />
          <div class="flex-1">
            <div class="w-48 h-6 bg-gray-800 rounded mb-2" />
            <div class="w-64 h-4 bg-gray-800 rounded" />
          </div>
        </div>
      </div>
    </div>

    <!-- Review content -->
    <div v-else-if="review" class="space-y-6">
      <!-- Header -->
      <div class="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <div class="flex items-start justify-between">
          <div class="flex items-center gap-4">
            <UAvatar
              :alt="`${review.employee.firstName} ${review.employee.lastName}`"
              size="xl"
            />
            <div>
              <h1 class="text-2xl font-bold text-white">
                {{ review.employee.firstName }} {{ review.employee.lastName }}
              </h1>
              <p class="text-gray-400">
                {{ review.employee.jobTitle }} • {{ review.employee.department?.name }}
              </p>
              <div class="flex items-center gap-3 mt-2">
                <UBadge
                  :color="badgeColor"
                  variant="subtle"
                  size="lg"
                >
                  <UIcon :name="statusConfig?.icon ?? 'i-heroicons-clock'" class="w-4 h-4 mr-1" />
                  {{ isOverdue ? 'Overdue' : statusConfig?.label ?? 'In Progress' }}
                </UBadge>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div v-if="canManageReview && review.status === 'initiated'" class="flex gap-2">
            <UButton
              variant="ghost"
              color="neutral"
              icon="i-heroicons-bell"
              :loading="isSendingReminder"
              @click="handleSendReminder"
            >
              Send Reminder
            </UButton>
            <UButton
              variant="ghost"
              color="error"
              icon="i-heroicons-x-mark"
              @click="showCancelModal = true"
            >
              Cancel Review
            </UButton>
          </div>
        </div>

        <!-- Reason -->
        <div v-if="review.reason" class="mt-4 p-4 bg-gray-800/50 rounded-lg">
          <p class="text-sm text-gray-400 mb-1">Review Reason</p>
          <p class="text-white">{{ review.reason }}</p>
        </div>
      </div>

      <!-- Review Details -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Main content -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Self-Review Progress -->
          <div class="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <div class="flex items-start justify-between mb-4">
              <div class="flex items-center gap-3">
                <div 
                  class="p-2 rounded-lg"
                  :class="review.selfReview?.status === 'submitted' 
                    ? 'bg-green-500/20' 
                    : 'bg-yellow-500/20'"
                >
                  <UIcon 
                    :name="review.selfReview?.status === 'submitted' 
                      ? 'i-heroicons-check-circle' 
                      : 'i-heroicons-clock'" 
                    class="w-5 h-5"
                    :class="review.selfReview?.status === 'submitted' 
                      ? 'text-green-400' 
                      : 'text-yellow-400'"
                  />
                </div>
                <div>
                  <h3 class="text-lg font-medium text-white">Self-Review</h3>
                  <p class="text-sm text-gray-400">
                    {{ review.selfReview?.status === 'submitted' ? 'Completed' : 'Pending' }}
                  </p>
                </div>
              </div>
              <UButton
                v-if="isEmployee && review.selfReview?.status !== 'submitted'"
                color="primary"
                size="sm"
                @click="router.push(`/reviews/adhoc/${review.id}/self-review`)"
              >
                Complete Self-Review
              </UButton>
              <UButton
                v-else-if="review.selfReview?.status === 'submitted'"
                variant="ghost"
                color="neutral"
                size="sm"
                @click="router.push(`/reviews/adhoc/${review.id}/self-review`)"
              >
                View Self-Review
              </UButton>
            </div>
            <p v-if="review.selfReview?.submittedAt" class="text-sm text-gray-500">
              Submitted on {{ formatDate(review.selfReview.submittedAt) }}
            </p>
          </div>

          <!-- Manager Review Progress -->
          <div class="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <div class="flex items-start justify-between mb-4">
              <div class="flex items-center gap-3">
                <div 
                  class="p-2 rounded-lg"
                  :class="review.managerReview?.status === 'submitted' 
                    ? 'bg-green-500/20' 
                    : 'bg-yellow-500/20'"
                >
                  <UIcon 
                    :name="review.managerReview?.status === 'submitted' 
                      ? 'i-heroicons-check-circle' 
                      : 'i-heroicons-clock'" 
                    class="w-5 h-5"
                    :class="review.managerReview?.status === 'submitted' 
                      ? 'text-green-400' 
                      : 'text-yellow-400'"
                  />
                </div>
                <div>
                  <h3 class="text-lg font-medium text-white">Manager Evaluation</h3>
                  <p class="text-sm text-gray-400">
                    By {{ review.manager.firstName }} {{ review.manager.lastName }}
                    • {{ review.managerReview?.status === 'submitted' ? 'Completed' : 'Pending' }}
                  </p>
                </div>
              </div>
              <UButton
                v-if="isManager && review.managerReview?.status !== 'submitted'"
                color="primary"
                size="sm"
                @click="router.push(`/reviews/adhoc/${review.id}/manager-review`)"
              >
                Complete Evaluation
              </UButton>
              <UButton
                v-else-if="review.managerReview?.status === 'submitted'"
                variant="ghost"
                color="neutral"
                size="sm"
                @click="router.push(`/reviews/adhoc/${review.id}/manager-review`)"
              >
                View Evaluation
              </UButton>
            </div>
            <p v-if="review.managerReview?.submittedAt" class="text-sm text-gray-500">
              Submitted on {{ formatDate(review.managerReview.submittedAt) }}
            </p>
          </div>

          <!-- Acknowledgment (if pending) -->
          <div 
            v-if="review.status === 'pending_acknowledgment' && isEmployee"
            class="bg-primary-500/10 border border-primary-500/30 rounded-lg p-6"
          >
            <div class="flex items-center gap-3 mb-4">
              <UIcon name="i-heroicons-eye" class="w-6 h-6 text-primary-400" />
              <h3 class="text-lg font-medium text-white">Review Complete - Acknowledgment Required</h3>
            </div>
            <p class="text-gray-300 mb-4">
              Both your self-review and manager evaluation have been completed. 
              Please review the results and acknowledge to finalize this performance review.
            </p>
            <UButton color="primary">
              View Results & Acknowledge
            </UButton>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="space-y-6">
          <!-- Review Info -->
          <div class="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <h3 class="text-lg font-medium text-white mb-4">Review Details</h3>
            <dl class="space-y-4">
              <div>
                <dt class="text-sm text-gray-400">Due Date</dt>
                <dd class="text-white font-medium">
                  {{ formatDate(review.dueDate) }}
                </dd>
                <dd 
                  class="text-sm"
                  :class="isOverdue ? 'text-red-400' : daysRemaining <= 3 ? 'text-yellow-400' : 'text-gray-500'"
                >
                  <template v-if="isOverdue">
                    {{ Math.abs(daysRemaining) }} days overdue
                  </template>
                  <template v-else>
                    {{ daysRemaining }} days remaining
                  </template>
                </dd>
              </div>
              <div>
                <dt class="text-sm text-gray-400">Triggered By</dt>
                <dd class="text-white">
                  {{ review.triggeredBy.firstName }} {{ review.triggeredBy.lastName }}
                </dd>
              </div>
              <div>
                <dt class="text-sm text-gray-400">Triggered On</dt>
                <dd class="text-white">{{ formatDate(review.triggeredAt) }}</dd>
              </div>
              <div>
                <dt class="text-sm text-gray-400">Review Form</dt>
                <dd class="text-white">{{ review.formSnapshot?.name || 'Standard Form' }}</dd>
              </div>
            </dl>
          </div>

          <!-- Timeline -->
          <div class="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <h3 class="text-lg font-medium text-white mb-4">Timeline</h3>
            <ol class="space-y-4">
              <li class="flex gap-3">
                <div class="flex flex-col items-center">
                  <div class="w-2 h-2 rounded-full bg-green-400" />
                  <div class="w-px h-full bg-gray-700" />
                </div>
                <div>
                  <p class="text-sm text-white">Review Triggered</p>
                  <p class="text-xs text-gray-500">{{ formatDate(review.triggeredAt) }}</p>
                </div>
              </li>
              <li 
                v-if="review.selfReview?.submittedAt"
                class="flex gap-3"
              >
                <div class="flex flex-col items-center">
                  <div class="w-2 h-2 rounded-full bg-green-400" />
                  <div class="w-px h-full bg-gray-700" />
                </div>
                <div>
                  <p class="text-sm text-white">Self-Review Submitted</p>
                  <p class="text-xs text-gray-500">{{ formatDate(review.selfReview.submittedAt) }}</p>
                </div>
              </li>
              <li 
                v-if="review.managerReview?.submittedAt"
                class="flex gap-3"
              >
                <div class="flex flex-col items-center">
                  <div class="w-2 h-2 rounded-full bg-green-400" />
                  <div class="w-px h-full bg-gray-700" />
                </div>
                <div>
                  <p class="text-sm text-white">Manager Evaluation Submitted</p>
                  <p class="text-xs text-gray-500">{{ formatDate(review.managerReview.submittedAt) }}</p>
                </div>
              </li>
              <li 
                v-if="review.completedAt"
                class="flex gap-3"
              >
                <div class="flex flex-col items-center">
                  <div class="w-2 h-2 rounded-full bg-green-400" />
                </div>
                <div>
                  <p class="text-sm text-white">Review Completed</p>
                  <p class="text-xs text-gray-500">{{ formatDate(review.completedAt) }}</p>
                </div>
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>

    <!-- Cancel Modal -->
    <UModal :open="showCancelModal" @close="showCancelModal = false">
      <template #header>
        <div class="flex items-center gap-3">
          <div class="p-2 bg-red-500/20 rounded-lg">
            <UIcon name="i-heroicons-exclamation-triangle" class="w-5 h-5 text-red-400" />
          </div>
          <div>
            <h3 class="text-lg font-semibold text-white">Cancel Review</h3>
            <p class="text-sm text-gray-400">This action cannot be undone</p>
          </div>
        </div>
      </template>

      <template #body>
        <p class="text-gray-300">
          Are you sure you want to cancel this ad-hoc review? 
          All progress will be lost and participants will be notified.
        </p>
      </template>

      <template #footer>
        <div class="flex justify-end gap-3">
          <UButton variant="ghost" color="neutral" @click="showCancelModal = false">
            Keep Review
          </UButton>
          <UButton color="error" :loading="isCancelling" @click="handleCancel">
            Cancel Review
          </UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>
