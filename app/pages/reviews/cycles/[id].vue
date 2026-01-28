<script setup lang="ts">
import type { ReviewListItem } from '~/types/review'

definePageMeta({
  layout: 'default',
  middleware: ['auth']
})

const route = useRoute()
const router = useRouter()
const toast = useToast()

const cycleId = computed(() => route.params.id as string)

const {
  currentCycle,
  reviews,
  isLoading,
  error,
  reviewPagination,
  fetchCycle,
  fetchReviews,
  launchCycle,
  deleteCycle,
  updateReviewFilter,
  setReviewPage,
  canLaunchCycle,
  canDeleteCycle,
  canEditCycle,
  formatDate,
  getCycleDaysRemaining,
  isCycleOverdue
} = useReviews()

// Launch confirmation modal
const isLaunchModalOpen = ref(false)
const isLaunching = ref(false)

// Delete confirmation modal
const isDeleteModalOpen = ref(false)
const isDeleting = ref(false)

// Fetch cycle and reviews
async function loadData() {
  try {
    await fetchCycle(cycleId.value)
    updateReviewFilter('cycle_id', cycleId.value)
    await fetchReviews()
  }
  catch {
    // Error handled in store
  }
}

onMounted(loadData)

// Watch for route changes
watch(cycleId, loadData)

// Handle review click
function handleReviewClick(review: ReviewListItem) {
  router.push(`/reviews/${review.id}`)
}

// Handle page change
function handlePageChange(page: number) {
  setReviewPage(page)
}

// Handle launch
async function handleLaunch() {
  if (!currentCycle.value) return
  
  isLaunching.value = true
  try {
    const result = await launchCycle(currentCycle.value.id)
    isLaunchModalOpen.value = false
    toast.add({
      title: 'Cycle Launched',
      description: `Created ${result.reviews_created.total} reviews and sent ${result.notifications_sent} notifications.`,
      color: 'success'
    })
    await loadData()
  }
  catch {
    toast.add({
      title: 'Launch Failed',
      description: 'Failed to launch review cycle. Please try again.',
      color: 'error'
    })
  }
  finally {
    isLaunching.value = false
  }
}

// Handle delete
async function handleDelete() {
  if (!currentCycle.value) return
  
  isDeleting.value = true
  try {
    await deleteCycle(currentCycle.value.id)
    isDeleteModalOpen.value = false
    toast.add({
      title: 'Cycle Deleted',
      description: 'The review cycle has been deleted.',
      color: 'success'
    })
    router.push('/reviews')
  }
  catch {
    toast.add({
      title: 'Delete Failed',
      description: 'Failed to delete review cycle. Please try again.',
      color: 'error'
    })
  }
  finally {
    isDeleting.value = false
  }
}

// Computed helpers
const daysLeft = computed(() => currentCycle.value ? getCycleDaysRemaining(currentCycle.value) : 0)
const isOverdue = computed(() => currentCycle.value ? isCycleOverdue(currentCycle.value) : false)

const selfProgress = computed(() => {
  if (!currentCycle.value?.stats.by_type?.self) return 0
  const { total, completed } = currentCycle.value.stats.by_type.self
  return total > 0 ? Math.round((completed / total) * 100) : 0
})

const managerProgress = computed(() => {
  if (!currentCycle.value?.stats.by_type?.manager) return 0
  const { total, completed } = currentCycle.value.stats.by_type.manager
  return total > 0 ? Math.round((completed / total) * 100) : 0
})
</script>

<template>
  <div>
    <!-- Back Button -->
    <div class="mb-4">
      <UButton
        variant="ghost"
        color="neutral"
        size="sm"
        @click="router.push('/reviews')"
      >
        <UIcon name="i-heroicons-arrow-left" class="w-4 h-4 mr-1" />
        Back to Cycles
      </UButton>
    </div>

    <!-- Loading -->
    <div v-if="isLoading && !currentCycle" class="flex items-center justify-center py-12">
      <div class="flex items-center gap-3 text-gray-400">
        <UIcon name="i-heroicons-arrow-path" class="w-5 h-5 animate-spin" />
        <span>Loading review cycle...</span>
      </div>
    </div>

    <!-- Error -->
    <div v-else-if="error && !currentCycle" class="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
      <div class="flex items-center gap-3">
        <UIcon name="i-heroicons-exclamation-triangle" class="w-5 h-5 text-red-400" />
        <div>
          <p class="text-red-400 font-medium">Failed to load review cycle</p>
          <p class="text-red-400/70 text-sm">{{ error }}</p>
        </div>
        <UButton variant="outline" color="error" size="sm" class="ml-auto" @click="loadData">
          Retry
        </UButton>
      </div>
    </div>

    <!-- Content -->
    <template v-else-if="currentCycle">
      <!-- Header -->
      <div class="bg-gray-900 border border-gray-800 rounded-lg p-6 mb-6">
        <div class="flex items-start justify-between gap-4">
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-2">
              <ReviewsCycleTypeBadge :type="currentCycle.type" />
              <ReviewsCycleStatusBadge :status="currentCycle.status" />
            </div>
            <h1 class="text-2xl font-bold text-white mb-2">{{ currentCycle.name }}</h1>
            <p v-if="currentCycle.description" class="text-gray-400 mb-4">
              {{ currentCycle.description }}
            </p>
            <div class="flex items-center gap-4 text-sm text-gray-400">
              <span>
                <UIcon name="i-heroicons-calendar" class="w-4 h-4 inline mr-1" />
                {{ formatDate(currentCycle.start_date) }} - {{ formatDate(currentCycle.end_date) }}
              </span>
              <span v-if="currentCycle.status === 'active'" :class="isOverdue ? 'text-red-400' : daysLeft <= 7 ? 'text-amber-400' : ''">
                <UIcon name="i-heroicons-clock" class="w-4 h-4 inline mr-1" />
                {{ isOverdue ? `Overdue by ${Math.abs(daysLeft)} days` : `${daysLeft} days remaining` }}
              </span>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex items-center gap-2">
            <UButton
              v-if="currentCycle && canLaunchCycle(currentCycle)"
              color="primary"
              @click="isLaunchModalOpen = true"
            >
              <UIcon name="i-heroicons-rocket-launch" class="w-4 h-4 mr-1" />
              Launch Cycle
            </UButton>
            <UButton
              v-if="currentCycle && canDeleteCycle(currentCycle)"
              variant="outline"
              color="error"
              @click="isDeleteModalOpen = true"
            >
              <UIcon name="i-heroicons-trash" class="w-4 h-4" />
            </UButton>
          </div>
        </div>

        <!-- Stats for active/completed cycles -->
        <div v-if="currentCycle.status !== 'draft'" class="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-800">
          <div>
            <p class="text-sm text-gray-400">Total Reviews</p>
            <p class="text-2xl font-bold text-white">{{ currentCycle.stats.total_reviews }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-400">Completed</p>
            <p class="text-2xl font-bold text-emerald-400">{{ currentCycle.stats.completed }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-400">Pending</p>
            <p class="text-2xl font-bold text-amber-400">{{ currentCycle.stats.pending }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-400">Completion Rate</p>
            <p class="text-2xl font-bold text-white">{{ currentCycle.stats.completion_rate }}%</p>
          </div>
        </div>

        <!-- Progress bars for active cycles -->
        <div v-if="currentCycle.status === 'active'" class="grid grid-cols-2 gap-6 mt-6 pt-6 border-t border-gray-800">
          <div>
            <div class="flex items-center justify-between text-sm mb-2">
              <span class="text-gray-400">Self Assessments</span>
              <span class="text-white">{{ currentCycle.stats.by_type?.self?.completed || 0 }}/{{ currentCycle.stats.by_type?.self?.total || 0 }}</span>
            </div>
            <div class="h-2 bg-gray-800 rounded-full overflow-hidden">
              <div 
                class="h-full bg-blue-500 rounded-full transition-all duration-300"
                :style="{ width: `${selfProgress}%` }"
              />
            </div>
          </div>
          <div>
            <div class="flex items-center justify-between text-sm mb-2">
              <span class="text-gray-400">Manager Reviews</span>
              <span class="text-white">{{ currentCycle.stats.by_type?.manager?.completed || 0 }}/{{ currentCycle.stats.by_type?.manager?.total || 0 }}</span>
            </div>
            <div class="h-2 bg-gray-800 rounded-full overflow-hidden">
              <div 
                class="h-full bg-purple-500 rounded-full transition-all duration-300"
                :style="{ width: `${managerProgress}%` }"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Reviews List -->
      <div v-if="currentCycle.status !== 'draft'">
        <h2 class="text-lg font-semibold text-white mb-4">Reviews</h2>
        
        <!-- Filters -->
        <ReviewsReviewFilters :cycle-id="cycleId" class="mb-4" />

        <!-- Reviews Grid -->
        <div v-if="reviews.length > 0" class="space-y-3">
          <ReviewsReviewCard
            v-for="review in reviews"
            :key="review.id"
            :review="review"
            :show-cycle="false"
            @click="handleReviewClick"
          />

          <!-- Pagination -->
          <div v-if="reviewPagination.total_pages > 1" class="mt-6 flex justify-center">
            <UPagination
              :model-value="reviewPagination.page"
              :page-count="reviewPagination.per_page"
              :total="reviewPagination.total_items"
              @update:model-value="handlePageChange"
            />
          </div>
        </div>

        <div v-else class="text-center py-8 text-gray-500">
          <UIcon name="i-heroicons-document-text" class="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No reviews found</p>
        </div>
      </div>

      <!-- Draft State Message -->
      <div v-else class="bg-gray-800/50 rounded-lg p-8 text-center">
        <UIcon name="i-heroicons-document-text" class="w-12 h-12 mx-auto mb-4 text-gray-500" />
        <h3 class="text-lg font-medium text-white mb-2">Cycle Not Yet Launched</h3>
        <p class="text-gray-400 mb-4">
          Launch this cycle to create reviews for all participants and send notifications.
        </p>
        <UButton
          v-if="canLaunchCycle(currentCycle)"
          color="primary"
          @click="isLaunchModalOpen = true"
        >
          <UIcon name="i-heroicons-rocket-launch" class="w-4 h-4 mr-1" />
          Launch Cycle
        </UButton>
      </div>
    </template>

    <!-- Launch Confirmation Modal -->
    <UModal v-model:open="isLaunchModalOpen">
      <template #content>
        <div class="p-6">
          <div class="flex items-center gap-3 mb-4">
            <div class="w-10 h-10 rounded-full bg-primary-500/20 flex items-center justify-center">
              <UIcon name="i-heroicons-rocket-launch" class="w-5 h-5 text-primary-400" />
            </div>
            <h2 class="text-xl font-semibold text-white">Launch Review Cycle</h2>
          </div>
          
          <p class="text-gray-400 mb-6">
            This will create reviews for all participants and send email notifications. 
            This action cannot be undone.
          </p>
          
          <div class="flex items-center justify-end gap-3">
            <UButton
              variant="ghost"
              color="neutral"
              :disabled="isLaunching"
              @click="isLaunchModalOpen = false"
            >
              Cancel
            </UButton>
            <UButton
              color="primary"
              :loading="isLaunching"
              @click="handleLaunch"
            >
              Launch Cycle
            </UButton>
          </div>
        </div>
      </template>
    </UModal>

    <!-- Delete Confirmation Modal -->
    <UModal v-model:open="isDeleteModalOpen">
      <template #content>
        <div class="p-6">
          <div class="flex items-center gap-3 mb-4">
            <div class="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
              <UIcon name="i-heroicons-trash" class="w-5 h-5 text-red-400" />
            </div>
            <h2 class="text-xl font-semibold text-white">Delete Review Cycle</h2>
          </div>
          
          <p class="text-gray-400 mb-6">
            Are you sure you want to delete this review cycle? This action cannot be undone.
          </p>
          
          <div class="flex items-center justify-end gap-3">
            <UButton
              variant="ghost"
              color="neutral"
              :disabled="isDeleting"
              @click="isDeleteModalOpen = false"
            >
              Cancel
            </UButton>
            <UButton
              color="error"
              :loading="isDeleting"
              @click="handleDelete"
            >
              Delete
            </UButton>
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>
