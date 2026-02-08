<script setup lang="ts">
import type { AdhocReviewListItem } from '~/types/adhoc-review'

const props = defineProps<{
  title?: string
  variant?: 'pending' | 'triggered' | 'all'
  maxItems?: number
  showTriggerButton?: boolean
}>()

const emit = defineEmits<{
  triggerReview: []
}>()

const router = useRouter()
const adhocReviewsStore = useAdhocReviewsStore()
const authStore = useAuthStore()

const isLoading = ref(true)

// Get reviews based on variant
const reviews = computed((): AdhocReviewListItem[] => {
  const currentUserId = authStore.user?.id
  let filtered: AdhocReviewListItem[] = []

  switch (props.variant) {
    case 'pending':
      // Reviews where current user needs to take action (self-review or manager review)
      filtered = adhocReviewsStore.reviews.filter(r => {
        if (r.status !== 'initiated') return false
        // Employee needs to complete self-review
        if (r.employee?.id === currentUserId && r.selfReviewStatus !== 'submitted') return true
        // Manager needs to complete manager review
        if (r.manager?.id === currentUserId && r.managerReviewStatus !== 'submitted') return true
        return false
      })
      break
    case 'triggered':
      // Reviews triggered by current user
      filtered = adhocReviewsStore.reviews.filter(r => 
        r.triggeredBy?.id === currentUserId
      )
      break
    default:
      filtered = adhocReviewsStore.reviews
  }

  return props.maxItems ? filtered.slice(0, props.maxItems) : filtered
})

// Stats
const pendingCount = computed(() => 
  adhocReviewsStore.reviews.filter(r => r.status === 'initiated').length
)
const overdueCount = computed(() => 
  adhocReviewsStore.overdueReviews.length
)

// Load reviews
async function loadReviews() {
  isLoading.value = true
  try {
    await adhocReviewsStore.fetchAdhocReviews({ perPage: 20 })
  } finally {
    isLoading.value = false
  }
}

// Navigate to review
function goToReview(id: string) {
  router.push(`/reviews/adhoc/${id}`)
}

// Navigate to all reviews
function goToAll() {
  router.push('/reviews/adhoc')
}

// Trigger review
function handleTrigger() {
  emit('triggerReview')
}

// Load on mount
onMounted(() => {
  loadReviews()
})
</script>

<template>
  <div class="bg-gray-900 border border-gray-800 rounded-xl p-6">
    <!-- Header -->
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center gap-3">
        <div class="p-2 bg-primary-500/20 rounded-lg">
          <UIcon name="i-heroicons-clipboard-document-check" class="w-5 h-5 text-primary-400" />
        </div>
        <h3 class="text-lg font-semibold text-white">
          {{ title || 'Ad-Hoc Reviews' }}
        </h3>
      </div>
      <div class="flex items-center gap-2">
        <UButton
          v-if="showTriggerButton"
          size="xs"
          color="primary"
          icon="i-heroicons-plus"
          @click="handleTrigger"
        >
          Trigger
        </UButton>
        <UButton
          variant="ghost"
          color="neutral"
          size="xs"
          @click="goToAll"
        >
          View All
        </UButton>
      </div>
    </div>

    <!-- Stats -->
    <div v-if="variant !== 'pending'" class="grid grid-cols-2 gap-3 mb-4">
      <div class="bg-gray-800/50 rounded-lg p-3 text-center">
        <p class="text-2xl font-bold text-white">{{ pendingCount }}</p>
        <p class="text-xs text-gray-400">In Progress</p>
      </div>
      <div class="bg-gray-800/50 rounded-lg p-3 text-center">
        <p class="text-2xl font-bold" :class="overdueCount > 0 ? 'text-red-400' : 'text-white'">
          {{ overdueCount }}
        </p>
        <p class="text-xs text-gray-400">Overdue</p>
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="isLoading" class="space-y-3">
      <div 
        v-for="i in 3" 
        :key="i" 
        class="bg-gray-800/50 rounded-lg p-3 animate-pulse"
      >
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 bg-gray-700 rounded-full" />
          <div class="flex-1">
            <div class="w-24 h-3 bg-gray-700 rounded mb-1" />
            <div class="w-16 h-2 bg-gray-700 rounded" />
          </div>
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div 
      v-else-if="reviews.length === 0" 
      class="text-center py-8"
    >
      <UIcon name="i-heroicons-clipboard-document-list" class="w-10 h-10 text-gray-600 mx-auto mb-2" />
      <p class="text-sm text-gray-400">
        <template v-if="variant === 'pending'">
          No pending reviews requiring your action
        </template>
        <template v-else>
          No ad-hoc reviews found
        </template>
      </p>
    </div>

    <!-- Reviews list -->
    <div v-else class="space-y-2">
      <div
        v-for="review in reviews"
        :key="review.id"
        class="bg-gray-800/50 rounded-lg p-3 hover:bg-gray-800 transition-colors cursor-pointer"
        @click="goToReview(review.id)"
      >
        <div class="flex items-center justify-between gap-3">
          <div class="flex items-center gap-3 min-w-0">
            <UAvatar
              :alt="review.employee ? `${review.employee.firstName} ${review.employee.lastName}` : 'Employee'"
              size="sm"
            />
            <div class="min-w-0">
              <p class="text-sm font-medium text-white truncate">
                {{ review.employee?.firstName }} {{ review.employee?.lastName }}
              </p>
              <p class="text-xs text-gray-400">
                Due: {{ new Date(review.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) }}
              </p>
            </div>
          </div>
          <div class="flex items-center gap-2 shrink-0">
            <!-- Progress indicators -->
            <div class="flex items-center gap-1">
              <UTooltip text="Self-Review">
                <UIcon
                  name="i-heroicons-user"
                  class="w-4 h-4"
                  :class="review.selfReviewStatus === 'submitted' ? 'text-green-400' : 'text-gray-500'"
                />
              </UTooltip>
              <UTooltip text="Manager Review">
                <UIcon
                  name="i-heroicons-user-group"
                  class="w-4 h-4"
                  :class="review.managerReviewStatus === 'submitted' ? 'text-green-400' : 'text-gray-500'"
                />
              </UTooltip>
            </div>
            <UIcon 
              name="i-heroicons-chevron-right" 
              class="w-4 h-4 text-gray-500" 
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
