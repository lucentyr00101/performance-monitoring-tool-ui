<script setup lang="ts">
definePageMeta({
  layout: 'default',
  middleware: ['auth']
})

const router = useRouter()
const adhocReviewsStore = useAdhocReviewsStore()
const authStore = useAuthStore()

// Trigger modal state
const showTriggerModal = ref(false)

// Check if user can trigger reviews
const canTriggerReviews = computed(() => {
  const role = authStore.user?.role
  return role === 'hr' || role === 'manager' || role === 'csuite'
})

// Handle review triggered
function handleReviewTriggered({ reviewId }: { reviewId: string; employeeName: string }) {
  router.push(`/reviews/adhoc/${reviewId}`)
}
</script>

<template>
  <div class="px-4 py-8">
    <!-- Header -->
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-2xl font-bold text-white">Ad-Hoc Reviews</h1>
        <p class="text-gray-400 mt-1">
          Manage on-demand performance reviews triggered outside regular cycles
        </p>
      </div>
      <UButton
        v-if="canTriggerReviews"
        color="primary"
        icon="i-heroicons-plus"
        @click="showTriggerModal = true"
      >
        Trigger Review
      </UButton>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      <div class="bg-gray-900 border border-gray-800 rounded-lg p-4">
        <div class="flex items-center gap-3">
          <div class="p-2 bg-blue-500/20 rounded-lg">
            <UIcon name="i-heroicons-clipboard-document-list" class="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <p class="text-2xl font-bold text-white">
              {{ adhocReviewsStore.reviews.length }}
            </p>
            <p class="text-sm text-gray-400">Total Reviews</p>
          </div>
        </div>
      </div>

      <div class="bg-gray-900 border border-gray-800 rounded-lg p-4">
        <div class="flex items-center gap-3">
          <div class="p-2 bg-yellow-500/20 rounded-lg">
            <UIcon name="i-heroicons-clock" class="w-5 h-5 text-yellow-400" />
          </div>
          <div>
            <p class="text-2xl font-bold text-white">
              {{ adhocReviewsStore.reviews.filter(r => r.status === 'initiated').length }}
            </p>
            <p class="text-sm text-gray-400">In Progress</p>
          </div>
        </div>
      </div>

      <div class="bg-gray-900 border border-gray-800 rounded-lg p-4">
        <div class="flex items-center gap-3">
          <div class="p-2 bg-red-500/20 rounded-lg">
            <UIcon name="i-heroicons-exclamation-triangle" class="w-5 h-5 text-red-400" />
          </div>
          <div>
            <p class="text-2xl font-bold text-white">
              {{ adhocReviewsStore.overdueReviews.length }}
            </p>
            <p class="text-sm text-gray-400">Overdue</p>
          </div>
        </div>
      </div>

      <div class="bg-gray-900 border border-gray-800 rounded-lg p-4">
        <div class="flex items-center gap-3">
          <div class="p-2 bg-green-500/20 rounded-lg">
            <UIcon name="i-heroicons-check-circle" class="w-5 h-5 text-green-400" />
          </div>
          <div>
            <p class="text-2xl font-bold text-white">
              {{ adhocReviewsStore.reviews.filter(r => r.status === 'completed').length }}
            </p>
            <p class="text-sm text-gray-400">Completed</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Reviews List -->
    <ReviewsAdhocReviewList 
      title="All Ad-Hoc Reviews"
      show-filters
    />

    <!-- Trigger Review Modal -->
    <ReviewsTriggerReviewModal
      :is-open="showTriggerModal"
      @close="showTriggerModal = false"
      @triggered="handleReviewTriggered"
    />
  </div>
</template>
