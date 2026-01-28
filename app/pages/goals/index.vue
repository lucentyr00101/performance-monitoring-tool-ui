<script setup lang="ts">
import type { GoalListItem, GoalCreateRequest } from '~/types/goal'

definePageMeta({
  layout: 'default',
  middleware: ['auth']
})

const router = useRouter()
const toast = useToast()

const {
  goals,
  isLoading,
  error,
  pagination,
  viewMode,
  searchQuery,
  activeFiltersCount,
  fetchGoals,
  createGoal,
  setPage,
  setViewMode,
  clearFilters,
  canCreateGoal
} = useGoals()

// Check if user can create goals
const canCreate = computed(() => canCreateGoal('individual'))

// Create modal state
const isCreateModalOpen = ref(false)
const isCreating = ref(false)

// Initial data fetch
onMounted(async () => {
  await fetchGoals()
})

// Handle goal click - navigate to detail
function handleGoalClick(goal: GoalListItem) {
  router.push(`/goals/${goal.id}`)
}

// Handle page change
function handlePageChange(page: number) {
  setPage(page)
}

// Handle view mode change
function handleViewModeChange(mode: 'grid' | 'list' | 'kanban') {
  setViewMode(mode)
}

// Handle clear filters
function handleClearFilters() {
  clearFilters()
  fetchGoals()
}

// Handle create goal
async function handleCreateGoal(data: GoalCreateRequest) {
  isCreating.value = true
  try {
    const goal = await createGoal(data)
    isCreateModalOpen.value = false
    toast.add({
      title: 'Goal Created',
      description: `"${goal.title}" has been created.`,
      color: 'success'
    })
    router.push(`/goals/${goal.id}`)
  }
  catch {
    toast.add({
      title: 'Creation Failed',
      description: 'Failed to create goal. Please try again.',
      color: 'error'
    })
  }
  finally {
    isCreating.value = false
  }
}

// View mode options
const viewModeOptions = [
  { icon: 'i-heroicons-squares-2x2', value: 'grid' as const, label: 'Grid' },
  { icon: 'i-heroicons-list-bullet', value: 'list' as const, label: 'List' },
  { icon: 'i-heroicons-view-columns', value: 'kanban' as const, label: 'Kanban' }
]
</script>

<template>
  <div>
    <!-- Page Header -->
    <div class="mb-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-white">Goals & OKRs</h1>
          <p class="text-gray-400 mt-1">Track and manage performance goals</p>
        </div>
        <div class="flex items-center gap-2">
          <!-- View Mode Toggle -->
          <div class="flex items-center bg-gray-800 rounded-lg p-1">
            <button
              v-for="option in viewModeOptions"
              :key="option.value"
              class="p-2 rounded transition-colors"
              :class="viewMode === option.value ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'"
              :title="option.label"
              @click="handleViewModeChange(option.value)"
            >
              <UIcon :name="option.icon" class="w-4 h-4" />
            </button>
          </div>

          <UButton
            v-if="canCreate"
            color="primary"
            @click="isCreateModalOpen = true"
          >
            <UIcon name="i-heroicons-plus" class="w-4 h-4 mr-1" />
            New Goal
          </UButton>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <GoalsGoalFilters class="mb-6" />

    <!-- Error State -->
    <div v-if="error" class="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6">
      <div class="flex items-center gap-3">
        <UIcon name="i-heroicons-exclamation-triangle" class="w-5 h-5 text-red-400" />
        <div>
          <p class="text-red-400 font-medium">Failed to load goals</p>
          <p class="text-red-400/70 text-sm">{{ error }}</p>
        </div>
        <UButton variant="outline" color="error" size="sm" class="ml-auto" @click="() => fetchGoals()">
          Retry
        </UButton>
      </div>
    </div>

    <!-- Loading State -->
    <div v-else-if="isLoading && goals.length === 0" class="flex items-center justify-center py-12">
      <div class="flex items-center gap-3 text-gray-400">
        <UIcon name="i-heroicons-arrow-path" class="w-5 h-5 animate-spin" />
        <span>Loading goals...</span>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="goals.length === 0" class="text-center py-12">
      <div class="bg-gray-800/50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
        <UIcon name="i-heroicons-flag" class="w-8 h-8 text-gray-500" />
      </div>
      <h3 class="text-lg font-medium text-white mb-2">No goals found</h3>
      <p class="text-gray-400 mb-4">
        <template v-if="activeFiltersCount > 0">
          Try adjusting your filters or search query.
        </template>
        <template v-else>
          Get started by creating your first goal.
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
          Create Goal
        </UButton>
      </div>
    </div>

    <!-- Goals Grid -->
    <div v-else>
      <div
        v-if="viewMode === 'grid'"
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        <GoalsGoalCard
          v-for="goal in goals"
          :key="goal.id"
          :goal="goal"
          :search-query="searchQuery"
          @click="handleGoalClick"
        />
      </div>

      <!-- List View -->
      <div v-else-if="viewMode === 'list'" class="space-y-3">
        <div
          v-for="goal in goals"
          :key="goal.id"
          class="bg-gray-900 border border-gray-800 rounded-lg p-4 hover:border-gray-700 cursor-pointer transition-colors"
          @click="handleGoalClick(goal)"
        >
          <div class="flex items-center gap-4">
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-1">
                <GoalsGoalTypeBadge :type="goal.type" size="xs" />
                <GoalsGoalStatusBadge :status="goal.status" size="xs" />
              </div>
              <h3 class="font-medium text-white truncate">{{ goal.title }}</h3>
              <p class="text-sm text-gray-400 truncate">{{ goal.description }}</p>
            </div>
            <div class="w-32">
              <GoalsGoalProgressBar :progress="goal.progress" size="sm" :show-label="false" />
              <div class="text-xs text-gray-400 text-right mt-1">{{ goal.progress }}%</div>
            </div>
            <div class="flex items-center gap-2">
              <UAvatar :src="goal.owner.avatar_url" :alt="goal.owner.name || `${goal.owner.first_name} ${goal.owner.last_name}`" size="sm" />
            </div>
          </div>
        </div>
      </div>

      <!-- TODO: Kanban View -->
      <div v-else-if="viewMode === 'kanban'" class="text-center py-12 text-gray-400">
        Kanban view coming soon...
      </div>

      <!-- Pagination -->
      <div v-if="pagination.total_pages > 1" class="mt-6 flex justify-center">
        <UPagination
          :model-value="pagination.page"
          :page-count="pagination.per_page"
          :total="pagination.total_items"
          @update:model-value="handlePageChange"
        />
      </div>
    </div>

    <!-- Create Goal Modal -->
    <UModal v-model:open="isCreateModalOpen">
      <template #content>
        <div class="p-6">
          <h2 class="text-xl font-semibold text-white mb-6">Create New Goal</h2>
          <GoalsGoalForm
            mode="create"
            @submit="handleCreateGoal"
            @cancel="isCreateModalOpen = false"
          />
        </div>
      </template>
    </UModal>
  </div>
</template>
