<script setup lang="ts">
import type { EmployeeListItem, EmployeeFilters, EmployeeListParams } from '~/types/employee'
import type { DepartmentListItem } from '~/types/department'

interface Props {
  employees: EmployeeListItem[]
  departments: DepartmentListItem[]
  filters: EmployeeFilters
  pagination: {
    page: number
    per_page: number
    total_items: number
    total_pages: number
  }
  sortBy: EmployeeListParams['sort_by']
  sortOrder: EmployeeListParams['sort_order']
  viewMode: 'grid' | 'list'
  searchQuery: string
  isLoading: boolean
  canExport?: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:searchQuery': [value: string]
  'update:viewMode': [mode: 'grid' | 'list']
  'update:filters': [filters: EmployeeFilters]
  'update:sortBy': [field: EmployeeListParams['sort_by']]
  employeeClick: [employee: EmployeeListItem]
  pageChange: [page: number]
  applyFilters: []
  clearFilters: []
  export: [format: 'csv' | 'xlsx']
}>()

// Mobile filter panel state
const showFilters = ref(false)

// Sort options
const sortOptions = [
  { label: 'Last Name', value: 'last_name' },
  { label: 'First Name', value: 'first_name' },
  { label: 'Department', value: 'department' },
  { label: 'Hire Date', value: 'hire_date' }
]

// Get managers list from employees
const managers = computed(() => {
  const managerSet = new Set<string>()
  const managerList: { id: string; name: string }[] = []
  
  props.employees.forEach(emp => {
    if (emp.manager && !managerSet.has(emp.manager.id)) {
      managerSet.add(emp.manager.id)
      managerList.push({
        id: emp.manager.id,
        name: `${emp.manager.first_name} ${emp.manager.last_name}`
      })
    }
  })
  
  return managerList.sort((a, b) => a.name.localeCompare(b.name))
})

// Active filter count
const activeFilterCount = computed(() => {
  return Object.values(props.filters).filter(v => v !== undefined && v !== '').length
})

// Handle sort change
function handleSortChange(value: string) {
  emit('update:sortBy', value as EmployeeListParams['sort_by'])
}

// Handle employee click
function handleEmployeeClick(employee: EmployeeListItem) {
  emit('employeeClick', employee)
}

// Pagination display
const paginationDisplay = computed(() => {
  const start = (props.pagination.page - 1) * props.pagination.per_page + 1
  const end = Math.min(props.pagination.page * props.pagination.per_page, props.pagination.total_items)
  return `${start}-${end} of ${props.pagination.total_items}`
})
</script>

<template>
  <div class="space-y-4">
    <!-- Header / Search / Controls -->
    <div class="flex flex-col lg:flex-row lg:items-center gap-4">
      <!-- Search -->
      <div class="flex-1">
        <UInput
          :model-value="searchQuery"
          placeholder="Search employees by name, email, or title..."
          icon="i-heroicons-magnifying-glass"
          size="lg"
          class="w-full"
          @update:model-value="emit('update:searchQuery', $event)"
        />
      </div>

      <!-- Controls -->
      <div class="flex items-center gap-2">
        <!-- Filter toggle (mobile) -->
        <UButton
          variant="outline"
          color="neutral"
          class="lg:hidden"
          @click="showFilters = !showFilters"
        >
          <UIcon name="i-heroicons-funnel" class="w-4 h-4" />
          <span v-if="activeFilterCount > 0" class="ml-1">({{ activeFilterCount }})</span>
        </UButton>

        <!-- Sort -->
        <USelectMenu
          :model-value="sortBy"
          :items="sortOptions"
          value-key="value"
          class="w-40"
          @update:model-value="handleSortChange"
        >
          <template #leading>
            <UIcon name="i-heroicons-arrows-up-down" class="w-4 h-4 text-gray-400" />
          </template>
        </USelectMenu>

        <!-- View toggle -->
        <div class="flex items-center border border-gray-700 rounded-lg overflow-hidden">
          <button
            class="p-2 transition-colors"
            :class="viewMode === 'grid' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'"
            @click="emit('update:viewMode', 'grid')"
          >
            <UIcon name="i-heroicons-squares-2x2" class="w-5 h-5" />
          </button>
          <button
            class="p-2 transition-colors"
            :class="viewMode === 'list' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'"
            @click="emit('update:viewMode', 'list')"
          >
            <UIcon name="i-heroicons-bars-3" class="w-5 h-5" />
          </button>
        </div>

        <!-- Export (HR/Admin only) -->
        <UDropdownMenu
          v-if="canExport"
          :items="[[
            { label: 'Export as CSV', icon: 'i-heroicons-document-text', click: () => emit('export', 'csv') },
            { label: 'Export as Excel', icon: 'i-heroicons-table-cells', click: () => emit('export', 'xlsx') }
          ]]"
        >
          <UButton variant="outline" color="neutral">
            <UIcon name="i-heroicons-arrow-down-tray" class="w-4 h-4" />
            <span class="hidden sm:inline ml-1">Export</span>
          </UButton>
        </UDropdownMenu>
      </div>
    </div>

    <!-- Main Content -->
    <div class="flex gap-6">
      <!-- Filters Sidebar (Desktop) -->
      <div class="hidden lg:block w-64 flex-shrink-0">
        <EmployeesEmployeeFilters
          :filters="filters"
          :departments="departments"
          :managers="managers"
          :is-loading="isLoading"
          @update:filters="emit('update:filters', $event)"
          @apply="emit('applyFilters')"
          @clear="emit('clearFilters')"
        />
      </div>

      <!-- Mobile Filters -->
      <USlideover v-model:open="showFilters" side="left">
        <template #content>
          <div class="p-4">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-lg font-semibold text-white">Filters</h2>
              <UButton variant="ghost" color="neutral" size="sm" icon="i-heroicons-x-mark" @click="showFilters = false" />
            </div>
            <EmployeesEmployeeFilters
              :filters="filters"
              :departments="departments"
              :managers="managers"
              :is-loading="isLoading"
              @update:filters="emit('update:filters', $event)"
              @apply="emit('applyFilters'); showFilters = false"
              @clear="emit('clearFilters')"
            />
          </div>
        </template>
      </USlideover>

      <!-- Employee List -->
      <div class="flex-1 min-w-0">
        <!-- Results count -->
        <div class="flex items-center justify-between mb-4">
          <p class="text-sm text-gray-400">
            <span class="text-white font-medium">{{ pagination.total_items }}</span> employees found
          </p>
          <p class="text-sm text-gray-400">
            Showing {{ paginationDisplay }}
          </p>
        </div>

        <!-- Loading State -->
        <div v-if="isLoading" class="space-y-4">
          <template v-if="viewMode === 'grid'">
            <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              <div v-for="i in 6" :key="i" class="bg-gray-900 border border-gray-800 rounded-lg p-5 animate-pulse">
                <div class="flex flex-col items-center">
                  <div class="w-16 h-16 bg-gray-800 rounded-full mb-3" />
                  <div class="h-4 w-24 bg-gray-800 rounded mb-2" />
                  <div class="h-3 w-32 bg-gray-800 rounded" />
                </div>
              </div>
            </div>
          </template>
          <template v-else>
            <div v-for="i in 6" :key="i" class="bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 animate-pulse flex items-center gap-4">
              <div class="w-10 h-10 bg-gray-800 rounded-full" />
              <div class="flex-1">
                <div class="h-4 w-32 bg-gray-800 rounded mb-2" />
                <div class="h-3 w-24 bg-gray-800 rounded" />
              </div>
            </div>
          </template>
        </div>

        <!-- Empty State -->
        <div v-else-if="employees.length === 0" class="bg-gray-900 border border-gray-800 rounded-lg p-12 text-center">
          <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-800 flex items-center justify-center">
            <UIcon name="i-heroicons-users" class="w-8 h-8 text-gray-600" />
          </div>
          <h3 class="text-lg font-medium text-white mb-2">No employees found</h3>
          <p class="text-gray-400 mb-4">
            {{ activeFilterCount > 0 ? 'Try adjusting your filters or search query.' : 'No employees have been added yet.' }}
          </p>
          <UButton
            v-if="activeFilterCount > 0"
            variant="outline"
            color="neutral"
            @click="emit('clearFilters')"
          >
            Clear Filters
          </UButton>
        </div>

        <!-- Grid View -->
        <div v-else-if="viewMode === 'grid'" class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          <EmployeesEmployeeCard
            v-for="employee in employees"
            :key="employee.id"
            :employee="employee"
            :search-query="searchQuery"
            @click="handleEmployeeClick"
          />
        </div>

        <!-- List View -->
        <div v-else class="space-y-2">
          <EmployeesEmployeeRow
            v-for="employee in employees"
            :key="employee.id"
            :employee="employee"
            :search-query="searchQuery"
            @click="handleEmployeeClick"
          />
        </div>

        <!-- Pagination -->
        <div v-if="employees.length > 0" class="mt-6 flex items-center justify-between">
          <p class="text-sm text-gray-400">
            Page {{ pagination.page }} of {{ pagination.total_pages }}
          </p>
          <div class="flex items-center gap-2">
            <UButton
              variant="outline"
              color="neutral"
              size="sm"
              :disabled="pagination.page <= 1"
              @click="emit('pageChange', pagination.page - 1)"
            >
              <UIcon name="i-heroicons-chevron-left" class="w-4 h-4" />
              Previous
            </UButton>
            <UButton
              variant="outline"
              color="neutral"
              size="sm"
              :disabled="pagination.page >= pagination.total_pages"
              @click="emit('pageChange', pagination.page + 1)"
            >
              Next
              <UIcon name="i-heroicons-chevron-right" class="w-4 h-4" />
            </UButton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
