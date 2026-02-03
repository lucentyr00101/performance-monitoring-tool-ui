// Review Forms Service - API calls for review forms management
import { api } from '~/utils/api'
import type {
  ReviewForm,
  ReviewFormListItem,
  ReviewFormListParams,
  ReviewFormCreateRequest,
  ReviewFormUpdateRequest,
  ReviewFormCloneRequest,
  ReviewFormAssignRequest,
  ReviewFormAssignResponse,
  FormVersionHistoryItem
} from '~/types/review-form'
import type { ApiResponse } from '~/types/auth'

interface PaginatedResponse<T> {
  success: boolean
  data: T[]
  meta: {
    pagination: {
      page: number
      perPage: number
      totalItems: number
      totalPages: number
    }
    timestamp: string
  }
}

interface CreateFormResponse {
  id: string
  name: string
  version: string
  status: string
  sectionsCount: number
  questionsCount: number
  createdAt: string
}

interface PublishFormResponse {
  id: string
  name: string
  version: string
  status: 'published'
  publishedAt: string
}

interface ArchiveFormResponse {
  id: string
  status: 'archived'
  archivedAt: string
}

interface CloneFormResponse {
  id: string
  name: string
  version: string
  status: 'draft'
  clonedFrom: {
    id: string
    name: string
    version: string
  }
  createdAt: string
}

/**
 * Review Forms Service - Communicates with the API Gateway
 */
export const reviewFormsService = {
  /**
   * List review forms with filtering and pagination
   * GET /api/v1/review-forms
   */
  async listForms(params: ReviewFormListParams = {}) {
    const queryParams = new URLSearchParams()
    
    // Query params stay snake_case per API convention
    if (params.page) queryParams.set('page', String(params.page))
    if (params.perPage) queryParams.set('per_page', String(params.perPage))
    if (params.status) queryParams.set('status', params.status)
    if (params.isDefault !== undefined) queryParams.set('is_default', String(params.isDefault))
    if (params.search) queryParams.set('search', params.search)

    const query = queryParams.toString()
    const endpoint = `/review-forms${query ? `?${query}` : ''}`
    
    return api.get<PaginatedResponse<ReviewFormListItem>['data']>(endpoint) as Promise<PaginatedResponse<ReviewFormListItem>>
  },

  /**
   * Get review form by ID
   * GET /api/v1/review-forms/:id
   */
  async getForm(id: string) {
    return api.get<ReviewForm>(`/review-forms/${id}`)
  },

  /**
   * Get the company default form
   * GET /api/v1/review-forms/default
   */
  async getDefaultForm() {
    return api.get<ReviewForm>('/review-forms/default')
  },

  /**
   * Create a new review form
   * POST /api/v1/review-forms
   */
  async createForm(data: ReviewFormCreateRequest) {
    return api.post<CreateFormResponse>('/review-forms', data) as Promise<ApiResponse<CreateFormResponse>>
  },

  /**
   * Update a review form
   * PUT /api/v1/review-forms/:id
   */
  async updateForm(id: string, data: ReviewFormUpdateRequest) {
    return api.put<ReviewForm>(`/review-forms/${id}`, data)
  },

  /**
   * Delete a review form (draft only)
   * DELETE /api/v1/review-forms/:id
   */
  async deleteForm(id: string) {
    return api.delete<undefined>(`/review-forms/${id}`)
  },

  /**
   * Publish a review form
   * POST /api/v1/review-forms/:id/publish
   */
  async publishForm(id: string) {
    return api.post<PublishFormResponse>(`/review-forms/${id}/publish`, {}) as Promise<ApiResponse<PublishFormResponse>>
  },

  /**
   * Archive a review form
   * POST /api/v1/review-forms/:id/archive
   */
  async archiveForm(id: string) {
    return api.post<ArchiveFormResponse>(`/review-forms/${id}/archive`, {}) as Promise<ApiResponse<ArchiveFormResponse>>
  },

  /**
   * Clone a review form
   * POST /api/v1/review-forms/:id/clone
   */
  async cloneForm(id: string, data: ReviewFormCloneRequest) {
    return api.post<CloneFormResponse>(`/review-forms/${id}/clone`, data) as Promise<ApiResponse<CloneFormResponse>>
  },

  /**
   * Get form version history
   * GET /api/v1/review-forms/:id/versions
   */
  async getFormVersions(id: string) {
    return api.get<FormVersionHistoryItem[]>(`/review-forms/${id}/versions`)
  },

  /**
   * Assign form to departments
   * POST /api/v1/review-forms/:id/assign
   */
  async assignToDepartments(id: string, data: ReviewFormAssignRequest) {
    return api.post<ReviewFormAssignResponse>(`/review-forms/${id}/assign`, data) as Promise<ApiResponse<ReviewFormAssignResponse>>
  },

  // ============================================
  // CONVENIENCE METHODS
  // ============================================

  /**
   * Get published forms only
   */
  async getPublishedForms() {
    return this.listForms({ status: 'published' })
  },

  /**
   * Get draft forms only
   */
  async getDraftForms() {
    return this.listForms({ status: 'draft' })
  },

  /**
   * Get form for a specific department
   * GET /api/v1/departments/:id/review-form
   */
  async getFormForDepartment(departmentId: string) {
    return api.get<ReviewForm>(`/departments/${departmentId}/review-form`)
  }
}
