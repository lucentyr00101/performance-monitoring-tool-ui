<script setup lang="ts">
import type { ReviewForm, ReviewFormQuestion, ReviewFormQuestionType, RatingScaleConfig, MultipleChoiceConfig, CheckboxConfig } from '~/types/review-form'

const props = defineProps<{
  form: ReviewForm
  showHeader?: boolean
}>()

// Get sorted sections
const sortedSections = computed(() => {
  return [...props.form.sections].sort((a, b) => a.order - b.order)
})

// Get sorted questions for a section
function getSortedQuestions(sectionId: string) {
  const section = props.form.sections.find(s => s.id === sectionId)
  if (!section) return []
  return [...section.questions].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
}

// Get question type label
function getQuestionTypeLabel(type: ReviewFormQuestionType): string {
  const labels: Record<ReviewFormQuestionType, string> = {
    rating_scale: 'Rating Scale',
    text_short: 'Short Text',
    text_long: 'Long Text',
    multiple_choice: 'Multiple Choice',
    checkbox: 'Checkboxes',
    yes_no: 'Yes/No',
    goal_rating: 'Goal Rating',
    number: 'Number'
  }
  return labels[type] || type
}

// Get rating scale range
function getRatingRange(question: ReviewFormQuestion): string {
  if (question.type !== 'rating_scale' && question.type !== 'goal_rating') return ''
  const config = question.config as RatingScaleConfig | undefined
  if (!config) return '1 - 5'
  return `${config.min ?? 1} - ${config.max ?? 5}`
}

// Get rating config min/max
function getRatingConfig(question: ReviewFormQuestion) {
  const config = question.config as RatingScaleConfig | undefined
  return {
    min: config?.min ?? 1,
    max: config?.max ?? 5
  }
}

// Get options from config
function getOptions(question: ReviewFormQuestion): string[] {
  const config = question.config as MultipleChoiceConfig | CheckboxConfig | undefined
  return config?.options ?? []
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div v-if="showHeader" class="bg-gray-900 rounded-lg p-6">
      <h2 class="text-xl font-semibold text-white mb-2">{{ form.name }}</h2>
      <p v-if="form.description" class="text-gray-400 mb-4">{{ form.description }}</p>
      <div v-if="form.instructions" class="bg-gray-800/50 rounded-lg p-4">
        <h4 class="text-sm font-medium text-gray-300 mb-2">Instructions</h4>
        <p class="text-sm text-gray-400 whitespace-pre-wrap">{{ form.instructions }}</p>
      </div>
    </div>

    <!-- Sections -->
    <div
      v-for="section in sortedSections"
      :key="section.id"
      class="bg-gray-900 rounded-lg p-6"
    >
      <div class="mb-4">
        <h3 class="text-lg font-medium text-white">{{ section.title }}</h3>
        <p v-if="section.description" class="text-sm text-gray-400 mt-1">
          {{ section.description }}
        </p>
      </div>

      <!-- Questions -->
      <div class="space-y-6">
        <div
          v-for="(question, index) in getSortedQuestions(section.id)"
          :key="question.id"
          class="border-l-2 border-gray-700 pl-4"
        >
          <div class="flex items-start justify-between gap-3 mb-2">
            <div class="flex-1">
              <span class="text-gray-500 text-sm mr-2">{{ index + 1 }}.</span>
              <span class="text-white font-medium">{{ question.text }}</span>
              <span v-if="question.isRequired" class="text-red-400 ml-1">*</span>
            </div>
            <UBadge variant="subtle" color="neutral" size="xs">
              {{ getQuestionTypeLabel(question.type) }}
            </UBadge>
          </div>

          <p v-if="question.helpText" class="text-sm text-gray-500 mb-3">
            {{ question.helpText }}
          </p>

          <!-- Question preview based on type -->
          <div class="mt-3">
            <!-- Rating Scale Preview -->
            <div v-if="question.type === 'rating_scale' || question.type === 'goal_rating'" class="flex items-center gap-2">
              <div class="flex gap-1">
                <div
                  v-for="i in (getRatingConfig(question).max - getRatingConfig(question).min + 1)"
                  :key="i"
                  class="w-8 h-8 rounded border border-gray-600 bg-gray-800 flex items-center justify-center text-sm text-gray-400"
                >
                  {{ getRatingConfig(question).min + i - 1 }}
                </div>
              </div>
              <span class="text-xs text-gray-500">{{ getRatingRange(question) }}</span>
            </div>

            <!-- Text Short Preview -->
            <div v-else-if="question.type === 'text_short'" class="bg-gray-800 rounded border border-gray-700 px-3 py-2">
              <span class="text-sm text-gray-500">Enter your response...</span>
            </div>

            <!-- Text Long Preview -->
            <div v-else-if="question.type === 'text_long'" class="bg-gray-800 rounded border border-gray-700 px-3 py-2 min-h-[80px]">
              <span class="text-sm text-gray-500">Enter your detailed response...</span>
            </div>

            <!-- Multiple Choice Preview -->
            <div v-else-if="question.type === 'multiple_choice'" class="space-y-2">
              <div
                v-for="option in getOptions(question)"
                :key="option"
                class="flex items-center gap-2"
              >
                <div class="w-4 h-4 rounded-full border border-gray-600" />
                <span class="text-sm text-gray-400">{{ option }}</span>
              </div>
            </div>

            <!-- Checkbox Preview -->
            <div v-else-if="question.type === 'checkbox'" class="space-y-2">
              <div
                v-for="option in getOptions(question)"
                :key="option"
                class="flex items-center gap-2"
              >
                <div class="w-4 h-4 rounded border border-gray-600" />
                <span class="text-sm text-gray-400">{{ option }}</span>
              </div>
            </div>

            <!-- Yes/No Preview -->
            <div v-else-if="question.type === 'yes_no'" class="flex gap-3">
              <div class="px-4 py-2 bg-gray-800 border border-gray-700 rounded text-sm text-gray-400">Yes</div>
              <div class="px-4 py-2 bg-gray-800 border border-gray-700 rounded text-sm text-gray-400">No</div>
            </div>

            <!-- Number Preview -->
            <div v-else-if="question.type === 'number'" class="bg-gray-800 rounded border border-gray-700 px-3 py-2 w-32">
              <span class="text-sm text-gray-500">0</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div v-if="!sortedSections.length" class="text-center py-8 text-gray-400">
      <UIcon name="i-heroicons-document-text" class="w-8 h-8 mx-auto mb-2 text-gray-600" />
      <p>No sections added to this form yet</p>
    </div>
  </div>
</template>
