<script setup lang="ts">
import type { ReviewStatus, ReviewType } from '~/types/review'

interface Props {
  cycleId?: string
}

const props = defineProps<Props>()

const { 
  reviewSearchQuery,
  reviewFilters,
  clearReviewFilters,
  updateReviewFilter,
  applyReviewFiltersAndFetch
} = useReviews()

// Local filter state synced with store
const statusFilter = ref<ReviewStatus | undefined>(reviewFilters.value.status)
const typeFilter = ref<ReviewType | undefined>(reviewFilters.value.type)

const statusOptions = [
  { label: 'All Status', value: undefined },
  { label: 'Pending', value: 'pending' as ReviewStatus },
  { label: 'In Progress', value: 'in_progress' as ReviewStatus },
  { label: 'Submitted', value: 'submitted' as ReviewStatus },
  { label: 'Acknowledged', value: 'acknowledged' as ReviewStatus }
]

const typeOptions = [
  { label: 'All Types', value: undefined },
  { label: 'Self Assessment', value: 'self' as ReviewType },
  { label: 'Manager Review', value: 'manager' as ReviewType },
  { label: 'Peer Review', value: 'peer' as ReviewType }
]

// Sync filters with store
watch(statusFilter, (value) => {
  updateReviewFilter('status', value)
  applyReviewFiltersAndFetch()
})

watch(typeFilter, (value) => {
  updateReviewFilter('type', value)
  applyReviewFiltersAndFetch()
})

// Set cycle_id filter if provided
watch(() => props.cycleId, (value) => {
  if (value) {
    updateReviewFilter('cycle_id', value)
  }
}, { immediate: true })

// Clear all filters
function handleClearFilters() {
  statusFilter.value = undefined
  typeFilter.value = undefined
  clearReviewFilters()
  // Re-apply cycle filter if present
  if (props.cycleId) {
    updateReviewFilter('cycle_id', props.cycleId)
  }
  applyReviewFiltersAndFetch()
}

const hasActiveFilters = computed(() => {
  return statusFilter.value !== undefined || 
         typeFilter.value !== undefined || 
         reviewSearchQuery.value !== ''
})
</script>

<template>
  <div class="bg-gray-900 border border-gray-800 rounded-lg p-4">
    <div class="flex flex-col lg:flex-row lg:items-center gap-4">
      <!-- Search -->
      <div class="flex-1">
        <UInput
          v-model="reviewSearchQuery"
          placeholder="Search by employee name..."
          icon="i-heroicons-magnifying-glass"
          class="w-full"
        />
      </div>

      <!-- Filters -->
      <div class="flex flex-wrap items-center gap-3">
        <!-- Status Filter -->
        <USelect
          v-model="statusFilter"
          :items="statusOptions"
          placeholder="Status"
          value-key="value"
          class="w-36"
        />

        <!-- Type Filter -->
        <USelect
          v-model="typeFilter"
          :items="typeOptions"
          placeholder="Type"
          value-key="value"
          class="w-40"
        />

        <!-- Clear Filters -->
        <UButton
          v-if="hasActiveFilters"
          variant="ghost"
          color="neutral"
          size="sm"
          @click="handleClearFilters"
        >
          <UIcon name="i-heroicons-x-mark" class="w-4 h-4 mr-1" />
          Clear
        </UButton>
      </div>
    </div>
  </div>
</template>
