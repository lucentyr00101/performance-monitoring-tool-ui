<script setup lang="ts">
import type { ReviewCycleStatus, ReviewCycleType, ReviewStatus, ReviewType } from '~/types/review'

const { 
  cycleSearchQuery,
  cycleFilters,
  clearCycleFilters,
  updateCycleFilter,
  applyCycleFiltersAndFetch
} = useReviews()

// Local filter state synced with store
const statusFilter = ref<ReviewCycleStatus | undefined>(cycleFilters.value.status)
const typeFilter = ref<ReviewCycleType | undefined>(cycleFilters.value.type)

const statusOptions = [
  { label: 'All Status', value: undefined },
  { label: 'Draft', value: 'draft' as ReviewCycleStatus },
  { label: 'Active', value: 'active' as ReviewCycleStatus },
  { label: 'Completed', value: 'completed' as ReviewCycleStatus },
  { label: 'Cancelled', value: 'cancelled' as ReviewCycleStatus }
]

const typeOptions = [
  { label: 'All Types', value: undefined },
  { label: 'Annual', value: 'annual' as ReviewCycleType },
  { label: 'Semi-Annual', value: 'semi-annual' as ReviewCycleType },
  { label: 'Quarterly', value: 'quarterly' as ReviewCycleType },
  { label: 'Monthly', value: 'monthly' as ReviewCycleType }
]

// Sync filters with store
watch(statusFilter, (value) => {
  updateCycleFilter('status', value)
  applyCycleFiltersAndFetch()
})

watch(typeFilter, (value) => {
  updateCycleFilter('type', value)
  applyCycleFiltersAndFetch()
})

// Clear all filters
function handleClearFilters() {
  statusFilter.value = undefined
  typeFilter.value = undefined
  clearCycleFilters()
  applyCycleFiltersAndFetch()
}

const hasActiveFilters = computed(() => {
  return statusFilter.value !== undefined || 
         typeFilter.value !== undefined || 
         cycleSearchQuery.value !== ''
})
</script>

<template>
  <div class="bg-gray-900 border border-gray-800 rounded-lg p-4">
    <div class="flex flex-col lg:flex-row lg:items-center gap-4">
      <!-- Search -->
      <div class="flex-1">
        <UInput
          v-model="cycleSearchQuery"
          placeholder="Search review cycles..."
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
          class="w-36"
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
