// Review Form Types
// Based on API spec: docs/api/review-forms.md and PRD: docs/prd/09-review-forms.md

// Form status
export type ReviewFormStatus = 'draft' | 'published' | 'archived'

// Question types
export type ReviewFormQuestionType =
  | 'rating_scale'
  | 'text_short'
  | 'text_long'
  | 'multiple_choice'
  | 'checkbox'
  | 'yes_no'
  | 'goal_rating'
  | 'number'

// Who should answer this question
export type ReviewerType = 'self' | 'manager' | 'both'

// Rating scale configuration
export interface RatingScaleConfig {
  scaleType: 'numeric' | 'stars' | 'emoji'
  min: number
  max: number
  labels?: Record<string, string>
}

// Text field configuration
export interface TextFieldConfig {
  minLength?: number
  maxLength?: number
  placeholder?: string
}

// Multiple choice configuration
export interface MultipleChoiceConfig {
  options: string[]
  allowOther?: boolean
}

// Checkbox configuration
export interface CheckboxConfig {
  options: string[]
  minSelections?: number
  maxSelections?: number
}

// Goal rating configuration
export interface GoalRatingConfig {
  includeActiveGoals: boolean
  includeCompletedGoals: boolean
}

// Number field configuration
export interface NumberFieldConfig {
  min?: number
  max?: number
  step?: number
}

// Union type for question config
export type QuestionConfig =
  | RatingScaleConfig
  | TextFieldConfig
  | MultipleChoiceConfig
  | CheckboxConfig
  | GoalRatingConfig
  | NumberFieldConfig

// Form question
export interface ReviewFormQuestion {
  id: string
  text: string
  helpText?: string
  type: ReviewFormQuestionType
  required?: boolean
  isRequired?: boolean
  order?: number
  forReviewer: ReviewerType
  weight?: number
  config?: QuestionConfig
}

// Form section
export interface ReviewFormSection {
  id: string
  title: string
  description?: string
  order: number
  collapsible?: boolean
  forReviewer: ReviewerType
  questions: ReviewFormQuestion[]
}

// Form settings
export interface ReviewFormSettings {
  ratingScale: {
    min: number
    max: number
    labels?: Record<string, string>
  }
}

// Department assignment info
export interface FormDepartmentAssignment {
  id: string
  name: string
  formType?: ReviewerType
  effectiveDate?: string
}

// Creator info
export interface FormCreator {
  id: string
  firstName: string
  lastName: string
}

// Review Form entity (full detail)
export interface ReviewForm {
  id: string
  name: string
  description?: string
  instructions?: string
  version: string
  status: ReviewFormStatus
  isDefault: boolean
  sections: ReviewFormSection[]
  settings: ReviewFormSettings
  assignedDepartments: FormDepartmentAssignment[]
  createdBy: FormCreator
  publishedAt?: string
  createdAt: string
  updatedAt: string
}

// Review Form list item (lighter version)
export interface ReviewFormListItem {
  id: string
  name: string
  description?: string
  version: string
  status: ReviewFormStatus
  isDefault: boolean
  sectionsCount: number
  questionsCount: number
  assignedDepartments: FormDepartmentAssignment[]
  createdBy: FormCreator
  publishedAt?: string
  createdAt: string
  updatedAt: string
}

// Form version history item
export interface FormVersionHistoryItem {
  version: string
  changedBy: FormCreator
  changeSummary?: string
  createdAt: string
  reviewsUsing: number
}

// Filter options
export interface ReviewFormFilters {
  status?: ReviewFormStatus
  isDefault?: boolean
  search?: string
}

// List params
export interface ReviewFormListParams extends ReviewFormFilters {
  page?: number
  perPage?: number
}

// Create form request
export interface ReviewFormCreateRequest {
  name: string
  description?: string
  instructions?: string
  sections: Omit<ReviewFormSection, 'id'>[]
  settings?: ReviewFormSettings
}

// Update form request
export interface ReviewFormUpdateRequest {
  name?: string
  description?: string
  instructions?: string
  sections?: Omit<ReviewFormSection, 'id'>[]
  settings?: ReviewFormSettings
}

// Clone form request
export interface ReviewFormCloneRequest {
  name: string
}

// Assign form to departments request
export interface ReviewFormAssignRequest {
  departments: {
    departmentId: string
    formType?: ReviewerType
    effectiveDate?: string
  }[]
}

// Assign form response
export interface ReviewFormAssignResponse {
  assigned: number
  departments: {
    departmentId: string
    name: string
    status: 'assigned' | 'updated' | 'removed'
  }[]
}

// Review Form store state
export interface ReviewFormState {
  forms: ReviewFormListItem[]
  currentForm: ReviewForm | null
  defaultForm: ReviewForm | null
  versionHistory: FormVersionHistoryItem[]
  filters: ReviewFormFilters
  pagination: {
    page: number
    perPage: number
    totalItems: number
    totalPages: number
  }
  isLoading: boolean
  error: string | null
}

// API Response types
export interface ReviewFormListResponse {
  success: boolean
  data: ReviewFormListItem[]
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

// Form answer value type
export type FormAnswerValue = string | number | boolean | string[]

// Single form answer (question response)
export interface FormAnswer {
  questionId: string
  value: FormAnswerValue
}

export interface ReviewFormResponse {
  success: boolean
  data: ReviewForm
  meta: {
    timestamp: string
  }
}

export interface ReviewFormCreateResponse {
  success: boolean
  data: {
    id: string
    name: string
    version: string
    status: ReviewFormStatus
    sectionsCount: number
    questionsCount: number
    createdAt: string
  }
  meta: {
    timestamp: string
  }
}

export interface ReviewFormPublishResponse {
  success: boolean
  data: {
    id: string
    name: string
    version: string
    status: 'published'
    publishedAt: string
  }
  meta: {
    timestamp: string
  }
}

export interface ReviewFormArchiveResponse {
  success: boolean
  data: {
    id: string
    status: 'archived'
    archivedAt: string
  }
  meta: {
    timestamp: string
  }
}

export interface ReviewFormCloneResponse {
  success: boolean
  data: {
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
  meta: {
    timestamp: string
  }
}

export interface ReviewFormVersionHistoryResponse {
  success: boolean
  data: FormVersionHistoryItem[]
  meta: {
    timestamp: string
  }
}

export interface ReviewFormAssignApiResponse {
  success: boolean
  data: ReviewFormAssignResponse
  meta: {
    timestamp: string
  }
}
