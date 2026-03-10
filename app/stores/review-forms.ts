// Review Forms Store - Pinia store for review forms state management
import { defineStore } from 'pinia'
import { reviewFormsService } from '~/services/review-forms'
import type {
  ReviewForm,
  ReviewFormListItem,
  ReviewFormFilters,
  ReviewFormListParams,
  ReviewFormStatus,
  ReviewFormCreateRequest,
  ReviewFormUpdateRequest,
  ReviewFormCloneRequest,
  ReviewFormAssignRequest,
  FormVersionHistoryItem,
  ReviewFormState
} from '~/types/review-form'

const DEFAULT_PER_PAGE = 20

export const useReviewFormsStore = defineStore('review-forms', {
  state: (): ReviewFormState => ({
    forms: [],
    currentForm: null,
    defaultForm: null,
    versionHistory: [],
    filters: {},
    pagination: {
      page: 1,
      perPage: DEFAULT_PER_PAGE,
      totalItems: 0,
      totalPages: 0
    },
    isLoading: false,
    error: null
  }),

  getters: {
    totalForms: (state) => state.pagination.totalItems,

    hasNextPage: (state) => state.pagination.page < state.pagination.totalPages,

    hasPreviousPage: (state) => state.pagination.page > 1,

    publishedForms: (state): ReviewFormListItem[] =>
      state.forms.filter(f => f.status === 'published'),

    draftForms: (state): ReviewFormListItem[] =>
      state.forms.filter(f => f.status === 'draft'),

    archivedForms: (state): ReviewFormListItem[] =>
      state.forms.filter(f => f.status === 'archived'),

    formsByStatus: (state) => (status: ReviewFormStatus): ReviewFormListItem[] =>
      state.forms.filter(f => f.status === status),

    // Get forms that can be assigned (published only)
    assignableForms: (state): ReviewFormListItem[] =>
      state.forms.filter(f => f.status === 'published'),

    // Check if current form can be edited
    canEditCurrentForm: (state): boolean => {
      if (!state.currentForm) return false
      return state.currentForm.status === 'draft'
    },

    // Check if current form can be published
    canPublishCurrentForm: (state): boolean => {
      if (!state.currentForm) return false
      return state.currentForm.status === 'draft' &&
        state.currentForm.sections.length > 0 &&
        state.currentForm.sections.some(s => (s.questions?.length ?? 0) > 0)
    },

    // Check if current form can be archived
    canArchiveCurrentForm: (state): boolean => {
      if (!state.currentForm) return false
      return state.currentForm.status === 'published' && !state.currentForm.isDefault
    }
  },

  actions: {
    // ============================================
    // CRUD OPERATIONS
    // ============================================

    async fetchForms(params?: Partial<ReviewFormListParams>): Promise<void> {
      this.isLoading = true
      this.error = null

      try {
        const listParams: ReviewFormListParams = {
          page: params?.page ?? this.pagination.page,
          perPage: params?.perPage ?? this.pagination.perPage,
          ...this.filters,
          ...params
        }

        const response = await reviewFormsService.listForms(listParams)

        this.forms = response.data
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
        this.error = err?.error?.message || 'Failed to fetch review forms'
        throw error
      }
      finally {
        this.isLoading = false
      }
    },

    async fetchForm(id: string): Promise<ReviewForm> {
      this.isLoading = true
      this.error = null

      try {
        const response = await reviewFormsService.getForm(id)
        this.currentForm = response.data
        return response.data
      }
      catch (error) {
        const err = error as { error?: { message?: string } }
        this.error = err?.error?.message || 'Failed to fetch review form'
        throw error
      }
      finally {
        this.isLoading = false
      }
    },

    async fetchDefaultForm(): Promise<ReviewForm> {
      this.isLoading = true
      this.error = null

      try {
        const response = await reviewFormsService.getDefaultForm()
        this.defaultForm = response.data
        return response.data
      }
      catch (error) {
        const err = error as { error?: { message?: string } }
        this.error = err?.error?.message || 'Failed to fetch default form'
        throw error
      }
      finally {
        this.isLoading = false
      }
    },

    async createForm(data: ReviewFormCreateRequest): Promise<string> {
      const { created, failed } = useNotification()
      this.isLoading = true
      this.error = null

      try {
        const response = await reviewFormsService.createForm(data)
        created('Review form')
        // Refresh list after creation
        await this.fetchForms()
        return response.data.id
      }
      catch (error) {
        const err = error as { error?: { message?: string } }
        this.error = err?.error?.message || 'Failed to create review form'
        failed('create', 'review form', 'server')
        throw error
      }
      finally {
        this.isLoading = false
      }
    },

    async updateForm(id: string, data: ReviewFormUpdateRequest): Promise<ReviewForm> {
      const { updated, failed } = useNotification()
      this.isLoading = true
      this.error = null

      try {
        const response = await reviewFormsService.updateForm(id, data)
        updated('Review form')

        // Update current form if it's the one being updated
        if (this.currentForm?.id === id) {
          this.currentForm = response.data
        }

        // Update in list if present
        const index = this.forms.findIndex(f => f.id === id)
        if (index !== -1) {
          const existing = this.forms[index]!
          this.forms[index] = {
            ...existing,
            name: response.data.name,
            description: response.data.description,
            version: response.data.version,
            updatedAt: response.data.updatedAt
          }
        }

        return response.data
      }
      catch (error) {
        const err = error as { error?: { message?: string } }
        this.error = err?.error?.message || 'Failed to update review form'
        failed('update', 'review form', 'server')
        throw error
      }
      finally {
        this.isLoading = false
      }
    },

    async deleteForm(id: string): Promise<void> {
      const { deleted, failed } = useNotification()
      this.isLoading = true
      this.error = null

      try {
        await reviewFormsService.deleteForm(id)
        deleted('Review form')

        // Remove from list
        const index = this.forms.findIndex(f => f.id === id)
        if (index !== -1) {
          this.forms.splice(index, 1)
          this.pagination.totalItems--
        }

        // Clear current if deleted
        if (this.currentForm?.id === id) {
          this.currentForm = null
        }
      }
      catch (error) {
        const err = error as { error?: { message?: string } }
        this.error = err?.error?.message || 'Failed to delete review form'
        failed('delete', 'review form', 'server')
        throw error
      }
      finally {
        this.isLoading = false
      }
    },

    async publishForm(id: string): Promise<void> {
      const { success, failed } = useNotification()
      this.isLoading = true
      this.error = null

      try {
        const response = await reviewFormsService.publishForm(id)
        success('Review form published successfully')

        // Update current form status
        if (this.currentForm?.id === id) {
          this.currentForm.status = 'published'
          this.currentForm.version = response.data.version
          this.currentForm.publishedAt = response.data.publishedAt
        }

        // Update in list
        const index = this.forms.findIndex(f => f.id === id)
        if (index !== -1) {
          this.forms[index]!.status = 'published'
          this.forms[index]!.version = response.data.version
          this.forms[index]!.publishedAt = response.data.publishedAt
        }
      }
      catch (error) {
        const err = error as { error?: { message?: string } }
        this.error = err?.error?.message || 'Failed to publish review form'
        failed('publish', 'review form', 'server')
        throw error
      }
      finally {
        this.isLoading = false
      }
    },

    async archiveForm(id: string): Promise<void> {
      this.isLoading = true
      this.error = null

      try {
        await reviewFormsService.archiveForm(id)

        // Update current form status
        if (this.currentForm?.id === id) {
          this.currentForm.status = 'archived'
        }

        // Update in list
        const index = this.forms.findIndex(f => f.id === id)
        if (index !== -1) {
          this.forms[index]!.status = 'archived'
        }
      }
      catch (error) {
        const err = error as { error?: { message?: string } }
        this.error = err?.error?.message || 'Failed to archive review form'
        throw error
      }
      finally {
        this.isLoading = false
      }
    },

    async setDefault(id: string): Promise<void> {
      const { success, failed } = useNotification()
      this.isLoading = true
      this.error = null

      try {
        await reviewFormsService.setDefault(id)

        // Unset previous default in list
        this.forms.forEach(f => { f.isDefault = f.id === id })

        // Update current form if it's the one being set
        if (this.currentForm?.id === id) {
          this.currentForm.isDefault = true
        }

        success('Form set as company default')
      }
      catch (error) {
        const err = error as { error?: { message?: string } }
        this.error = err?.error?.message || 'Failed to set default form'
        failed('set', 'default form', 'server')
        throw error
      }
      finally {
        this.isLoading = false
      }
    },

    async cloneForm(id: string, data: ReviewFormCloneRequest): Promise<ReviewFormListItem | null> {
      this.isLoading = true
      this.error = null

      try {
        const response = await reviewFormsService.cloneForm(id, data)
        // Refresh list after cloning
        await this.fetchForms()
        // Return the cloned form from the list
        return this.forms.find(f => f.id === response.data.id) || null
      }
      catch (error) {
        const err = error as { error?: { message?: string } }
        this.error = err?.error?.message || 'Failed to clone review form'
        throw error
      }
      finally {
        this.isLoading = false
      }
    },

    async fetchVersionHistory(id: string): Promise<FormVersionHistoryItem[]> {
      this.isLoading = true
      this.error = null

      try {
        const response = await reviewFormsService.getFormVersions(id)
        this.versionHistory = response.data
        return response.data
      }
      catch (error) {
        const err = error as { error?: { message?: string } }
        this.error = err?.error?.message || 'Failed to fetch version history'
        throw error
      }
      finally {
        this.isLoading = false
      }
    },

    async assignToDepartments(id: string, data: ReviewFormAssignRequest): Promise<number> {
      this.isLoading = true
      this.error = null

      try {
        const response = await reviewFormsService.assignToDepartments(id, data)

        // Refresh the form to get updated assignments
        if (this.currentForm?.id === id) {
          await this.fetchForm(id)
        }

        // Return assignment count
        return response.data.assigned as number
      }
      catch (error) {
        const err = error as { error?: { message?: string } }
        this.error = err?.error?.message || 'Failed to assign form to departments'
        throw error
      }
      finally {
        this.isLoading = false
      }
    },

    // ============================================
    // FILTER & PAGINATION ACTIONS
    // ============================================

    setFilters(filters: ReviewFormFilters): void {
      this.filters = { ...filters }
      this.pagination.page = 1
    },

    updateFilter<K extends keyof ReviewFormFilters>(key: K, value: ReviewFormFilters[K]): void {
      this.filters[key] = value
      this.pagination.page = 1
    },

    clearFilters(): void {
      this.filters = {}
      this.pagination.page = 1
    },

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
    // UTILITY ACTIONS
    // ============================================

    clearCurrentForm(): void {
      this.currentForm = null
    },

    clearVersionHistory(): void {
      this.versionHistory = []
    },

    clearError(): void {
      this.error = null
    }
  }
})
