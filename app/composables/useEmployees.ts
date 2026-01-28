// useEmployees composable - Vue composable for employee data
import { useEmployeeStore } from '~/stores/employee'
import { refDebounced } from '@vueuse/core'
import type {
  EmployeeFilters,
  EmployeeListParams,
  EmployeeCreateRequest,
  EmployeeUpdateRequest
} from '~/types/employee'

/**
 * Composable for employee management
 * Provides reactive access to employee data and actions
 */
export function useEmployees() {
  const store = useEmployeeStore()

  // Reactive state
  const employees = computed(() => store.employees)
  const currentEmployee = computed(() => store.currentEmployee)
  const isLoading = computed(() => store.isLoading)
  const error = computed(() => store.error)
  const filters = computed(() => store.filters)
  const pagination = computed(() => store.pagination)
  const sortBy = computed(() => store.sortBy)
  const sortOrder = computed(() => store.sortOrder)
  const viewMode = computed(() => store.viewMode)
  const totalEmployees = computed(() => store.totalEmployees)
  const hasNextPage = computed(() => store.hasNextPage)
  const hasPreviousPage = computed(() => store.hasPreviousPage)
  const activeFiltersCount = computed(() => store.activeFiltersCount)
  const currentEmployeeFullName = computed(() => store.currentEmployeeFullName)

  // Debounced search
  const searchQuery = ref('')
  const debouncedSearch = refDebounced(searchQuery, 300)

  // Watch debounced search and update filters
  watch(debouncedSearch, (value) => {
    store.updateFilter('search', value || undefined)
    store.fetchEmployees()
  })

  // Actions
  async function fetchEmployees(params?: Partial<EmployeeListParams>) {
    return store.fetchEmployees(params)
  }

  async function fetchEmployee(id: string) {
    return store.fetchEmployee(id)
  }

  async function createEmployee(data: EmployeeCreateRequest) {
    return store.createEmployee(data)
  }

  async function updateEmployee(id: string, data: EmployeeUpdateRequest) {
    return store.updateEmployee(id, data)
  }

  async function deleteEmployee(id: string) {
    return store.deleteEmployee(id)
  }

  async function fetchEmployeeGoals(id: string, params?: { status?: string; type?: string }) {
    return store.fetchEmployeeGoals(id, params)
  }

  async function fetchEmployeeReviews(id: string, params?: { cycle_id?: string; type?: string }) {
    return store.fetchEmployeeReviews(id, params)
  }

  async function fetchEmployeeTeam(id: string) {
    return store.fetchEmployeeTeam(id)
  }

  // Filter actions
  function setFilters(newFilters: EmployeeFilters) {
    store.setFilters(newFilters)
  }

  function updateFilter<K extends keyof EmployeeFilters>(key: K, value: EmployeeFilters[K]) {
    store.updateFilter(key, value)
  }

  function clearFilters() {
    searchQuery.value = ''
    store.clearFilters()
  }

  // Sort actions
  function setSort(field: EmployeeListParams['sort_by'], order?: EmployeeListParams['sort_order']) {
    store.setSort(field, order)
  }

  // Pagination actions
  function setPage(page: number) {
    store.setPage(page)
    store.fetchEmployees()
  }

  function nextPage() {
    store.nextPage()
    store.fetchEmployees()
  }

  function previousPage() {
    store.previousPage()
    store.fetchEmployees()
  }

  // View mode
  function setViewMode(mode: 'grid' | 'list') {
    store.setViewMode(mode)
  }

  function toggleViewMode() {
    store.toggleViewMode()
  }

  // Utility
  function clearCurrentEmployee() {
    store.clearCurrentEmployee()
  }

  function clearError() {
    store.clearError()
  }

  // Apply filters and refetch
  async function applyFiltersAndFetch() {
    store.setPage(1)
    return store.fetchEmployees()
  }

  return {
    // State
    employees,
    currentEmployee,
    isLoading,
    error,
    filters,
    pagination,
    sortBy,
    sortOrder,
    viewMode,
    totalEmployees,
    hasNextPage,
    hasPreviousPage,
    activeFiltersCount,
    currentEmployeeFullName,
    searchQuery,

    // Actions
    fetchEmployees,
    fetchEmployee,
    createEmployee,
    updateEmployee,
    deleteEmployee,
    fetchEmployeeGoals,
    fetchEmployeeReviews,
    fetchEmployeeTeam,
    setFilters,
    updateFilter,
    clearFilters,
    setSort,
    setPage,
    nextPage,
    previousPage,
    setViewMode,
    toggleViewMode,
    clearCurrentEmployee,
    clearError,
    applyFiltersAndFetch
  }
}
