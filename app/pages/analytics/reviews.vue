<script setup lang="ts">
import type { ExportFormat } from '~/types/analytics'

definePageMeta({
  layout: 'default',
  middleware: ['auth']
})

const toast = useToast()
const {
  reviewCycleAnalytics,
  filters,
  selectedCycleId: _selectedCycleId,
  isLoading,
  isExporting,
  lastRefreshed,
  error,
  canViewAnalytics,
  canExportData,
  fetchReviewCycleAnalytics,
  setFilters,
  setSelectedCycle: _setSelectedCycle,
  clearFilters,
  exportData
} = useAnalytics()

const { departments, fetchDepartments } = useDepartments()
const { reviewCycles, fetchCycles } = useReviews()

// Access control
if (!canViewAnalytics('reviews')) {
  throw createError({
    statusCode: 403,
    statusMessage: 'You do not have permission to view review cycle analytics'
  })
}

// Export modal state
const showExportModal = ref(false)

// Initialize data
onMounted(async () => {
  await Promise.all([
    fetchCycles(),
    fetchDepartments()
  ])
  // Then fetch analytics (might depend on selected cycle)
  await fetchReviewCycleAnalytics()
})

// Handle filter apply
async function handleApplyFilters() {
  try {
    await fetchReviewCycleAnalytics()
  }
  catch {
    // Notification handled by store
  }
}

// Handle filter clear
async function handleClearFilters() {
  clearFilters()
  await handleApplyFilters()
}

// Handle refresh
async function handleRefresh() {
  try {
    await fetchReviewCycleAnalytics()
  }
  catch {
    // Notification handled by store
  }
}

// Handle export
async function handleExport(format: ExportFormat) {
  try {
    const result = await exportData('reviews', format)
    if (result.downloadUrl) {
      toast.add({
        title: 'Export Ready',
        description: `Your ${format.toUpperCase()} file is ready for download`,
        color: 'success'
      })
    }
  }
  catch {
    toast.add({
      title: 'Export Failed',
      description: 'Failed to export analytics data',
      color: 'error'
    })
  }
}

// Handle export from modal
async function handleExportFromModal(options: { format: ExportFormat }) {
  showExportModal.value = false
  await handleExport(options.format)
}

// Department list for filter
const departmentList = computed(() =>
  departments.value.map(d => ({ id: d.id, name: d.name }))
)

// Review cycle list for filter
const cycleList = computed(() =>
  reviewCycles.value.map(c => ({ id: c.id, name: c.name }))
)
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 py-8">
    <!-- Error state -->
    <div v-if="error" class="mb-6">
      <UAlert
        color="error"
        icon="heroicons:exclamation-triangle"
        title="Error loading analytics"
        :description="error"
      />
    </div>

    <!-- Header -->
    <AnalyticsHeader
      title="Review Cycle Analytics"
      description="Monitor review cycle progress and completion by department"
      :last-refreshed="lastRefreshed"
      :loading="isLoading"
      :exporting="isExporting"
      :can-export="canExportData()"
      @refresh="handleRefresh"
      @export="handleExport"
    />

    <!-- Filters -->
    <div class="mt-6">
      <AnalyticsFilters
        :filters="filters"
        :loading="isLoading"
        show-department-filter
        show-cycle-filter
        :departments="departmentList"
        :review-cycles="cycleList"
        @update:filters="setFilters"
        @apply="handleApplyFilters"
        @clear="handleClearFilters"
      />
    </div>

    <!-- Dashboard -->
    <div class="mt-6">
      <ReviewCycleAnalyticsDashboard
        :data="reviewCycleAnalytics"
        :loading="isLoading"
      />
    </div>

    <!-- Export Modal -->
    <ExportModal
      v-model:open="showExportModal"
      analytics-type="reviews"
      :loading="isExporting"
      @export="handleExportFromModal"
    />
  </div>
</template>
