<script setup lang="ts">
import type { ExportFormat } from '~/types/analytics'

definePageMeta({
  layout: 'default',
  middleware: ['auth']
})

const toast = useToast()
const {
  goalAnalytics,
  filters,
  isLoading,
  isExporting,
  lastRefreshed,
  error,
  canViewAnalytics,
  canExportData,
  fetchGoalAnalytics,
  setFilters,
  clearFilters,
  exportData
} = useAnalytics()

const { departments, fetchDepartments } = useDepartments()

// Access control
if (!canViewAnalytics('goals')) {
  throw createError({
    statusCode: 403,
    statusMessage: 'You do not have permission to view goal analytics'
  })
}

// Export modal state
const showExportModal = ref(false)

// Initialize data
onMounted(async () => {
  await Promise.all([
    fetchGoalAnalytics(),
    fetchDepartments()
  ])
})

// Handle filter apply
async function handleApplyFilters() {
  try {
    await fetchGoalAnalytics()
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
    await fetchGoalAnalytics()
  }
  catch {
    // Notification handled by store
  }
}

// Handle export
async function handleExport(format: ExportFormat) {
  try {
    const result = await exportData('goals', format)
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
      title="Goal Analytics"
      description="Track goal completion rates, trends, and department performance"
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
        show-goal-type-filter
        :departments="departmentList"
        @update:filters="setFilters"
        @apply="handleApplyFilters"
        @clear="handleClearFilters"
      />
    </div>

    <!-- Dashboard -->
    <div class="mt-6">
      <GoalAnalyticsDashboard
        :data="goalAnalytics"
        :loading="isLoading"
      />
    </div>

    <!-- Export Modal -->
    <ExportModal
      v-model:open="showExportModal"
      analytics-type="goals"
      :loading="isExporting"
      @export="handleExportFromModal"
    />
  </div>
</template>
