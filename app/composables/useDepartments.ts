// useDepartments composable - Vue composable for department data
import { useDepartmentStore } from '~/stores/department'
import { refDebounced } from '@vueuse/core'
import type {
  DepartmentFilters,
  DepartmentCreateRequest,
  DepartmentUpdateRequest
} from '~/types/department'

/**
 * Composable for department management
 * Provides reactive access to department data and actions
 */
export function useDepartments() {
  const store = useDepartmentStore()

  // Reactive state
  const departments = computed(() => store.departments)
  const currentDepartment = computed(() => store.currentDepartment)
  const hierarchy = computed(() => store.hierarchy)
  const isLoading = computed(() => store.isLoading)
  const error = computed(() => store.error)
  const filters = computed(() => store.filters)
  const totalDepartments = computed(() => store.totalDepartments)
  const activeDepartments = computed(() => store.activeDepartments)
  const departmentOptions = computed(() => store.departmentOptions)
  const flatHierarchy = computed(() => store.flatHierarchy)

  // Debounced search
  const searchQuery = ref('')
  const debouncedSearch = refDebounced(searchQuery, 300)

  // Watch debounced search and update filters
  watch(debouncedSearch, (value) => {
    store.updateFilter('search', value || undefined)
    store.fetchDepartments()
  })

  // Actions
  async function fetchDepartments(customFilters?: DepartmentFilters) {
    return store.fetchDepartments(customFilters)
  }

  async function fetchDepartment(id: string) {
    return store.fetchDepartment(id)
  }

  async function fetchHierarchy() {
    return store.fetchHierarchy()
  }

  async function createDepartment(data: DepartmentCreateRequest) {
    return store.createDepartment(data)
  }

  async function updateDepartment(id: string, data: DepartmentUpdateRequest) {
    return store.updateDepartment(id, data)
  }

  async function deleteDepartment(id: string) {
    return store.deleteDepartment(id)
  }

  async function fetchDepartmentEmployees(
    id: string,
    params?: { include_sub?: boolean; status?: string; page?: number; per_page?: number }
  ) {
    return store.fetchDepartmentEmployees(id, params)
  }

  // Filter actions
  function setFilters(newFilters: DepartmentFilters) {
    store.setFilters(newFilters)
  }

  function updateFilter<K extends keyof DepartmentFilters>(key: K, value: DepartmentFilters[K]) {
    store.updateFilter(key, value)
  }

  function clearFilters() {
    searchQuery.value = ''
    store.clearFilters()
  }

  // Utility
  function clearCurrentDepartment() {
    store.clearCurrentDepartment()
  }

  function clearError() {
    store.clearError()
  }

  // Get department by ID from loaded list
  function getDepartmentById(id: string) {
    return departments.value.find(d => d.id === id)
  }

  // Get department name by ID
  function getDepartmentName(id: string) {
    return getDepartmentById(id)?.name || ''
  }

  return {
    // State
    departments,
    currentDepartment,
    hierarchy,
    isLoading,
    error,
    filters,
    totalDepartments,
    activeDepartments,
    departmentOptions,
    flatHierarchy,
    searchQuery,

    // Actions
    fetchDepartments,
    fetchDepartment,
    fetchHierarchy,
    createDepartment,
    updateDepartment,
    deleteDepartment,
    fetchDepartmentEmployees,
    setFilters,
    updateFilter,
    clearFilters,
    clearCurrentDepartment,
    clearError,
    getDepartmentById,
    getDepartmentName
  }
}
