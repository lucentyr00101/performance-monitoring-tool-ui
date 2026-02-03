<script setup lang="ts">
import type { FormAnswer, FormAnswerValue } from '~/types/review-form'
import type { AdhocReview } from '~/types/adhoc-review'

const props = defineProps<{
  review: AdhocReview
  disabled?: boolean
}>()

const emit = defineEmits<{
  submit: [responses: FormAnswer[]]
  saveDraft: [responses: FormAnswer[]]
}>()

// Get form from review
const form = computed(() => props.review.formSnapshot)

// Type for form sections and questions from snapshot
type FormSection = NonNullable<typeof props.review.formSnapshot>['sections'][number]
type FormQuestion = FormSection['questions'][number]

// Form responses - keyed by question ID
const responses = ref<Record<string, FormAnswerValue>>({})

// Additional manager comments per section
const sectionComments = ref<Record<string, string>>({})

// View mode for self-review
const showSelfReview = ref(true)

// Initialize responses from existing answers
function initializeResponses() {
  if (props.review.managerReview?.answers) {
    for (const answer of props.review.managerReview.answers) {
      responses.value[answer.questionId] = answer.value
    }
  }
}

// Get section questions
function getSectionQuestions(section: FormSection): FormQuestion[] {
  return [...section.questions].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
}

// Get sorted sections
const sortedSections = computed(() => {
  if (!form.value) return []
  return [...form.value.sections].sort((a, b) => a.order - b.order)
})

// Get self-review answer for a question
function getSelfReviewAnswer(questionId: string): FormAnswerValue | undefined {
  return props.review.selfReview?.answers?.find(a => a.questionId === questionId)?.value
}

// Format self-review answer for display
function formatSelfAnswer(value: FormAnswerValue | undefined, config: FormQuestion['config']): string {
  if (value === undefined || value === null) return 'Not answered'
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  if (Array.isArray(value)) return value.join(', ')
  if (typeof value === 'number' && config.type === 'rating_scale') {
    const label = config.labels?.[value]
    return label ? `${value} - ${label}` : String(value)
  }
  return String(value)
}

// Question rendering helpers
function getRatingOptions(config: FormQuestion['config']) {
  if (config.type !== 'rating_scale' && config.type !== 'goal_rating') return []
  const min = config.minValue ?? 1
  const max = config.maxValue ?? 5
  const options = []
  for (let i = min; i <= max; i++) {
    const label = config.labels?.[i] || String(i)
    options.push({ value: i, label })
  }
  return options
}

function getMultipleChoiceOptions(config: FormQuestion['config']) {
  if (config.type !== 'multiple_choice' && config.type !== 'checkbox') return []
  return config.options?.map(opt => ({ value: opt, label: opt })) || []
}

// Validation
function isQuestionValid(question: FormQuestion): boolean {
  if (!question.isRequired) return true
  const value = responses.value[question.id]
  if (value === undefined || value === null || value === '') return false
  if (Array.isArray(value) && value.length === 0) return false
  return true
}

const isFormValid = computed(() => {
  if (!form.value) return false
  for (const section of form.value.sections) {
    for (const question of section.questions) {
      if (!isQuestionValid(question)) return false
    }
  }
  return true
})

const invalidQuestions = computed(() => {
  if (!form.value) return []
  const invalid: string[] = []
  for (const section of form.value.sections) {
    for (const question of section.questions) {
      if (!isQuestionValid(question)) {
        invalid.push(question.id)
      }
    }
  }
  return invalid
})

// Build responses array for submission
function buildResponsesArray(): FormAnswer[] {
  const result: FormAnswer[] = []
  for (const [questionId, value] of Object.entries(responses.value)) {
    if (value !== undefined && value !== null && value !== '') {
      result.push({ questionId: questionId, value })
    }
  }
  return result
}

// Check if self-review is complete
const isSelfReviewComplete = computed(() => {
  return props.review.selfReview?.status === 'submitted'
})

// Handlers
function handleSubmit() {
  if (!isFormValid.value) return
  emit('submit', buildResponsesArray())
}

function handleSaveDraft() {
  emit('saveDraft', buildResponsesArray())
}

// Initialize on mount
onMounted(() => {
  initializeResponses()
})
</script>

<template>
  <div class="space-y-8">
    <!-- Form Header -->
    <div v-if="form" class="bg-gray-900 border border-gray-800 rounded-lg p-6">
      <div class="flex items-start justify-between">
        <div>
          <h2 class="text-xl font-semibold text-white mb-2">Manager Evaluation</h2>
          <p class="text-gray-400">{{ form.name }}</p>
        </div>
        <UBadge 
          v-if="isSelfReviewComplete" 
          color="success" 
          variant="subtle"
        >
          Self-Review Complete
        </UBadge>
        <UBadge 
          v-else 
          color="warning" 
          variant="subtle"
        >
          Self-Review Pending
        </UBadge>
      </div>
      
      <!-- Employee Info -->
      <div class="mt-4 flex items-center gap-4 p-4 bg-gray-800/50 rounded-lg">
        <UAvatar
          :alt="`${review.employee.firstName} ${review.employee.lastName}`"
          size="lg"
        />
        <div>
          <div class="font-medium text-white">
            {{ review.employee.firstName }} {{ review.employee.lastName }}
          </div>
          <div class="text-sm text-gray-400">
            {{ review.employee.jobTitle }} • {{ review.employee.department?.name }}
          </div>
        </div>
      </div>

      <!-- Toggle self-review visibility -->
      <div class="mt-4 flex items-center gap-2">
        <UCheckbox
          v-model="showSelfReview"
          label="Show employee's self-review responses"
        />
      </div>
    </div>

    <!-- Sections -->
    <div 
      v-for="section in sortedSections" 
      :key="section.id"
      class="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden"
    >
      <!-- Section Header -->
      <div class="bg-gray-800/50 px-6 py-4 border-b border-gray-800">
        <h3 class="text-lg font-medium text-white">{{ section.name }}</h3>
        <p v-if="section.description" class="text-sm text-gray-400 mt-1">
          {{ section.description }}
        </p>
      </div>

      <!-- Questions -->
      <div class="p-6 space-y-8">
        <div 
          v-for="question in getSectionQuestions(section)" 
          :key="question.id"
          class="space-y-3"
          :class="{ 'opacity-50': disabled }"
        >
          <!-- Question Label -->
          <label class="block text-sm font-medium text-gray-300">
            {{ question.text }}
            <span v-if="question.isRequired" class="text-red-400 ml-1">*</span>
          </label>
          <p v-if="question.helpText" class="text-xs text-gray-500">
            {{ question.helpText }}
          </p>

          <!-- Self-Review Answer (if visible) -->
          <div 
            v-if="showSelfReview && isSelfReviewComplete" 
            class="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3"
          >
            <div class="flex items-center gap-2 text-xs text-blue-400 mb-1">
              <UIcon name="i-heroicons-user" class="w-3 h-3" />
              Employee's Self-Assessment
            </div>
            <p class="text-sm text-gray-300">
              {{ formatSelfAnswer(getSelfReviewAnswer(question.id), question.config) }}
            </p>
          </div>

          <!-- Manager's Response -->
          <div class="pl-4 border-l-2 border-primary-500/50">
            <div class="flex items-center gap-2 text-xs text-primary-400 mb-2">
              <UIcon name="i-heroicons-user-group" class="w-3 h-3" />
              Your Evaluation
            </div>

            <!-- Rating Scale -->
            <div v-if="question.config.type === 'rating_scale'" class="flex gap-2 flex-wrap">
              <button
                v-for="option in getRatingOptions(question.config)"
                :key="option.value"
                type="button"
                class="px-4 py-2 rounded-lg border transition-colors text-sm"
                :class="responses[question.id] === option.value 
                  ? 'bg-primary-500 border-primary-500 text-white' 
                  : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-600'"
                :disabled="disabled"
                @click="responses[question.id] = option.value"
              >
                {{ option.value }} - {{ option.label }}
              </button>
            </div>

            <!-- Text Short -->
            <UInput
              v-else-if="question.config.type === 'text_short'"
              v-model="responses[question.id] as string"
              :placeholder="question.config.placeholder || 'Enter your evaluation...'"
              :maxlength="question.config.maxLength"
              :disabled="disabled"
              class="w-full"
            />

            <!-- Text Long -->
            <UTextarea
              v-else-if="question.config.type === 'text_long'"
              v-model="responses[question.id] as string"
              :placeholder="question.config.placeholder || 'Enter your detailed evaluation...'"
              :rows="question.config.rows || 4"
              :maxlength="question.config.maxLength"
              :disabled="disabled"
              class="w-full"
            />

            <!-- Multiple Choice -->
            <URadioGroup
              v-else-if="question.config.type === 'multiple_choice'"
              v-model="responses[question.id] as string"
              :options="getMultipleChoiceOptions(question.config)"
              :disabled="disabled"
            />

            <!-- Checkbox -->
            <div v-else-if="question.config.type === 'checkbox'" class="space-y-2">
              <UCheckbox
                v-for="option in getMultipleChoiceOptions(question.config)"
                :key="option.value"
                :label="option.label"
                :model-value="(responses[question.id] as string[] || []).includes(option.value)"
                :disabled="disabled"
                @update:model-value="(checked: boolean | 'indeterminate') => {
                  if (checked === 'indeterminate') return
                  const current = responses[question.id] as string[] || []
                  if (checked) {
                    responses[question.id] = [...current, option.value]
                  } else {
                    responses[question.id] = current.filter((v: string) => v !== option.value)
                  }
                }"
              />
            </div>

            <!-- Yes/No -->
            <div v-else-if="question.config.type === 'yes_no'" class="flex gap-3">
              <UButton
                :variant="responses[question.id] === true ? 'solid' : 'outline'"
                :color="responses[question.id] === true ? 'success' : 'neutral'"
                :disabled="disabled"
                @click="responses[question.id] = true"
              >
                Yes
              </UButton>
              <UButton
                :variant="responses[question.id] === false ? 'solid' : 'outline'"
                :color="responses[question.id] === false ? 'error' : 'neutral'"
                :disabled="disabled"
                @click="responses[question.id] = false"
              >
                No
              </UButton>
            </div>

            <!-- Number -->
            <UInput
              v-else-if="question.config.type === 'number'"
              v-model.number="responses[question.id] as number"
              type="number"
              :min="question.config.minValue"
              :max="question.config.maxValue"
              :placeholder="question.config.placeholder || 'Enter a number...'"
              :disabled="disabled"
              class="w-48"
            />

            <!-- Goal Rating -->
            <div v-else-if="question.config.type === 'goal_rating'" class="space-y-4">
              <div class="bg-gray-800 rounded-lg p-4">
                <p class="text-sm text-gray-400 mb-3">Rate the employee's progress:</p>
                <div class="flex gap-2 flex-wrap">
                  <button
                    v-for="option in getRatingOptions(question.config)"
                    :key="option.value"
                    type="button"
                    class="px-4 py-2 rounded-lg border transition-colors text-sm"
                    :class="responses[question.id] === option.value 
                      ? 'bg-primary-500 border-primary-500 text-white' 
                      : 'bg-gray-700 border-gray-600 text-gray-300 hover:border-gray-500'"
                    :disabled="disabled"
                    @click="responses[question.id] = option.value"
                  >
                    {{ option.value }} - {{ option.label }}
                  </button>
                </div>
              </div>
            </div>

            <!-- Validation Error -->
            <p 
              v-if="invalidQuestions.includes(question.id) && question.isRequired" 
              class="text-xs text-red-400 mt-1"
            >
              This field is required
            </p>
          </div>
        </div>

        <!-- Section-level manager comments -->
        <div class="pt-4 border-t border-gray-800">
          <label class="block text-sm font-medium text-gray-400 mb-2">
            Additional comments for this section (optional)
          </label>
          <UTextarea
            v-model="sectionComments[section.id]"
            placeholder="Add any additional observations or feedback for this section..."
            :rows="3"
            :disabled="disabled"
          />
        </div>
      </div>
    </div>

    <!-- Overall Manager Comments -->
    <div class="bg-gray-900 border border-gray-800 rounded-lg p-6">
      <h3 class="text-lg font-medium text-white mb-4">Overall Comments & Summary</h3>
      <UTextarea
        v-model="sectionComments['overall']"
        placeholder="Provide an overall summary of the employee's performance, key strengths, and areas for improvement..."
        :rows="5"
        :disabled="disabled"
      />
    </div>

    <!-- Actions -->
    <div class="flex justify-between items-center pt-4 border-t border-gray-800">
      <div class="text-sm text-gray-500">
        <template v-if="!isFormValid">
          {{ invalidQuestions.length }} required field(s) remaining
        </template>
        <template v-else>
          <UIcon name="i-heroicons-check-circle" class="w-4 h-4 text-green-400 inline mr-1" />
          All required fields completed
        </template>
      </div>
      <div class="flex gap-3">
        <UButton
          variant="ghost"
          color="neutral"
          :disabled="disabled"
          @click="handleSaveDraft"
        >
          Save Draft
        </UButton>
        <UButton
          color="primary"
          :disabled="disabled || !isFormValid"
          @click="handleSubmit"
        >
          Submit Manager Evaluation
        </UButton>
      </div>
    </div>
  </div>
</template>
