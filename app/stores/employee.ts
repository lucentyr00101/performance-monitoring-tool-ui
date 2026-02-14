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
      perPage: DEFAULT_PER_PAGE,
      totalItems: 0,
      totalPages: 0
    },
    sortBy: 'last_name',
    sortOrder: 'asc',
    viewMode: 'grid',
    isLoading: false,
    error: null
  }),

  getters: {
    totalEmployees: (state) => state.pagination.totalItems,
    
    hasNextPage: (state) => state.pagination.page < state.pagination.totalPages,
    
    hasPreviousPage: (state) => state.pagination.page > 1,
    
    activeFiltersCount: (state) => {
      return Object.values(state.filters).filter(v => v !== undefined && v !== '').length
    },

    currentEmployeeFullName: (state): string => {
      if (!state.currentEmployee) return ''
      return `${state.currentEmployee.firstName} ${state.currentEmployee.lastName}`
    }
  },

  actions: {
    async fetchEmployees(params?: Partial<EmployeeListParams>): Promise<void> {
      const { failed } = useNotification()
      this.isLoading = true
      this.error = null

      try {
        const listParams: EmployeeListParams = {
          page: params?.page ?? this.pagination.page,
          perPage: params?.perPage ?? this.pagination.perPage,
          sortBy: params?.sortBy ?? this.sortBy,
          sortOrder: params?.sortOrder ?? this.sortOrder,
          ...this.filters,
          ...params
        }

        const response = await employeeService.list(listParams)
        
        this.employees = response.data
        // Transform snake_case pagination to camelCase
        this.pagination = {
          page: response.meta.pagination.page,
          perPage: response.meta.pagination.per_page,
          totalItems: response.meta.pagination.total_items,
          totalPages: response.meta.pagination.total_pages
        }
      }
      catch (error) {
        const err = error as { error?: { message?: string } }
        this.error = err?.error?.message || 'Failed to fetch employees'
        failed('fetch', 'employees', 'network')
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
      const { created, failed } = useNotification()
      this.isLoading = true
      this.error = null

      try {
        const response = await employeeService.create(data)
        created('Employee')
        // Refresh list after creation
        await this.fetchEmployees()
        return response.data
      }
      catch (error) {
        const err = error as { error?: { message?: string } }
        this.error = err?.error?.message || 'Failed to create employee'
        failed('create', 'employee', 'server')
        throw error
      }
      finally {
        this.isLoading = false
      }
    },

    async updateEmployee(id: string, data: EmployeeUpdateRequest): Promise<Employee> {
      const { updated, failed } = useNotification()
      this.isLoading = true
      this.error = null

      try {
        const response = await employeeService.update(id, data)
        updated('Employee')
        
        // Update current employee if it's the one being updated
        if (this.currentEmployee?._id === id) {
          this.currentEmployee = response.data
        }
        
        // Update in list if present
        const index = this.employees.findIndex(e => e._id === id)
        if (index !== -1) {
          // Convert Employee to EmployeeListItem format
          const listItem: _EmployeeListItem = {
            _id: response.data._id,
            id: response.data.id,
            employeeCode: response.data.employeeCode,
            firstName: response.data.firstName,
            lastName: response.data.lastName,
            fullName: response.data.fullName,
            email: response.data.email,
            jobTitle: response.data.jobTitle,
            departmentId: typeof response.data.departmentId === 'object'
              ? response.data.departmentId
              : undefined,
            department: response.data.department,
            departmentName: response.data.departmentName,
            manager: response.data.manager,
            managerId: response.data.managerId,
            hireDate: response.data.hireDate,
            status: response.data.status,
            employmentStatus: response.data.employmentStatus,
            avatarUrl: response.data.avatarUrl,
            directReportsCount: response.data.directReportsCount
          }
          this.employees[index] = listItem
        }
        
        return response.data
      }
      catch (error) {
        const err = error as { error?: { message?: string } }
        this.error = err?.error?.message || 'Failed to update employee'
        failed('update', 'employee', 'server')
        throw error
      }
      finally {
        this.isLoading = false
      }
    },

    async deleteEmployee(id: string): Promise<void> {
      const { deleted, failed } = useNotification()
      this.isLoading = true
      this.error = null

      try {
        await employeeService.delete(id)
        deleted('Employee')
        
        // Remove from list
        this.employees = this.employees.filter(e => e._id !== id)

        // Clear current if deleted
        if (this.currentEmployee?._id === id) {
          this.currentEmployee = null
        }
        
        // Update total count
        this.pagination.totalItems--
      }
      catch (error) {
        const err = error as { error?: { message?: string } }
        this.error = err?.error?.message || 'Failed to delete employee'
        failed('delete', 'employee', 'server')
        throw error
      }
      finally {
        this.isLoading = false
      }
    },

    async fetchEmployeeGoals(
      id: string, 
      params?: { status?: string; type?: string; page?: number; perPage?: number }
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
    setSort(sortBy: EmployeeListParams['sortBy'], sortOrder?: EmployeeListParams['sortOrder']): void {
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
