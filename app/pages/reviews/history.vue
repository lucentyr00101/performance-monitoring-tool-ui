<script setup lang="ts">
import type { ReviewListItem } from '~/types/review'
import type { AdhocReviewListItem } from '~/types/adhoc-review'

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
  formatDate,
  formatEmployeeName
} = useReviews()

const adhocReviewsStore = useAdhocReviewsStore()
const { user } = useAuthStore()

// Loading state covers both fetches
const isLoadingAdhoc = ref(true)

/**
 * A combined timeline entry that can represent either a cycle review or an ad-hoc review.
 */
interface TimelineEntry {
  id: string
  label: string
  subtitle: string
  date: string
  rating?: number
  isAdhoc: boolean
  link: string
}

const adhocEntries = computed((): TimelineEntry[] => {
  return adhocReviewsStore.completedReviews.map((r: AdhocReviewListItem) => ({
    id: `adhoc-${r.id}`,
    label: 'Ad-Hoc Performance Review',
    subtitle: `${r.employee?.firstName || ''} ${r.employee?.lastName || ''}`.trim() || 'Employee',
    date: r.triggeredAt,
    isAdhoc: true,
    link: `/reviews/adhoc/${r.id}`
  }))
})

const cycleEntries = computed((): TimelineEntry[] => {
  return reviews.value.map((r: ReviewListItem) => ({
    id: `cycle-${r.id}`,
    label: r.cycle?.name ?? 'Performance Review',
    subtitle: `Reviewed by ${formatEmployeeName(r.reviewer)}`,
    date: r.submittedAt ?? '',
    rating: r.rating,
    isAdhoc: false,
    link: `/reviews/${r.id}`
  }))
})

/** Combined, sorted by date descending */
const combinedTimeline = computed((): TimelineEntry[] => {
  return [...cycleEntries.value, ...adhocEntries.value]
    .filter(e => e.date)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
})

const combinedIsLoading = computed(() => isLoading.value || isLoadingAdhoc.value)

// Handle review click
function handleEntryClick(entry: TimelineEntry) {
  router.push(entry.link)
}

// Handle page change
function handlePageChange(page: number) {
  setReviewPage(page)
}

onMounted(async () => {
  // Filter cycle reviews to current user's acknowledged/completed reviews
  if (user?.id) {
    updateReviewFilter('employeeId', user.id)
    updateReviewFilter('status', 'acknowledged')
  }

  // Fetch both in parallel
  await Promise.all([
    fetchReviews(),
    adhocReviewsStore.fetchAdhocReviews({ status: 'completed', perPage: 100 }).finally(() => {
      isLoadingAdhoc.value = false
    })
  ])
})
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
    <div v-else-if="combinedIsLoading && combinedTimeline.length === 0" class="flex items-center justify-center py-12">
      <div class="flex items-center gap-3 text-gray-400">
        <UIcon name="i-heroicons-arrow-path" class="w-5 h-5 animate-spin" />
        <span>Loading review history...</span>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="combinedTimeline.length === 0" class="text-center py-12">
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
        v-for="entry in combinedTimeline"
        :key="entry.id"
        class="bg-gray-900 border border-gray-800 rounded-lg p-4 hover:border-gray-700 cursor-pointer transition-colors"
        @click="handleEntryClick(entry)"
      >
        <div class="flex items-start gap-4">
          <!-- Timeline Indicator -->
          <div class="flex flex-col items-center">
            <div
              class="w-3 h-3 rounded-full"
              :class="entry.isAdhoc ? 'bg-amber-500' : 'bg-emerald-500'"
            />
            <div class="w-0.5 h-full bg-gray-700 mt-2" />
          </div>

          <!-- Content -->
          <div class="flex-1">
            <div class="flex items-center justify-between mb-2">
              <h3 class="font-medium text-white">{{ entry.label }}</h3>
              <div class="flex items-center gap-2">
                <!-- Ad-Hoc badge -->
                <UBadge
                  v-if="entry.isAdhoc"
                  color="warning"
                  variant="subtle"
                  size="xs"
                >
                  Ad-Hoc
                </UBadge>
                <span v-if="entry.rating" class="flex items-center gap-1 text-sm">
                  <UIcon name="i-heroicons-star-solid" class="w-4 h-4 text-yellow-400" />
                  <span class="text-white">{{ entry.rating.toFixed(1) }}</span>
                </span>
              </div>
            </div>

            <p class="text-sm text-gray-400 mb-2">
              {{ entry.subtitle }}
            </p>

            <p class="text-xs text-gray-500">
              {{ entry.date ? formatDate(entry.date) : 'N/A' }}
            </p>
          </div>

          <!-- Arrow -->
          <UIcon name="i-heroicons-chevron-right" class="w-5 h-5 text-gray-600" />
        </div>
      </div>

      <!-- Pagination (cycle reviews only — adhoc reviews load all at once) -->
      <div v-if="reviewPagination.totalPages > 1" class="mt-6 flex justify-center">
        <UPagination
          :model-value="reviewPagination.page"
          :page-count="reviewPagination.perPage"
          :total="reviewPagination.totalItems"
          @update:model-value="handlePageChange"
        />
      </div>
    </div>
  </div>
</template>
