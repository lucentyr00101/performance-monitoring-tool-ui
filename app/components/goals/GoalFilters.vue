<script setup lang="ts">
import type { GoalType, GoalStatus, GoalPriority } from '~/types/goal'

const { 
  filters, 
  searchQuery, 
  activeFiltersCount, 
  updateFilter, 
  clearFilters,
  applyFiltersAndFetch
} = useGoals()

const typeOptions = [
  { label: 'All Types', value: 'all' },
  { label: 'Individual', value: 'individual' },
  { label: 'Team', value: 'team' },
  { label: 'Department', value: 'department' },
  { label: 'Company', value: 'company' }
]

const statusOptions = [
  { label: 'All Statuses', value: 'all' },
  { label: 'Draft', value: 'draft' },
  { label: 'Pending', value: 'pending' },
  { label: 'Active', value: 'active' },
  { label: 'Completed', value: 'completed' },
  { label: 'Cancelled', value: 'cancelled' }
]

const priorityOptions = [
  { label: 'All Priorities', value: 'all' },
  { label: 'High', value: 'high' },
  { label: 'Medium', value: 'medium' },
  { label: 'Low', value: 'low' }
]

const selectedType = ref(filters.value.type || 'all')
const selectedStatus = ref(filters.value.status || 'all')
const selectedPriority = ref(filters.value.priority || 'all')

watch(selectedType, (value) => {
  updateFilter('type', value === 'all' ? undefined : value as GoalType)
  applyFiltersAndFetch()
})

watch(selectedStatus, (value) => {
  updateFilter('status', value === 'all' ? undefined : value as GoalStatus)
  applyFiltersAndFetch()
})

watch(selectedPriority, (value) => {
  updateFilter('priority', value === 'all' ? undefined : value as GoalPriority)
  applyFiltersAndFetch()
})

function handleClearFilters() {
  selectedType.value = 'all'
  selectedStatus.value = 'all'
  selectedPriority.value = 'all'
  clearFilters()
  applyFiltersAndFetch()
}
</script>

<template>
  <div class="space-y-4">
    <!-- Search -->
    <UInput
      v-model="searchQuery"
      placeholder="Search goals..."
      icon="i-heroicons-magnifying-glass"
      size="lg"
      class="w-full"
    />

    <!-- Filters Row -->
    <div class="flex flex-wrap items-center gap-3">
      <!-- Type Filter -->
      <USelect
        v-model="selectedType"
        :items="typeOptions"
        placeholder="Type"
        class="w-40"
      />

      <!-- Status Filter -->
      <USelect
        v-model="selectedStatus"
        :items="statusOptions"
        placeholder="Status"
        class="w-40"
      />

      <!-- Priority Filter -->
      <USelect
        v-model="selectedPriority"
        :items="priorityOptions"
        placeholder="Priority"
        class="w-40"
      />

      <!-- Clear Filters -->
      <UButton
        v-if="activeFiltersCount > 0"
        variant="ghost"
        color="neutral"
        size="sm"
        @click="handleClearFilters"
      >
        Clear filters ({{ activeFiltersCount }})
      </UButton>
    </div>
  </div>
</template>
