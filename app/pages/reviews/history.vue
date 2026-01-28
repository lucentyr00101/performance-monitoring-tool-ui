<script setup lang="ts">
import type { ReviewListItem } from '~/types/review'

definePageMeta({
  layout: 'default',
  middleware: ['auth']
})

const router = useRouter()

const {
  reviews,
  isLoading,
  error,
  reviewPagination,
  fetchReviews,
  updateReviewFilter,
  setReviewPage,
  clearReviewFilters,
  formatDate,
  formatEmployeeName
} = useReviews()

const { user } = useAuthStore()

// Filter to only show acknowledged/completed reviews for current user
onMounted(async () => {
  if (user?.id) {
    updateReviewFilter('employee_id', user.id)
    updateReviewFilter('status', 'acknowledged')
  }
  await fetchReviews()
})

// Handle review click
function handleReviewClick(review: ReviewListItem) {
  router.push(`/reviews/${review.id}`)
}

// Handle page change
function handlePageChange(page: number) {
  setReviewPage(page)
}
</script>

<template>
  <div>
    <!-- Page Header -->
    <div class="mb-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-white">Review History</h1>
          <p class="text-gray-400 mt-1">View your past performance reviews</p>
        </div>
        <UButton
          variant="outline"
          color="neutral"
          @click="router.push('/reviews')"
        >
          <UIcon name="i-heroicons-arrow-left" class="w-4 h-4 mr-1" />
          All Reviews
        </UButton>
      </div>
    </div>

    <!-- Error State -->
    <div v-if="error" class="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6">
      <div class="flex items-center gap-3">
        <UIcon name="i-heroicons-exclamation-triangle" class="w-5 h-5 text-red-400" />
        <div>
          <p class="text-red-400 font-medium">Failed to load review history</p>
          <p class="text-red-400/70 text-sm">{{ error }}</p>
        </div>
        <UButton variant="outline" color="error" size="sm" class="ml-auto" @click="() => fetchReviews()">
          Retry
        </UButton>
      </div>
    </div>

    <!-- Loading State -->
    <div v-else-if="isLoading && reviews.length === 0" class="flex items-center justify-center py-12">
      <div class="flex items-center gap-3 text-gray-400">
        <UIcon name="i-heroicons-arrow-path" class="w-5 h-5 animate-spin" />
        <span>Loading review history...</span>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="reviews.length === 0" class="text-center py-12">
      <div class="bg-gray-800/50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
        <UIcon name="i-heroicons-document-text" class="w-8 h-8 text-gray-500" />
      </div>
      <h3 class="text-lg font-medium text-white mb-2">No review history</h3>
      <p class="text-gray-400">
        Your completed reviews will appear here.
      </p>
    </div>

    <!-- Reviews Timeline -->
    <div v-else class="space-y-4">
      <div
        v-for="review in reviews"
        :key="review.id"
        class="bg-gray-900 border border-gray-800 rounded-lg p-4 hover:border-gray-700 cursor-pointer transition-colors"
        @click="handleReviewClick(review)"
      >
        <div class="flex items-start gap-4">
          <!-- Timeline Indicator -->
          <div class="flex flex-col items-center">
            <div class="w-3 h-3 rounded-full bg-emerald-500" />
            <div class="w-0.5 h-full bg-gray-700 mt-2" />
          </div>

          <!-- Content -->
          <div class="flex-1">
            <div class="flex items-center justify-between mb-2">
              <h3 class="font-medium text-white">{{ review.cycle.name }}</h3>
              <div class="flex items-center gap-2">
                <ReviewsReviewTypeBadge :type="review.type" size="xs" />
                <span v-if="review.rating" class="flex items-center gap-1 text-sm">
                  <UIcon name="i-heroicons-star-solid" class="w-4 h-4 text-yellow-400" />
                  <span class="text-white">{{ review.rating.toFixed(1) }}</span>
                </span>
              </div>
            </div>

            <p class="text-sm text-gray-400 mb-2">
              Reviewed by {{ formatEmployeeName(review.reviewer) }}
            </p>

            <p class="text-xs text-gray-500">
              {{ review.submitted_at ? formatDate(review.submitted_at) : 'N/A' }}
            </p>
          </div>

          <!-- Arrow -->
          <UIcon name="i-heroicons-chevron-right" class="w-5 h-5 text-gray-600" />
        </div>
      </div>

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
  </div>
</template>
