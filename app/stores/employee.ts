// Employee Store - Pinia store for employee state management
import { defineStore } from 'pinia'
import { employeeService } from '~/services/employee'
import type {
  Employee,
  EmployeeListItem as _EmployeeListItem,
  EmployeeFilters,
  EmployeeListParams,
  EmployeeCreateRequest,
  EmployeeUpdateRequest,
  EmployeeState,
  EmployeeGoalSummary,
  EmployeeReviewSummary,
  EmployeeTeamMember
} from '~/types/employee'

const DEFAULT_PER_PAGE = 25

export const useEmployeeStore = defineStore('employee', {
  state: (): EmployeeState => ({
    employees: [],
    currentEmployee: null,
    filters: {},
    pagination: {
      page: 1,
      per_page: DEFAULT_PER_PAGE,
      total_items: 0,
      total_pages: 0
    },
    sortBy: 'last_name',
    sortOrder: 'asc',
    viewMode: 'grid',
    isLoading: false,
    error: null
  }),

  getters: {
    totalEmployees: (state) => state.pagination.total_items,
    
    hasNextPage: (state) => state.pagination.page < state.pagination.total_pages,
    
    hasPreviousPage: (state) => state.pagination.page > 1,
    
    activeFiltersCount: (state) => {
      return Object.values(state.filters).filter(v => v !== undefined && v !== '').length
    },

    currentEmployeeFullName: (state): string => {
      if (!state.currentEmployee) return ''
      return `${state.currentEmployee.first_name} ${state.currentEmployee.last_name}`
    }
  },

  actions: {
    async fetchEmployees(params?: Partial<EmployeeListParams>): Promise<void> {
      this.isLoading = true
      this.error = null

      try {
        const listParams: EmployeeListParams = {
          page: params?.page ?? this.pagination.page,
          per_page: params?.per_page ?? this.pagination.per_page,
          sort_by: params?.sort_by ?? this.sortBy,
          sort_order: params?.sort_order ?? this.sortOrder,
          ...this.filters,
          ...params
        }

        const response = await employeeService.list(listParams)
        
        this.employees = response.data
        this.pagination = response.meta.pagination
      }
      catch (error) {
        const err = error as { error?: { message?: string } }
        this.error = err?.error?.message || 'Failed to fetch employees'
        throw error
      }
      finally {
        this.isLoading = false
      }
    },

    async fetchEmployee(id: string): Promise<Employee> {
      this.isLoading = true
      this.error = null

      try {
        const response = await employeeService.get(id)
        this.currentEmployee = response.data
        return response.data
      }
      catch (error) {
        const err = error as { error?: { message?: string } }
        this.error = err?.error?.message || 'Failed to fetch employee'
        throw error
      }
      finally {
        this.isLoading = false
      }
    },

    async createEmployee(data: EmployeeCreateRequest): Promise<Employee> {
      this.isLoading = true
      this.error = null

      try {
        const response = await employeeService.create(data)
        // Refresh list after creation
        await this.fetchEmployees()
        return response.data
      }
      catch (error) {
        const err = error as { error?: { message?: string } }
        this.error = err?.error?.message || 'Failed to create employee'
        throw error
      }
      finally {
        this.isLoading = false
      }
    },

    async updateEmployee(id: string, data: EmployeeUpdateRequest): Promise<Employee> {
      this.isLoading = true
      this.error = null

      try {
        const response = await employeeService.update(id, data)
        
        // Update current employee if it's the one being updated
        if (this.currentEmployee?.id === id) {
          this.currentEmployee = response.data
        }
        
        // Update in list if present
        const index = this.employees.findIndex(e => e.id === id)
        if (index !== -1) {
          this.employees[index] = {
            ...this.employees[index],
            ...response.data
          }
        }
        
        return response.data
      }
      catch (error) {
        const err = error as { error?: { message?: string } }
        this.error = err?.error?.message || 'Failed to update employee'
        throw error
      }
      finally {
        this.isLoading = false
      }
    },

    async deleteEmployee(id: string): Promise<void> {
      this.isLoading = true
      this.error = null

      try {
        await employeeService.delete(id)
        
        // Remove from list
        this.employees = this.employees.filter(e => e.id !== id)
        
        // Clear current if deleted
        if (this.currentEmployee?.id === id) {
          this.currentEmployee = null
        }
        
        // Update total count
        this.pagination.total_items--
      }
      catch (error) {
        const err = error as { error?: { message?: string } }
        this.error = err?.error?.message || 'Failed to delete employee'
        throw error
      }
      finally {
        this.isLoading = false
      }
    },

    async fetchEmployeeGoals(
      id: string, 
      params?: { status?: string; type?: string; page?: number; per_page?: number }
    ): Promise<EmployeeGoalSummary[]> {
      try {
        const response = await employeeService.getGoals(id, params)
        return response.data
      }
      catch (error) {
        const err = error as { error?: { message?: string } }
        this.error = err?.error?.message || 'Failed to fetch employee goals'
        throw error
      }
    },

    async fetchEmployeeReviews(
      id: string,
      params?: { cycle_id?: string; type?: string; status?: string }
    ): Promise<EmployeeReviewSummary[]> {
      try {
        const response = await employeeService.getReviews(id, params)
        return response.data
      }
      catch (error) {
        const err = error as { error?: { message?: string } }
        this.error = err?.error?.message || 'Failed to fetch employee reviews'
        throw error
      }
    },

    async fetchEmployeeTeam(id: string): Promise<EmployeeTeamMember[]> {
      try {
        const response = await employeeService.getTeam(id)
        return response.data
      }
      catch (error) {
        const err = error as { error?: { message?: string } }
        this.error = err?.error?.message || 'Failed to fetch employee team'
        throw error
      }
    },

    // Filter actions
    setFilters(filters: EmployeeFilters): void {
      this.filters = { ...filters }
      this.pagination.page = 1 // Reset to first page when filters change
    },

    updateFilter<K extends keyof EmployeeFilters>(key: K, value: EmployeeFilters[K]): void {
      this.filters[key] = value
      this.pagination.page = 1
    },

    clearFilters(): void {
      this.filters = {}
      this.pagination.page = 1
    },

    // Sorting actions
    setSort(sortBy: EmployeeListParams['sort_by'], sortOrder?: EmployeeListParams['sort_order']): void {
      if (this.sortBy === sortBy && !sortOrder) {
        // Toggle order if same field
        this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc'
      } else {
        this.sortBy = sortBy
        this.sortOrder = sortOrder ?? 'asc'
      }
    },

    // Pagination actions
    setPage(page: number): void {
      this.pagination.page = page
    },

    nextPage(): void {
      if (this.hasNextPage) {
        this.pagination.page++
      }
    },

    previousPage(): void {
      if (this.hasPreviousPage) {
        this.pagination.page--
      }
    },

    // View mode
    setViewMode(mode: 'grid' | 'list'): void {
      this.viewMode = mode
    },

    toggleViewMode(): void {
      this.viewMode = this.viewMode === 'grid' ? 'list' : 'grid'
    },

    // Clear current employee
    clearCurrentEmployee(): void {
      this.currentEmployee = null
    },

    // Clear error
    clearError(): void {
      this.error = null
    }
  }
})
