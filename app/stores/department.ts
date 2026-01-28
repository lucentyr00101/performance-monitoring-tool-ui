// Department Store - Pinia store for department state management
import { defineStore } from 'pinia'
import { departmentService } from '~/services/department'
import type {
  Department,
  DepartmentListItem as _DepartmentListItem,
  DepartmentFilters,
  DepartmentCreateRequest,
  DepartmentUpdateRequest,
  DepartmentState,
  DepartmentHierarchyNode
} from '~/types/department'
import type { EmployeeListItem } from '~/types/employee'

export const useDepartmentStore = defineStore('department', {
  state: (): DepartmentState => ({
    departments: [],
    currentDepartment: null,
    hierarchy: [],
    filters: {},
    isLoading: false,
    isLoadingHierarchy: false,
    error: null
  }),

  getters: {
    totalDepartments: (state) => state.departments.length,

    activeDepartments: (state) => state.departments.filter(d => d.status === 'active'),

    departmentOptions: (state) => state.departments.map(d => ({
      label: d.name,
      value: d.id
    })),

    // Get flat list of all departments from hierarchy
    flatHierarchy: (state): DepartmentHierarchyNode[] => {
      const flatten = (nodes: DepartmentHierarchyNode[]): DepartmentHierarchyNode[] => {
        return nodes.reduce((acc, node) => {
          acc.push(node)
          if (node.children?.length) {
            acc.push(...flatten(node.children))
          }
          return acc
        }, [] as DepartmentHierarchyNode[])
      }
      return flatten(state.hierarchy)
    }
  },

  actions: {
    async fetchDepartments(filters?: DepartmentFilters): Promise<void> {
      this.isLoading = true
      this.error = null

      try {
        const response = await departmentService.list(filters || this.filters)
        this.departments = response.data
      }
      catch (error) {
        const err = error as { error?: { message?: string } }
        this.error = err?.error?.message || 'Failed to fetch departments'
        throw error
      }
      finally {
        this.isLoading = false
      }
    },

    async fetchDepartment(id: string): Promise<Department> {
      this.isLoading = true
      this.error = null

      try {
        const response = await departmentService.get(id)
        this.currentDepartment = response.data
        return response.data
      }
      catch (error) {
        const err = error as { error?: { message?: string } }
        this.error = err?.error?.message || 'Failed to fetch department'
        throw error
      }
      finally {
        this.isLoading = false
      }
    },

    async fetchHierarchy(): Promise<DepartmentHierarchyNode[]> {
      this.isLoadingHierarchy = true
      this.error = null

      try {
        const response = await departmentService.getHierarchy()
        this.hierarchy = response.data
        return response.data
      }
      catch (error) {
        const err = error as { error?: { message?: string } }
        this.error = err?.error?.message || 'Failed to fetch department hierarchy'
        throw error
      }
      finally {
        this.isLoadingHierarchy = false
      }
    },

    async createDepartment(data: DepartmentCreateRequest): Promise<Department> {
      this.isLoading = true
      this.error = null

      try {
        const response = await departmentService.create(data)
        // Refresh list after creation
        await this.fetchDepartments()
        return response.data
      }
      catch (error) {
        const err = error as { error?: { message?: string } }
        this.error = err?.error?.message || 'Failed to create department'
        throw error
      }
      finally {
        this.isLoading = false
      }
    },

    async updateDepartment(id: string, data: DepartmentUpdateRequest): Promise<Department> {
      this.isLoading = true
      this.error = null

      try {
        const response = await departmentService.update(id, data)
        
        // Update current department if it's the one being updated
        if (this.currentDepartment?.id === id) {
          this.currentDepartment = response.data
        }
        
        // Update in list if present
        const index = this.departments.findIndex(d => d.id === id)
        if (index !== -1) {
          this.departments[index] = {
            ...this.departments[index],
            ...response.data
          }
        }
        
        return response.data
      }
      catch (error) {
        const err = error as { error?: { message?: string } }
        this.error = err?.error?.message || 'Failed to update department'
        throw error
      }
      finally {
        this.isLoading = false
      }
    },

    async deleteDepartment(id: string): Promise<void> {
      this.isLoading = true
      this.error = null

      try {
        await departmentService.delete(id)
        
        // Remove from list
        this.departments = this.departments.filter(d => d.id !== id)
        
        // Clear current if deleted
        if (this.currentDepartment?.id === id) {
          this.currentDepartment = null
        }
      }
      catch (error) {
        const err = error as { error?: { message?: string } }
        this.error = err?.error?.message || 'Failed to delete department'
        throw error
      }
      finally {
        this.isLoading = false
      }
    },

    async fetchDepartmentEmployees(
      id: string,
      params?: { include_sub?: boolean; status?: string; page?: number; per_page?: number }
    ): Promise<EmployeeListItem[]> {
      try {
        const response = await departmentService.getEmployees(id, params)
        return response.data
      }
      catch (error) {
        const err = error as { error?: { message?: string } }
        this.error = err?.error?.message || 'Failed to fetch department employees'
        throw error
      }
    },

    // Filter actions
    setFilters(filters: DepartmentFilters): void {
      this.filters = { ...filters }
    },

    updateFilter<K extends keyof DepartmentFilters>(key: K, value: DepartmentFilters[K]): void {
      this.filters[key] = value
    },

    clearFilters(): void {
      this.filters = {}
    },

    // Clear current department
    clearCurrentDepartment(): void {
      this.currentDepartment = null
    },

    // Clear error
    clearError(): void {
      this.error = null
    }
  }
})
