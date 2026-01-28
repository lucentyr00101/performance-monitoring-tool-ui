// Goals Store - Pinia store for goals state management
import { defineStore } from 'pinia'
import { goalsService } from '~/services/goals'
import type {
  Goal,
  GoalListItem,
  GoalFilters,
  GoalListParams,
  GoalCreateRequest,
  GoalUpdateRequest,
  GoalProgressRequest,
  GoalTemplate,
  KeyResult,
  KeyResultCreateRequest,
  KeyResultUpdateRequest,
  GoalState,
  GoalType,
  GoalStatus,
  ProgressHistory,
  ProgressIndicator
} from '~/types/goal'

const DEFAULT_PER_PAGE = 20

export const useGoalsStore = defineStore('goals', {
  state: (): GoalState => ({
    goals: [],
    currentGoal: null,
    templates: [],
    filters: {},
    pagination: {
      page: 1,
      per_page: DEFAULT_PER_PAGE,
      total_items: 0,
      total_pages: 0
    },
    sortBy: 'due_date',
    sortOrder: 'asc',
    viewMode: 'grid',
    isLoading: false,
    error: null
  }),

  getters: {
    totalGoals: (state) => state.pagination.total_items,
    
    hasNextPage: (state) => state.pagination.page < state.pagination.total_pages,
    
    hasPreviousPage: (state) => state.pagination.page > 1,
    
    activeFiltersCount: (state) => {
      return Object.values(state.filters).filter(v => v !== undefined && v !== '').length
    },

    // Goals filtered by status
    activeGoals: (state): GoalListItem[] => 
      state.goals.filter(g => g.status === 'active'),
    
    draftGoals: (state): GoalListItem[] => 
      state.goals.filter(g => g.status === 'draft'),
    
    pendingGoals: (state): GoalListItem[] => 
      state.goals.filter(g => g.status === 'pending'),
    
    completedGoals: (state): GoalListItem[] => 
      state.goals.filter(g => g.status === 'completed'),

    // Goals by type
    goalsByType: (state) => (type: GoalType): GoalListItem[] => 
      state.goals.filter(g => g.type === type),

    // Current goal key results summary
    currentGoalKeyResultsCompleted: (state): number => {
      if (!state.currentGoal?.key_results) return 0
      return state.currentGoal.key_results.filter(kr => kr.status === 'completed').length
    },

    currentGoalKeyResultsTotal: (state): number => {
      if (!state.currentGoal?.key_results) return 0
      return state.currentGoal.key_results.length
    },

    // Progress indicator calculation
    currentGoalProgressIndicator(state): ProgressIndicator {
      if (!state.currentGoal) return 'behind'
      
      const now = new Date()
      const start = state.currentGoal.start_date 
        ? new Date(state.currentGoal.start_date) 
        : new Date(state.currentGoal.due_date)
      const end = new Date(state.currentGoal.due_date)
      
      let expectedProgress = 0
      if (now < start) {
        expectedProgress = 0
      } else if (now > end) {
        expectedProgress = 100
      } else {
        const totalDays = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
        const elapsedDays = (now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
        expectedProgress = Math.round((elapsedDays / totalDays) * 100)
      }
      
      const actualProgress = state.currentGoal.progress
      const ratio = expectedProgress === 0 ? 1 : actualProgress / expectedProgress
      if (ratio >= 0.7) return 'on_track'
      if (ratio >= 0.4) return 'at_risk'
      return 'behind'
    }
  },

  actions: {
    // ============================================
    // GOAL CRUD OPERATIONS
    // ============================================

    async fetchGoals(params?: Partial<GoalListParams>): Promise<void> {
      this.isLoading = true
      this.error = null

      try {
        const listParams: GoalListParams = {
          page: params?.page ?? this.pagination.page,
          per_page: params?.per_page ?? this.pagination.per_page,
          sort_by: params?.sort_by ?? this.sortBy,
          sort_order: params?.sort_order ?? this.sortOrder,
          ...this.filters,
          ...params
        }

        const response = await goalsService.list(listParams)
        
        this.goals = response.data
        this.pagination = response.meta.pagination
      }
      catch (error) {
        const err = error as { error?: { message?: string } }
        this.error = err?.error?.message || 'Failed to fetch goals'
        throw error
      }
      finally {
        this.isLoading = false
      }
    },

    async fetchGoal(id: string): Promise<Goal> {
      this.isLoading = true
      this.error = null

      try {
        const response = await goalsService.get(id)
        this.currentGoal = response.data
        return response.data
      }
      catch (error) {
        const err = error as { error?: { message?: string } }
        this.error = err?.error?.message || 'Failed to fetch goal'
        throw error
      }
      finally {
        this.isLoading = false
      }
    },

    async createGoal(data: GoalCreateRequest): Promise<Goal> {
      this.isLoading = true
      this.error = null

      try {
        const response = await goalsService.create(data)
        // Refresh list after creation
        await this.fetchGoals()
        return response.data
      }
      catch (error) {
        const err = error as { error?: { message?: string } }
        this.error = err?.error?.message || 'Failed to create goal'
        throw error
      }
      finally {
        this.isLoading = false
      }
    },

    async updateGoal(id: string, data: GoalUpdateRequest): Promise<Goal> {
      this.isLoading = true
      this.error = null

      try {
        const response = await goalsService.update(id, data)
        
        // Update current goal if it's the one being updated
        if (this.currentGoal?.id === id) {
          this.currentGoal = response.data
        }
        
        // Update in list if present
        const index = this.goals.findIndex(g => g.id === id)
        if (index !== -1) {
          const existing = this.goals[index]!
          this.goals[index] = {
            ...existing,
            title: response.data.title,
            description: response.data.description,
            status: response.data.status,
            progress: response.data.progress,
            priority: response.data.priority
          }
        }
        
        return response.data
      }
      catch (error) {
        const err = error as { error?: { message?: string } }
        this.error = err?.error?.message || 'Failed to update goal'
        throw error
      }
      finally {
        this.isLoading = false
      }
    },

    async deleteGoal(id: string): Promise<void> {
      this.isLoading = true
      this.error = null

      try {
        await goalsService.delete(id)
        
        // Remove from list or update status to cancelled
        const index = this.goals.findIndex(g => g.id === id)
        if (index !== -1) {
          const goal = this.goals[index]!
          if (goal.status === 'draft') {
            // Draft goals are permanently deleted
            this.goals.splice(index, 1)
            this.pagination.total_items--
          } else {
            // Other goals are cancelled
            this.goals[index] = { ...goal, status: 'cancelled' as GoalStatus }
          }
        }
        
        // Clear current if deleted
        if (this.currentGoal?.id === id) {
          this.currentGoal = null
        }
      }
      catch (error) {
        const err = error as { error?: { message?: string } }
        this.error = err?.error?.message || 'Failed to delete goal'
        throw error
      }
      finally {
        this.isLoading = false
      }
    },

    // ============================================
    // GOAL WORKFLOW ACTIONS
    // ============================================

    async updateProgress(id: string, data: GoalProgressRequest): Promise<void> {
      this.error = null

      try {
        const response = await goalsService.updateProgress(id, data)
        
        // Update current goal progress
        if (this.currentGoal?.id === id) {
          this.currentGoal.progress = response.data.progress
          if (response.data.status) {
            this.currentGoal.status = response.data.status as GoalStatus
          }
        }
        
        // Update in list
        const index = this.goals.findIndex(g => g.id === id)
        if (index !== -1) {
          const existing = this.goals[index]!
          this.goals[index] = { 
            ...existing, 
            progress: response.data.progress,
            status: response.data.status as GoalStatus
          }
        }
      }
      catch (error) {
        const err = error as { error?: { message?: string } }
        this.error = err?.error?.message || 'Failed to update progress'
        throw error
      }
    },

    async submitForApproval(id: string): Promise<Goal> {
      this.isLoading = true
      this.error = null

      try {
        const response = await goalsService.submit(id)
        
        // Update current goal
        if (this.currentGoal?.id === id) {
          this.currentGoal = response.data
        }
        
        // Update in list
        const index = this.goals.findIndex(g => g.id === id)
        if (index !== -1) {
          const existing = this.goals[index]!
          this.goals[index] = { ...existing, status: 'pending' as GoalStatus }
        }
        
        return response.data
      }
      catch (error) {
        const err = error as { error?: { message?: string } }
        this.error = err?.error?.message || 'Failed to submit goal'
        throw error
      }
      finally {
        this.isLoading = false
      }
    },

    async approveGoal(id: string, comment?: string): Promise<void> {
      this.isLoading = true
      this.error = null

      try {
        await goalsService.approve(id, 'approve', comment)
        
        // Update in list
        const index = this.goals.findIndex(g => g.id === id)
        if (index !== -1) {
          const existing = this.goals[index]!
          this.goals[index] = { ...existing, status: 'active' as GoalStatus }
        }
        
        // Refresh current goal if applicable
        if (this.currentGoal?.id === id) {
          await this.fetchGoal(id)
        }
      }
      catch (error) {
        const err = error as { error?: { message?: string } }
        this.error = err?.error?.message || 'Failed to approve goal'
        throw error
      }
      finally {
        this.isLoading = false
      }
    },

    async rejectGoal(id: string, comment: string): Promise<void> {
      this.isLoading = true
      this.error = null

      try {
        await goalsService.approve(id, 'reject', comment)
        
        // Update in list
        const index = this.goals.findIndex(g => g.id === id)
        if (index !== -1) {
          const existing = this.goals[index]!
          this.goals[index] = { ...existing, status: 'draft' as GoalStatus }
        }
        
        // Refresh current goal if applicable
        if (this.currentGoal?.id === id) {
          await this.fetchGoal(id)
        }
      }
      catch (error) {
        const err = error as { error?: { message?: string } }
        this.error = err?.error?.message || 'Failed to reject goal'
        throw error
      }
      finally {
        this.isLoading = false
      }
    },

    async fetchProgressHistory(id: string, page = 1): Promise<ProgressHistory[]> {
      try {
        const response = await goalsService.getHistory(id, { page, per_page: 20 })
        return response.data
      }
      catch (error) {
        const err = error as { error?: { message?: string } }
        this.error = err?.error?.message || 'Failed to fetch progress history'
        throw error
      }
    },

    // ============================================
    // KEY RESULTS OPERATIONS
    // ============================================

    async addKeyResult(goalId: string, data: KeyResultCreateRequest): Promise<KeyResult> {
      this.error = null

      try {
        const response = await goalsService.addKeyResult(goalId, data)
        
        // Update current goal's key results
        if (this.currentGoal?.id === goalId) {
          this.currentGoal.key_results.push(response.data)
        }
        
        return response.data
      }
      catch (error) {
        const err = error as { error?: { message?: string } }
        this.error = err?.error?.message || 'Failed to add key result'
        throw error
      }
    },

    async updateKeyResult(goalId: string, krId: string, data: KeyResultUpdateRequest): Promise<KeyResult> {
      this.error = null

      try {
        const response = await goalsService.updateKeyResult(goalId, krId, data)
        
        // Update current goal's key results
        if (this.currentGoal?.id === goalId) {
          const index = this.currentGoal.key_results.findIndex(kr => kr.id === krId)
          if (index !== -1) {
            this.currentGoal.key_results[index] = response.data
          }
          
          // Recalculate goal progress from key results
          this.recalculateGoalProgress()
        }
        
        return response.data
      }
      catch (error) {
        const err = error as { error?: { message?: string } }
        this.error = err?.error?.message || 'Failed to update key result'
        throw error
      }
    },

    async deleteKeyResult(goalId: string, krId: string): Promise<void> {
      this.error = null

      try {
        await goalsService.deleteKeyResult(goalId, krId)
        
        // Remove from current goal's key results
        if (this.currentGoal?.id === goalId) {
          this.currentGoal.key_results = this.currentGoal.key_results.filter(kr => kr.id !== krId)
          
          // Recalculate goal progress
          this.recalculateGoalProgress()
        }
      }
      catch (error) {
        const err = error as { error?: { message?: string } }
        this.error = err?.error?.message || 'Failed to delete key result'
        throw error
      }
    },

    // ============================================
    // TEMPLATES
    // ============================================

    async fetchTemplates(type?: GoalType): Promise<void> {
      try {
        const response = await goalsService.getTemplates({ type, active_only: true })
        this.templates = response.data
      }
      catch (error) {
        const err = error as { error?: { message?: string } }
        this.error = err?.error?.message || 'Failed to fetch templates'
        throw error
      }
    },

    async getTemplate(id: string): Promise<GoalTemplate> {
      try {
        const response = await goalsService.getTemplate(id)
        return response.data
      }
      catch (error) {
        const err = error as { error?: { message?: string } }
        this.error = err?.error?.message || 'Failed to fetch template'
        throw error
      }
    },

    // ============================================
    // FILTER & SORTING ACTIONS
    // ============================================

    setFilters(filters: GoalFilters): void {
      this.filters = { ...filters }
      this.pagination.page = 1
    },

    updateFilter<K extends keyof GoalFilters>(key: K, value: GoalFilters[K]): void {
      this.filters[key] = value
      this.pagination.page = 1
    },

    clearFilters(): void {
      this.filters = {}
      this.pagination.page = 1
    },

    setSort(sortBy: GoalListParams['sort_by'], sortOrder?: GoalListParams['sort_order']): void {
      if (this.sortBy === sortBy && !sortOrder) {
        this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc'
      } else {
        this.sortBy = sortBy
        this.sortOrder = sortOrder ?? 'asc'
      }
    },

    // ============================================
    // PAGINATION ACTIONS
    // ============================================

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

    // ============================================
    // VIEW MODE
    // ============================================

    setViewMode(mode: 'grid' | 'list' | 'kanban'): void {
      this.viewMode = mode
    },

    // ============================================
    // UTILITY ACTIONS
    // ============================================

    clearCurrentGoal(): void {
      this.currentGoal = null
    },

    clearError(): void {
      this.error = null
    },

    recalculateGoalProgress(): void {
      if (!this.currentGoal?.key_results || this.currentGoal.key_results.length === 0) return
      
      const totalProgress = this.currentGoal.key_results.reduce((sum, kr) => {
        const progress = kr.target_value > 0 
          ? Math.min((kr.current_value / kr.target_value) * 100, 100)
          : 0
        return sum + progress
      }, 0)
      
      this.currentGoal.progress = Math.round(totalProgress / this.currentGoal.key_results.length)
    },

    calculateExpectedProgress(startDate: string | undefined, dueDate: string): number {
      const now = new Date()
      const start = startDate ? new Date(startDate) : new Date(dueDate)
      const end = new Date(dueDate)
      
      if (now < start) return 0
      if (now > end) return 100
      
      const totalDays = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
      const elapsedDays = (now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
      
      return Math.round((elapsedDays / totalDays) * 100)
    }
  }
})
