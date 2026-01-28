<script setup lang="ts">
import type { ReviewCycleListItem, ReviewCycleCreateRequest } from '~/types/review'

definePageMeta({
  layout: 'default',
  middleware: ['auth']
})

const router = useRouter()
const toast = useToast()

const {
  reviewCycles,
  isLoading,
  error,
  cyclePagination,
  cycleSearchQuery,
  fetchCycles,
  createCycle,
  setCyclePage,
  clearCycleFilters,
  canCreateCycle
} = useReviews()

// Check if user can create cycles
const canCreate = computed(() => canCreateCycle())

// Create modal state
const isCreateModalOpen = ref(false)
const isCreating = ref(false)

// Active filters count
const activeFiltersCount = computed(() => {
  let count = 0
  if (cycleSearchQuery.value) count++
  return count
})

// Initial data fetch
onMounted(async () => {
  await fetchCycles()
})

// Handle cycle click - navigate to detail
function handleCycleClick(cycle: ReviewCycleListItem) {
  router.push(`/reviews/cycles/${cycle.id}`)
}

// Handle page change
function handlePageChange(page: number) {
  setCyclePage(page)
}

// Handle clear filters
function handleClearFilters() {
  clearCycleFilters()
  fetchCycles()
}

// Handle create cycle
async function handleCreateCycle(data: ReviewCycleCreateRequest) {
  isCreating.value = true
  try {
    const cycle = await createCycle(data)
    isCreateModalOpen.value = false
    toast.add({
      title: 'Review Cycle Created',
      description: `"${cycle.name}" has been created as a draft.`,
      color: 'success'
    })
    router.push(`/reviews/cycles/${cycle.id}`)
  }
  catch {
    toast.add({
      title: 'Creation Failed',
      description: 'Failed to create review cycle. Please try again.',
      color: 'error'
    })
  }
  finally {
    isCreating.value = false
  }
}
</script>

<template>
  <div>
    <!-- Page Header -->
    <div class="mb-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-white">Performance Reviews</h1>
          <p class="text-gray-400 mt-1">Manage review cycles and evaluations</p>
        </div>
        <div class="flex items-center gap-2">
          <UButton
            v-if="canCreate"
            color="primary"
            @click="isCreateModalOpen = true"
          >
            <UIcon name="i-heroicons-plus" class="w-4 h-4 mr-1" />
            New Cycle
          </UButton>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <ReviewsCycleFilters class="mb-6" />

    <!-- Error State -->
    <div v-if="error" class="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6">
      <div class="flex items-center gap-3">
        <UIcon name="i-heroicons-exclamation-triangle" class="w-5 h-5 text-red-400" />
        <div>
          <p class="text-red-400 font-medium">Failed to load review cycles</p>
          <p class="text-red-400/70 text-sm">{{ error }}</p>
        </div>
        <UButton variant="outline" color="error" size="sm" class="ml-auto" @click="() => fetchCycles()">
          Retry
        </UButton>
      </div>
    </div>

    <!-- Loading State -->
    <div v-else-if="isLoading && reviewCycles.length === 0" class="flex items-center justify-center py-12">
      <div class="flex items-center gap-3 text-gray-400">
        <UIcon name="i-heroicons-arrow-path" class="w-5 h-5 animate-spin" />
        <span>Loading review cycles...</span>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="reviewCycles.length === 0" class="text-center py-12">
      <div class="bg-gray-800/50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
        <UIcon name="i-heroicons-document-text" class="w-8 h-8 text-gray-500" />
      </div>
      <h3 class="text-lg font-medium text-white mb-2">No review cycles found</h3>
      <p class="text-gray-400 mb-4">
        <template v-if="activeFiltersCount > 0">
          Try adjusting your filters or search query.
        </template>
        <template v-else>
          Get started by creating your first review cycle.
        </template>
      </p>
      <div class="flex items-center justify-center gap-3">
        <UButton
          v-if="activeFiltersCount > 0"
          variant="outline"
          color="neutral"
          @click="handleClearFilters"
        >
          Clear Filters
        </UButton>
        <UButton
          v-if="canCreate"
          color="primary"
          @click="isCreateModalOpen = true"
        >
          <UIcon name="i-heroicons-plus" class="w-4 h-4 mr-1" />
          Create Cycle
        </UButton>
      </div>
    </div>

    <!-- Cycles Grid -->
    <div v-else>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <ReviewsReviewCycleCard
          v-for="cycle in reviewCycles"
          :key="cycle.id"
          :cycle="cycle"
          :search-query="cycleSearchQuery"
          @click="handleCycleClick"
        />
      </div>

      <!-- Pagination -->
      <div v-if="cyclePagination.total_pages > 1" class="mt-6 flex justify-center">
        <UPagination
          :model-value="cyclePagination.page"
          :page-count="cyclePagination.per_page"
          :total="cyclePagination.total_items"
          @update:model-value="handlePageChange"
        />
      </div>
    </div>

    <!-- Create Cycle Modal -->
    <UModal v-model:open="isCreateModalOpen">
      <template #content>
        <div class="p-6">
          <h2 class="text-xl font-semibold text-white mb-6">Create Review Cycle</h2>
          <ReviewsReviewCycleForm
            mode="create"
            @submit="handleCreateCycle"
            @cancel="isCreateModalOpen = false"
          />
        </div>
      </template>
    </UModal>
  </div>
</template>
