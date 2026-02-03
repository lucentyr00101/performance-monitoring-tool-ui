<script setup lang="ts">
import type { ExportFormat } from '~/types/analytics'

definePageMeta({
  layout: 'default',
  middleware: ['auth']
})

const toast = useToast()
const { user } = useAuth()
const {
  employeeAnalytics,
  filters,
  isLoading,
  isExporting,
  lastRefreshed,
  error,
  canViewAnalytics,
  canExportData,
  fetchEmployeeAnalytics,
  setFilters,
  clearFilters,
  exportData
} = useAnalytics()

// Access control (all authenticated users can view their own analytics)
if (!canViewAnalytics('employee')) {
  throw createError({
    statusCode: 403,
    statusMessage: 'You do not have permission to view analytics'
  })
}

// Export modal state
const showExportModal = ref(false)

// Get current user's employee ID
const employeeId = computed(() => user.value?.id || '')

// Initialize data
onMounted(async () => {
  if (employeeId.value) {
    await fetchEmployeeAnalytics(employeeId.value)
  }
})

// Handle filter apply
async function handleApplyFilters() {
  try {
    await fetchEmployeeAnalytics(employeeId.value)
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
    await fetchEmployeeAnalytics(employeeId.value)
  }
  catch {
    // Notification handled by store
  }
}

// Handle export
async function handleExport(format: ExportFormat) {
  try {
    const result = await exportData('employee', format)
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
      title="My Analytics"
      description="View your personal performance metrics and goal progress"
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
        @update:filters="setFilters"
        @apply="handleApplyFilters"
        @clear="handleClearFilters"
      />
    </div>

    <!-- Dashboard -->
    <div class="mt-6">
      <EmployeeAnalyticsDashboard
        :data="employeeAnalytics"
        :loading="isLoading"
      />
    </div>

    <!-- Export Modal -->
    <ExportModal
      v-model:open="showExportModal"
      analytics-type="employee"
      :loading="isExporting"
      @export="handleExportFromModal"
    />
  </div>
</template>
