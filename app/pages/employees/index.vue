<script setup lang="ts">
import type { EmployeeCreateRequest } from '~/types/employee'
import { useEmployees } from '~/composables/useEmployees'
import { useDepartments } from '~/composables/useDepartments'

definePageMeta({
  layout: 'default',
  middleware: ['auth']
})

const router = useRouter()
const employeeStore = useEmployeeStore()
const toast = useToast()
const { user } = useAuth()

// Check if user can create/export employees
const canCreate = computed(() => {
  const role = user.value?.role
  return role === 'admin' || role === 'hr'
})

const canExport = computed(() => {
  const role = user.value?.role
  return role === 'admin' || role === 'hr'
})

// Create modal state
const isCreateModalOpen = ref(false)
const isCreating = ref(false)

// Employee data
const {
  employees,
  isLoading,
  error,
  filters,
  pagination,
  sortBy,
  sortOrder,
  viewMode,
  searchQuery,
  fetchEmployees,
  setFilters,
  setSort,
  setPage,
  setViewMode,
  clearFilters,
  applyFiltersAndFetch
} = useEmployees()

// Department data for filters
const { departments, fetchDepartments } = useDepartments()

// Initial data fetch
onMounted(async () => {
  await Promise.all([
    fetchEmployees(),
    fetchDepartments()
  ])
})

// Note: Removed reactive watcher to prevent infinite loops
// Fetching is handled by user actions:
// - setPage() calls fetchEmployees()
// - setSort() triggers manual fetch
// - applyFiltersAndFetch() triggers fetch
// - debouncedSearch in useEmployees() triggers fetch

// Handle employee click - navigate to profile
function handleEmployeeClick(employee: { id: string }) {
  router.push(`/employees/${employee.id}`)
}

// Handle page change
function handlePageChange(page: number) {
  setPage(page)
}

// Handle sort change
function handleSortChange(field: typeof sortBy.value) {
  setSort(field)
  fetchEmployees()
}

// Handle view mode change
function handleViewModeChange(mode: 'grid' | 'list') {
  setViewMode(mode)
}

// Handle filter update
function handleFilterUpdate(newFilters: typeof filters.value) {
  setFilters(newFilters)
}

// Handle apply filters
function handleApplyFilters() {
  applyFiltersAndFetch()
}

// Handle clear filters
function handleClearFilters() {
  clearFilters()
  fetchEmployees()
}

// Handle export
async function handleExport(format: 'csv' | 'xlsx') {
  // TODO: Implement export functionality in Phase 4
  console.log('Export as:', format)
}

// Handle create employee
async function handleCreateEmployee(data: EmployeeCreateRequest) {
  isCreating.value = true
  try {
    const employee = await employeeStore.createEmployee(data)
    isCreateModalOpen.value = false
    toast.add({
      title: 'Employee Created',
      description: `${employee.first_name} ${employee.last_name} has been added.`,
      color: 'success'
    })
    // Navigate to new employee profile
    router.push(`/employees/${employee.id}`)
  }
  catch {
    toast.add({
      title: 'Creation Failed',
      description: 'Failed to create employee. Please try again.',
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
          <h1 class="text-2xl font-bold text-white">Employees</h1>
          <p class="text-gray-400 mt-1">Manage employee directory and profiles</p>
        </div>
        <div class="flex items-center gap-2">
          <NuxtLink to="/employees/departments">
            <UButton variant="outline" color="neutral">
              <UIcon name="i-heroicons-building-office-2" class="w-4 h-4 mr-1" />
              Departments
            </UButton>
          </NuxtLink>
          <NuxtLink to="/employees/org-chart">
            <UButton variant="outline" color="neutral">
              <UIcon name="i-heroicons-rectangle-group" class="w-4 h-4 mr-1" />
              Org Chart
            </UButton>
          </NuxtLink>
          <UButton
            v-if="canCreate"
            variant="solid"
            color="primary"
            @click="isCreateModalOpen = true"
          >
            <UIcon name="i-heroicons-plus" class="w-4 h-4 mr-1" />
            Add Employee
          </UButton>
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div v-if="error" class="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6">
      <div class="flex items-center gap-3">
        <UIcon name="i-heroicons-exclamation-triangle" class="w-5 h-5 text-red-400" />
        <div>
          <p class="text-red-400 font-medium">Failed to load employees</p>
          <p class="text-red-400/70 text-sm">{{ error }}</p>
        </div>
        <UButton variant="outline" color="error" size="sm" class="ml-auto" @click="() => fetchEmployees()">
          Retry
        </UButton>
      </div>
    </div>

    <!-- Directory Component -->
    <EmployeesEmployeeDirectory
      :employees="employees"
      :departments="departments"
      :filters="filters"
      :pagination="pagination"
      :sort-by="sortBy"
      :sort-order="sortOrder"
      :view-mode="viewMode"
      :search-query="searchQuery"
      :is-loading="isLoading"
      :can-export="canExport"
      @update:search-query="searchQuery = $event"
      @update:view-mode="handleViewModeChange"
      @update:filters="handleFilterUpdate"
      @update:sort-by="handleSortChange"
      @employee-click="handleEmployeeClick"
      @page-change="handlePageChange"
      @apply-filters="handleApplyFilters"
      @clear-filters="handleClearFilters"
      @export="handleExport"
    />

    <!-- Create Employee Modal -->
    <EmployeesEmployeeCreateModal
      v-if="canCreate"
      :is-open="isCreateModalOpen"
      :is-saving="isCreating"
      @close="isCreateModalOpen = false"
      @save="handleCreateEmployee"
    />
  </div>
</template>
