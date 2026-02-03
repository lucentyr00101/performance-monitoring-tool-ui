<script setup lang="ts">
import type { DateRangePreset, AnalyticsFilters } from '~/types/analytics'
import type { GoalType } from '~/types/goal'

const props = withDefaults(defineProps<{
  filters: AnalyticsFilters
  showDepartmentFilter?: boolean
  showGoalTypeFilter?: boolean
  showCycleFilter?: boolean
  departments?: { id: string; name: string }[]
  reviewCycles?: { id: string; name: string }[]
  loading?: boolean
}>(), {
  showDepartmentFilter: false,
  showGoalTypeFilter: false,
  showCycleFilter: false,
  loading: false
})

const emit = defineEmits<{
  'update:filters': [filters: AnalyticsFilters]
  apply: []
  clear: []
}>()

// Local state for custom date range
const showCustomDates = ref(props.filters.dateRange === 'custom')

// Date range options
const dateRangeOptions = [
  { value: 'last_7_days', label: 'Last 7 Days' },
  { value: 'last_30_days', label: 'Last 30 Days' },
  { value: 'last_quarter', label: 'Last Quarter' },
  { value: 'last_year', label: 'Last Year' },
  { value: 'custom', label: 'Custom Range' }
]

// Goal type options
const goalTypeOptions = [
  { value: undefined, label: 'All Types' },
  { value: 'individual', label: 'Individual' },
  { value: 'team', label: 'Team' },
  { value: 'department', label: 'Department' },
  { value: 'company', label: 'Company' }
]

// Update filter value
function updateFilter<K extends keyof AnalyticsFilters>(key: K, value: AnalyticsFilters[K]) {
  emit('update:filters', { ...props.filters, [key]: value })

  // Handle custom date range toggle
  if (key === 'dateRange') {
    showCustomDates.value = value === 'custom'
    if (value !== 'custom') {
      // Clear custom dates when switching to preset
      emit('update:filters', {
        ...props.filters,
        dateRange: value as DateRangePreset,
        startDate: undefined,
        endDate: undefined
      })
    }
  }
}

// Clear all filters
function clearFilters() {
  showCustomDates.value = false
  emit('clear')
}

// Apply filters
function applyFilters() {
  emit('apply')
}

// Computed for department select
const departmentOptions = computed(() => [
  { value: undefined, label: 'All Departments' },
  ...(props.departments || []).map(d => ({ value: d.id, label: d.name }))
])

// Computed for cycle select
const cycleOptions = computed(() => [
  { value: undefined, label: 'All Cycles' },
  ...(props.reviewCycles || []).map(c => ({ value: c.id, label: c.name }))
])

// Active filters count
const activeFiltersCount = computed(() => {
  let count = 0
  if (props.filters.dateRange && props.filters.dateRange !== 'last_30_days') count++
  if (props.filters.departmentId) count++
  if (props.filters.goalType) count++
  if (props.filters.reviewCycleId) count++
  if (props.filters.startDate && props.filters.endDate) count++
  return count
})
</script>

<template>
  <div class="bg-gray-900 border border-gray-800 rounded-lg p-4">
    <div class="flex flex-wrap items-end gap-4">
      <!-- Date Range -->
      <div class="flex-1 min-w-[180px]">
        <label class="block text-sm font-medium text-gray-400 mb-1">Date Range</label>
        <USelectMenu
          :model-value="filters.dateRange || 'last_30_days'"
          :options="dateRangeOptions"
          value-attribute="value"
          option-attribute="label"
          :disabled="loading"
          @update:model-value="updateFilter('dateRange', $event as DateRangePreset)"
        />
      </div>

      <!-- Custom Date Range -->
      <template v-if="showCustomDates">
        <div class="min-w-[150px]">
          <label class="block text-sm font-medium text-gray-400 mb-1">Start Date</label>
          <UInput
            type="date"
            :model-value="filters.startDate"
            :disabled="loading"
            @update:model-value="updateFilter('startDate', $event)"
          />
        </div>
        <div class="min-w-[150px]">
          <label class="block text-sm font-medium text-gray-400 mb-1">End Date</label>
          <UInput
            type="date"
            :model-value="filters.endDate"
            :disabled="loading"
            @update:model-value="updateFilter('endDate', $event)"
          />
        </div>
      </template>

      <!-- Department Filter -->
      <div v-if="showDepartmentFilter" class="flex-1 min-w-[180px]">
        <label class="block text-sm font-medium text-gray-400 mb-1">Department</label>
        <USelectMenu
          :model-value="filters.departmentId"
          :options="departmentOptions"
          value-attribute="value"
          option-attribute="label"
          :disabled="loading"
          @update:model-value="updateFilter('departmentId', $event as string | undefined)"
        />
      </div>

      <!-- Goal Type Filter -->
      <div v-if="showGoalTypeFilter" class="flex-1 min-w-[150px]">
        <label class="block text-sm font-medium text-gray-400 mb-1">Goal Type</label>
        <USelectMenu
          :model-value="filters.goalType"
          :options="goalTypeOptions"
          value-attribute="value"
          option-attribute="label"
          :disabled="loading"
          @update:model-value="updateFilter('goalType', $event as GoalType)"
        />
      </div>

      <!-- Review Cycle Filter -->
      <div v-if="showCycleFilter" class="flex-1 min-w-[200px]">
        <label class="block text-sm font-medium text-gray-400 mb-1">Review Cycle</label>
        <USelectMenu
          :model-value="filters.reviewCycleId"
          :options="cycleOptions"
          value-attribute="value"
          option-attribute="label"
          :disabled="loading"
          @update:model-value="updateFilter('reviewCycleId', $event as string | undefined)"
        />
      </div>

      <!-- Action buttons -->
      <div class="flex items-center gap-2">
        <UButton
          color="primary"
          :disabled="loading"
          :loading="loading"
          @click="applyFilters"
        >
          Apply
        </UButton>
        <UButton
          v-if="activeFiltersCount > 0"
          variant="ghost"
          color="neutral"
          :disabled="loading"
          @click="clearFilters"
        >
          Clear ({{ activeFiltersCount }})
        </UButton>
      </div>
    </div>
  </div>
</template>
