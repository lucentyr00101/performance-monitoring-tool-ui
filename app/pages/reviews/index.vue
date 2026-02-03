<script setup lang="ts">
import type { ReviewCycleListItem, ReviewCycleCreateRequest } from '~/types/review'

definePageMeta({
  layout: 'default',
  middleware: ['auth']
})

const router = useRouter()
const authStore = useAuthStore()

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

// Check if user can trigger ad-hoc reviews
const canTriggerReviews = computed(() => {
  const role = authStore.user?.role
  return role === 'hr' || role === 'manager' || role === 'csuite'
})

// Check if user can manage review forms (HR/Admin only)
const canManageForms = computed(() => {
  const role = authStore.user?.role
  return role === 'hr' || role === 'admin'
})

// Tab navigation
const tabs = computed(() => {
  const baseTabs = [
    { 
      key: 'cycles', 
      label: 'Review Cycles', 
      icon: 'i-heroicons-calendar-days' 
    },
    { 
      key: 'adhoc', 
      label: 'Ad-Hoc Reviews', 
      icon: 'i-heroicons-clipboard-document-check' 
    }
  ]
  
  // Add Form Templates tab for HR/Admin
  if (canManageForms.value) {
    baseTabs.push({
      key: 'forms',
      label: 'Form Templates',
      icon: 'i-heroicons-document-duplicate'
    })
  }
  
  return baseTabs
})
const activeTab = ref('cycles')

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
    router.push(`/reviews/cycles/${cycle.id}`)
  }
  catch {
    // Notification handled by store
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
            v-if="canTriggerReviews && activeTab === 'adhoc'"
            variant="outline"
            color="neutral"
            @click="router.push('/reviews/adhoc')"
          >
            <UIcon name="i-heroicons-plus" class="w-4 h-4 mr-1" />
            Trigger Review
          </UButton>
          <UButton
            v-if="canCreate && activeTab === 'cycles'"
            color="primary"
            @click="isCreateModalOpen = true"
          >
            <UIcon name="i-heroicons-plus" class="w-4 h-4 mr-1" />
            New Cycle
          </UButton>
        </div>
      </div>
    </div>

    <!-- Tab Navigation -->
    <div class="border-b border-gray-800 mb-6">
      <nav class="flex gap-4">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          class="flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors"
          :class="activeTab === tab.key 
            ? 'text-primary-500 border-primary-500' 
            : 'text-gray-400 border-transparent hover:text-white hover:border-gray-600'"
          @click="activeTab = tab.key"
        >
          <UIcon :name="tab.icon" class="w-4 h-4" />
          {{ tab.label }}
        </button>
      </nav>
    </div>

    <!-- Review Cycles Tab -->
    <template v-if="activeTab === 'cycles'">
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
        <div v-if="cyclePagination.totalPages > 1" class="mt-6 flex justify-center">
          <UPagination
            :model-value="cyclePagination.page"
            :page-count="cyclePagination.perPage"
            :total="cyclePagination.totalItems"
            @update:model-value="handlePageChange"
          />
        </div>
      </div>
    </template>

    <!-- Ad-Hoc Reviews Tab -->
    <template v-if="activeTab === 'adhoc'">
      <AdhocReviewList show-filters />
    </template>

    <!-- Form Templates Tab (HR/Admin only) -->
    <template v-if="activeTab === 'forms' && canManageForms">
      <div class="flex flex-col gap-4">
        <div class="flex items-center justify-between">
          <p class="text-gray-400">Manage review form templates used for performance evaluations.</p>
          <UButton
            color="primary"
            @click="navigateTo('/reviews/forms/new')"
          >
            <UIcon name="i-heroicons-plus" class="w-4 h-4 mr-1" />
            New Form
          </UButton>
        </div>
        <FormList
          @create="navigateTo('/reviews/forms/new')"
          @view="(id: string) => navigateTo(`/reviews/forms/${id}`)"
          @edit="(id: string) => navigateTo(`/reviews/forms/${id}?edit=true`)"
        />
      </div>
    </template>

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
