<script setup lang="ts">
import type { ReviewForm, ReviewFormSection, ReviewFormQuestion, ReviewFormQuestionType } from '~/types/review-form'

const props = defineProps<{
  initialForm?: Partial<ReviewForm>
  isEditing?: boolean
}>()

const emit = defineEmits<{
  save: [form: Partial<ReviewForm>]
  cancel: []
  preview: []
}>()

// Form state
const formName = ref(props.initialForm?.name || '')
const formDescription = ref(props.initialForm?.description || '')
const formInstructions = ref(props.initialForm?.instructions || '')
const sections = ref<ReviewFormSection[]>(props.initialForm?.sections || [])

// Editing state
const editingSectionId = ref<string | null>(null)
const editingQuestionId = ref<string | null>(null)

// Generate IDs
let sectionCounter = sections.value.length
let questionCounter = sections.value.reduce((sum, s) => sum + s.questions.length, 0)

function generateSectionId(): string {
  return `section-new-${++sectionCounter}`
}

function generateQuestionId(): string {
  return `q-new-${++questionCounter}`
}

// Question type options
const questionTypes: { value: ReviewFormQuestionType; label: string; description: string }[] = [
  { value: 'rating_scale', label: 'Rating Scale', description: 'Numeric scale (e.g., 1-5)' },
  { value: 'text_short', label: 'Short Text', description: 'Single line text input' },
  { value: 'text_long', label: 'Long Text', description: 'Multi-line text area' },
  { value: 'multiple_choice', label: 'Multiple Choice', description: 'Select one option' },
  { value: 'checkbox', label: 'Checkboxes', description: 'Select multiple options' },
  { value: 'yes_no', label: 'Yes/No', description: 'Binary choice' },
  { value: 'goal_rating', label: 'Goal Rating', description: 'Rate goal completion' },
  { value: 'number', label: 'Number', description: 'Numeric input' }
]

// Section management
function addSection() {
  const newSection: ReviewFormSection = {
    id: generateSectionId(),
    title: 'New Section',
    description: '',
    order: sections.value.length + 1,
    forReviewer: 'both',
    questions: []
  }
  sections.value.push(newSection)
  editingSectionId.value = newSection.id
}

function updateSection(sectionId: string, updates: Partial<ReviewFormSection>) {
  const index = sections.value.findIndex(s => s.id === sectionId)
  if (index !== -1 && sections.value[index]) {
    sections.value[index] = { ...sections.value[index], ...updates }
  }
}

function deleteSection(sectionId: string) {
  sections.value = sections.value.filter(s => s.id !== sectionId)
  // Reorder remaining sections
  sections.value.forEach((s, i) => {
    s.order = i + 1
  })
}

function moveSection(sectionId: string, direction: 'up' | 'down') {
  const index = sections.value.findIndex(s => s.id === sectionId)
  if (index === -1) return
  
  const newIndex = direction === 'up' ? index - 1 : index + 1
  if (newIndex < 0 || newIndex >= sections.value.length) return
  
  const current = sections.value[index]
  const target = sections.value[newIndex]
  if (current && target) {
    sections.value[index] = target
    sections.value[newIndex] = current
  }
  
  // Update order
  sections.value.forEach((s, i) => {
    s.order = i + 1
  })
}

// Question management
function addQuestion(sectionId: string, type: ReviewFormQuestionType = 'text_short') {
  const section = sections.value.find(s => s.id === sectionId)
  if (!section) return

  const newQuestion: ReviewFormQuestion = {
    id: generateQuestionId(),
    text: 'New Question',
    helpText: '',
    type: type,
    isRequired: false,
    order: section.questions.length + 1,
    forReviewer: 'both',
    config: getDefaultConfig(type)
  }
  section.questions.push(newQuestion)
  editingQuestionId.value = newQuestion.id
}

function getDefaultConfig(type: ReviewFormQuestionType): ReviewFormQuestion['config'] {
  switch (type) {
    case 'rating_scale':
    case 'goal_rating':
      return { scaleType: 'numeric', min: 1, max: 5, labels: { '1': 'Poor', '3': 'Average', '5': 'Excellent' } }
    case 'text_short':
      return { placeholder: '', maxLength: 500 }
    case 'text_long':
      return { placeholder: '', maxLength: 2000 }
    case 'multiple_choice':
    case 'checkbox':
      return { options: ['Option 1', 'Option 2', 'Option 3'] }
    case 'yes_no':
      return undefined
    case 'number':
      return { min: 0, max: 100 }
    default:
      return undefined
  }
}

function updateQuestion(sectionId: string, questionId: string, updates: Partial<ReviewFormQuestion>) {
  const section = sections.value.find(s => s.id === sectionId)
  if (!section) return
  
  const index = section.questions.findIndex(q => q.id === questionId)
  if (index !== -1 && section.questions[index]) {
    section.questions[index] = { ...section.questions[index], ...updates }
  }
}

function deleteQuestion(sectionId: string, questionId: string) {
  const section = sections.value.find(s => s.id === sectionId)
  if (!section) return
  
  section.questions = section.questions.filter(q => q.id !== questionId)
  section.questions.forEach((q, i) => {
    q.order = i + 1
  })
}

function moveQuestion(sectionId: string, questionId: string, direction: 'up' | 'down') {
  const section = sections.value.find(s => s.id === sectionId)
  if (!section) return
  
  const index = section.questions.findIndex(q => q.id === questionId)
  if (index === -1) return
  
  const newIndex = direction === 'up' ? index - 1 : index + 1
  if (newIndex < 0 || newIndex >= section.questions.length) return
  
  const current = section.questions[index]
  const target = section.questions[newIndex]
  if (current && target) {
    section.questions[index] = target
    section.questions[newIndex] = current
  }
  
  section.questions.forEach((q, i) => {
    q.order = i + 1
  })
}

// Form validation
const isFormValid = computed(() => {
  if (!formName.value.trim()) return false
  if (sections.value.length === 0) return false
  return sections.value.every(s => s.questions.length > 0)
})

// Save form
function handleSave() {
  if (!isFormValid.value) return
  
  emit('save', {
    ...props.initialForm,
    name: formName.value,
    description: formDescription.value || undefined,
    instructions: formInstructions.value || undefined,
    sections: sections.value
  })
}

// Get question type icon
function getQuestionTypeIcon(type: ReviewFormQuestionType): string {
  const icons: Record<ReviewFormQuestionType, string> = {
    rating_scale: 'i-heroicons-star',
    text_short: 'i-heroicons-chat-bubble-left',
    text_long: 'i-heroicons-document-text',
    multiple_choice: 'i-heroicons-list-bullet',
    checkbox: 'i-heroicons-check-circle',
    yes_no: 'i-heroicons-hand-thumb-up',
    goal_rating: 'i-heroicons-flag',
    number: 'i-heroicons-hashtag'
  }
  return icons[type] || 'i-heroicons-question-mark-circle'
}
</script>

<template>
  <div class="space-y-6">
    <!-- Form Header -->
    <UCard class="bg-gray-900">
      <h2 class="text-lg font-semibold text-white mb-4">Form Details</h2>
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-1">
            Form Name <span class="text-red-400">*</span>
          </label>
          <UInput v-model="formName" placeholder="e.g., Q4 Performance Review" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-1">Description</label>
          <UTextarea
            v-model="formDescription"
            placeholder="Brief description of this review form..."
            :rows="2"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-1">Instructions</label>
          <UTextarea
            v-model="formInstructions"
            placeholder="Instructions for reviewers..."
            :rows="3"
          />
        </div>
      </div>
    </UCard>

    <!-- Sections -->
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-semibold text-white">Sections</h2>
        <UButton color="primary" variant="soft" icon="i-heroicons-plus" @click="addSection">
          Add Section
        </UButton>
      </div>

      <!-- Section list -->
      <div
        v-for="(section, sIndex) in sections"
        :key="section.id"
        class="bg-gray-900 rounded-lg overflow-hidden"
      >
        <!-- Section header -->
        <div class="bg-gray-800 px-4 py-3 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <span class="text-gray-500 text-sm">#{{ sIndex + 1 }}</span>
            <input
              v-if="editingSectionId === section.id"
              v-model="section.title"
              class="bg-transparent border-b border-gray-600 text-white font-medium focus:outline-none focus:border-primary-500"
              @blur="editingSectionId = null"
              @keyup.enter="editingSectionId = null"
            />
            <span v-else class="text-white font-medium">{{ section.title }}</span>
          </div>
          <div class="flex items-center gap-1">
            <UButton
              variant="ghost"
              color="neutral"
              icon="i-heroicons-pencil"
              size="xs"
              @click="editingSectionId = section.id"
            />
            <UButton
              variant="ghost"
              color="neutral"
              icon="i-heroicons-arrow-up"
              size="xs"
              :disabled="sIndex === 0"
              @click="moveSection(section.id, 'up')"
            />
            <UButton
              variant="ghost"
              color="neutral"
              icon="i-heroicons-arrow-down"
              size="xs"
              :disabled="sIndex === sections.length - 1"
              @click="moveSection(section.id, 'down')"
            />
            <UButton
              variant="ghost"
              color="error"
              icon="i-heroicons-trash"
              size="xs"
              @click="deleteSection(section.id)"
            />
          </div>
        </div>

        <!-- Section description -->
        <div class="px-4 py-2 border-b border-gray-800">
          <UInput
            v-model="section.description"
            placeholder="Section description (optional)"
            variant="none"
            class="text-sm"
          />
        </div>

        <!-- Questions -->
        <div class="p-4 space-y-3">
          <div
            v-for="(question, qIndex) in section.questions"
            :key="question.id"
            class="bg-gray-800/50 rounded-lg p-3"
          >
            <div class="flex items-start gap-3">
              <div class="flex items-center gap-2 text-gray-500">
                <UIcon :name="getQuestionTypeIcon(question.type)" class="w-4 h-4" />
                <span class="text-xs">Q{{ qIndex + 1 }}</span>
              </div>
              
              <div class="flex-1">
                <input
                  v-if="editingQuestionId === question.id"
                  v-model="question.text"
                  class="w-full bg-transparent border-b border-gray-600 text-white focus:outline-none focus:border-primary-500"
                  @blur="editingQuestionId = null"
                  @keyup.enter="editingQuestionId = null"
                />
                <span v-else class="text-white">
                  {{ question.text }}
                  <span v-if="question.isRequired" class="text-red-400">*</span>
                </span>
                
                <div class="flex items-center gap-2 mt-2">
                  <UCheckbox
                    :model-value="question.isRequired"
                    label="Required"
                    @update:model-value="(val: boolean | 'indeterminate') => updateQuestion(section.id, question.id, { isRequired: val === true })"
                  />
                </div>
              </div>

              <div class="flex items-center gap-1">
                <UButton
                  variant="ghost"
                  color="neutral"
                  icon="i-heroicons-pencil"
                  size="xs"
                  @click="editingQuestionId = question.id"
                />
                <UButton
                  variant="ghost"
                  color="neutral"
                  icon="i-heroicons-arrow-up"
                  size="xs"
                  :disabled="qIndex === 0"
                  @click="moveQuestion(section.id, question.id, 'up')"
                />
                <UButton
                  variant="ghost"
                  color="neutral"
                  icon="i-heroicons-arrow-down"
                  size="xs"
                  :disabled="qIndex === section.questions.length - 1"
                  @click="moveQuestion(section.id, question.id, 'down')"
                />
                <UButton
                  variant="ghost"
                  color="error"
                  icon="i-heroicons-trash"
                  size="xs"
                  @click="deleteQuestion(section.id, question.id)"
                />
              </div>
            </div>
          </div>

          <!-- Add question -->
          <UDropdownMenu
            :items="questionTypes.map(qt => ({
              label: qt.label,
              icon: getQuestionTypeIcon(qt.value),
              click: () => addQuestion(section.id, qt.value)
            }))"
          >
            <UButton
              variant="outline"
              color="neutral"
              icon="i-heroicons-plus"
              size="sm"
              class="w-full"
            >
              Add Question
            </UButton>
          </UDropdownMenu>
        </div>
      </div>

      <!-- Empty state -->
      <div
        v-if="!sections.length"
        class="text-center py-12 bg-gray-900 rounded-lg border-2 border-dashed border-gray-700"
      >
        <UIcon name="i-heroicons-rectangle-stack" class="w-12 h-12 text-gray-600 mx-auto mb-4" />
        <h3 class="text-lg font-medium text-white mb-2">No Sections Yet</h3>
        <p class="text-gray-400 mb-4">Add your first section to start building the form</p>
        <UButton color="primary" icon="i-heroicons-plus" @click="addSection">
          Add Section
        </UButton>
      </div>
    </div>

    <!-- Actions -->
    <div class="flex items-center justify-between bg-gray-900 rounded-lg p-4 sticky bottom-0">
      <div class="flex items-center gap-2">
        <UBadge v-if="sections.length" variant="subtle" color="neutral">
          {{ sections.length }} section{{ sections.length !== 1 ? 's' : '' }}
        </UBadge>
        <UBadge v-if="sections.length" variant="subtle" color="neutral">
          {{ sections.reduce((sum, s) => sum + s.questions.length, 0) }} questions
        </UBadge>
      </div>
      <div class="flex items-center gap-2">
        <UButton variant="ghost" color="neutral" @click="emit('cancel')">
          Cancel
        </UButton>
        <UButton
          v-if="sections.length"
          variant="outline"
          color="neutral"
          icon="i-heroicons-eye"
          @click="emit('preview')"
        >
          Preview
        </UButton>
        <UButton
          color="primary"
          :disabled="!isFormValid"
          @click="handleSave"
        >
          {{ isEditing ? 'Save Changes' : 'Create Form' }}
        </UButton>
      </div>
    </div>
  </div>
</template>
