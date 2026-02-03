<script setup lang="ts">
import type { AdhocReviewStatus } from '~/types/adhoc-review'

const props = defineProps<{
  title?: string
  showFilters?: boolean
  maxItems?: number
  variant?: 'default' | 'compact'
  emptyMessage?: string
}>()

const emit = defineEmits<{
  viewReview: [id: string]
}>()

const router = useRouter()
const adhocReviewsStore = useAdhocReviewsStore()

// Local state
const isLoading = ref(false)
const selectedStatus = ref<AdhocReviewStatus | 'all'>('all')
const showCancelModal = ref(false)
const reviewToCancel = ref<string | null>(null)
const isCancelling = ref(false)

// Fetch reviews
async function loadReviews() {
  isLoading.value = true
  try {
    await adhocReviewsStore.fetchAdhocReviews({
      status: selectedStatus.value !== 'all' ? selectedStatus.value : undefined,
      perPage: props.maxItems || 50
    })
  } finally {
    isLoading.value = false
  }
}

// Filter options
const statusOptions = [
  { label: 'All Reviews', value: 'all' },
  { label: 'In Progress', value: 'initiated' },
  { label: 'Pending Acknowledgment', value: 'pending_acknowledgment' },
  { label: 'Completed', value: 'completed' },
  { label: 'Cancelled', value: 'cancelled' }
]

// Filtered reviews
const filteredReviews = computed(() => {
  let reviews = adhocReviewsStore.reviews
  if (props.maxItems) {
    reviews = reviews.slice(0, props.maxItems)
  }
  return reviews
})

// Handle view
function handleView(id: string) {
  emit('viewReview', id)
  router.push(`/reviews/adhoc/${id}`)
}

// Handle remind
async function handleRemind(id: string) {
  try {
    await adhocReviewsStore.sendReminder(id)
  } catch {
    // Notification handled by store
  }
}

// Handle cancel
function handleCancelRequest(id: string) {
  reviewToCancel.value = id
  showCancelModal.value = true
}

async function confirmCancel() {
  if (!reviewToCancel.value) return
  
  isCancelling.value = true
  try {
    await adhocReviewsStore.cancelAdhocReview(reviewToCancel.value)
    showCancelModal.value = false
    reviewToCancel.value = null
  } catch {
    // Notification handled by store
  } finally {
    isCancelling.value = false
  }
}

// Watch for status filter changes
watch(selectedStatus, () => {
  loadReviews()
})

// Load on mount
onMounted(() => {
  loadReviews()
})
</script>

<template>
  <div class="space-y-4">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <h3 v-if="title" class="text-lg font-semibold text-white">
        {{ title }}
      </h3>
      
      <div v-if="showFilters" class="flex items-center gap-3">
        <USelectMenu
          v-model="selectedStatus"
          :options="statusOptions"
          placeholder="Filter by status"
          value-key="value"
          class="w-48"
        />
        <UButton
          variant="ghost"
          color="neutral"
          icon="i-heroicons-arrow-path"
          :loading="isLoading"
          @click="loadReviews"
        >
          Refresh
        </UButton>
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="isLoading" class="space-y-3">
      <div 
        v-for="i in 3" 
        :key="i" 
        class="bg-gray-900 border border-gray-800 rounded-lg p-4 animate-pulse"
      >
        <div class="flex items-center gap-3 mb-3">
          <div class="w-10 h-10 bg-gray-800 rounded-full" />
          <div class="flex-1">
            <div class="w-32 h-4 bg-gray-800 rounded mb-2" />
            <div class="w-48 h-3 bg-gray-800 rounded" />
          </div>
        </div>
        <div class="w-full h-3 bg-gray-800 rounded" />
      </div>
    </div>

    <!-- Empty state -->
    <div 
      v-else-if="filteredReviews.length === 0" 
      class="bg-gray-900 border border-gray-800 rounded-lg p-8 text-center"
    >
      <UIcon 
        name="i-heroicons-clipboard-document-list" 
        class="w-12 h-12 text-gray-600 mx-auto mb-3" 
      />
      <p class="text-gray-400">
        {{ emptyMessage || 'No ad-hoc reviews found' }}
      </p>
    </div>

    <!-- Reviews list -->
    <div v-else class="space-y-3">
      <AdhocReviewCard
        v-for="review in filteredReviews"
        :key="review.id"
        :review="review"
        :variant="variant"
        @view="handleView"
        @remind="handleRemind"
        @cancel="handleCancelRequest"
      />
    </div>

    <!-- Cancel confirmation modal -->
    <UModal
      :open="showCancelModal"
      @close="showCancelModal = false"
    >
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
          The employee and manager will be notified that the review has been cancelled.
        </p>
      </template>

      <template #footer>
        <div class="flex justify-end gap-3">
          <UButton
            variant="ghost"
            color="neutral"
            @click="showCancelModal = false"
          >
            Keep Review
          </UButton>
          <UButton
            color="error"
            :loading="isCancelling"
            @click="confirmCancel"
          >
            Cancel Review
          </UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>
