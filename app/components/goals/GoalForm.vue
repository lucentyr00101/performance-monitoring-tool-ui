<script setup lang="ts">
import type { Goal, GoalType, GoalPriority, GoalVisibility, GoalCreateRequest } from '~/types/goal'

interface Props {
  goal?: Goal | null
  mode: 'create' | 'edit'
}

const props = withDefaults(defineProps<Props>(), {
  goal: null
})

const emit = defineEmits<{
  submit: [data: GoalCreateRequest]
  cancel: []
}>()

const { canCreateGoal, fetchTemplates, templates } = useGoals()
const { user } = useAuth()

const isLoading = ref(false)
const formDirty = ref(false)
useUnsavedChanges(() => formDirty.value)

// Helper function to convert ISO 8601 date to YYYY-MM-DD
function formatDateForInput(dateString?: string): string {
  if (!dateString) return ''
  // If already in YYYY-MM-DD format, return as is
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return dateString
  // Otherwise, parse and format to YYYY-MM-DD
  const datePart = dateString.split('T')[0]
  return datePart || ''
}

// Form state
const form = reactive({
  title: props.goal?.title || '',
  description: props.goal?.description || '',
  type: (props.goal?.type || 'individual') as GoalType,
  priority: (props.goal?.priority || 'medium') as GoalPriority,
  visibility: (props.goal?.visibility || 'private') as GoalVisibility,
  dueDate: formatDateForInput(props.goal?.dueDate),
  startDate: formatDateForInput(props.goal?.startDate),
  parentGoalId: props.goal?.parentGoalId || '',
  tags: props.goal?.tags || []
})

// Options
const typeOptions = [
  { label: 'Individual', value: 'individual', disabled: !canCreateGoal('individual') },
  { label: 'Team', value: 'team', disabled: !canCreateGoal('team') },
  { label: 'Department', value: 'department', disabled: !canCreateGoal('department') },
  { label: 'Company', value: 'company', disabled: !canCreateGoal('company') }
]

const priorityOptions = [
  { label: 'Low', value: 'low' },
  { label: 'Medium', value: 'medium' },
  { label: 'High', value: 'high' }
]

const visibilityOptions = [
  { label: 'Private - Only you', value: 'private' },
  { label: 'Team - Your team members', value: 'team' },
  { label: 'Department - Your department', value: 'department' },
  { label: 'Company - Everyone in the company', value: 'company' }
]

// Validation
const errors = reactive({
  title: undefined as string | undefined,
  dueDate: undefined as string | undefined,
  dateRange: undefined as string | undefined
})

function validate(): boolean {
  errors.title = undefined
  errors.dueDate = undefined
  errors.dateRange = undefined
  
  if (!form.title.trim()) {
    errors.title = 'Title is required'
  } else if (form.title.length < 5) {
    errors.title = 'Title must be at least 5 characters'
  }
  
  if (!form.dueDate) {
    errors.dueDate = 'Due date is required'
  } else if (props.mode === 'create') {
    // Only validate future date for new goals
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const dueDate = new Date(form.dueDate)
    if (dueDate < today) {
      errors.dueDate = 'Due date must be in the future'
    }
  }
  
  // Validate start date is before due date
  if (form.startDate && form.dueDate) {
    const startDate = new Date(form.startDate)
    const dueDate = new Date(form.dueDate)
    if (startDate >= dueDate) {
      errors.dateRange = 'Start date must be before due date'
    }
  }
  
  return !errors.title && !errors.dueDate && !errors.dateRange
}

async function handleSubmit() {
  if (!validate()) return

  isLoading.value = true
  formDirty.value = false
  try {
    const data: GoalCreateRequest = {
      title: form.title.trim(),
      description: form.description.trim() || undefined,
      type: form.type,
      owner_id: user.value?.id || '',
      priority: form.priority,
      visibility: form.visibility,
      due_date: formatDateForInput(form.dueDate),
      start_date: form.startDate ? formatDateForInput(form.startDate) : undefined,
      parent_goal_id: form.parentGoalId || undefined,
      tags: form.tags.length > 0 ? form.tags : undefined
    }
    emit('submit', data)
  } finally {
    isLoading.value = false
  }
}

// Template selection
const showTemplates = ref(false)

async function loadTemplates() {
  await fetchTemplates(form.type)
  showTemplates.value = true
}

function applyTemplate(templateId: string) {
  const template = templates.value.find(t => t.id === templateId)
  if (template) {
    form.title = template.title
    form.description = template.description || ''
    form.priority = template.defaultPriority || 'medium'
    showTemplates.value = false
  }
}

// Min date for due date picker
const minDate = computed(() => {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  return tomorrow.toISOString().split('T')[0]
})
</script>

<template>
  <form class="space-y-6" @submit.prevent="handleSubmit" @change="formDirty = true" @input="formDirty = true">
    <!-- Template Selection (create mode only) -->
    <div v-if="mode === 'create'" class="flex items-center gap-2">
      <UButton
        type="button"
        variant="outline"
        color="neutral"
        size="sm"
        icon="i-heroicons-document-duplicate"
        @click="loadTemplates"
      >
        Use Template
      </UButton>
    </div>

    <!-- Template Modal -->
    <UModal v-model:open="showTemplates">
      <template #content>
        <div class="p-6">
          <h3 class="text-lg font-semibold text-white mb-4">Select a Template</h3>
          <div class="space-y-2 max-h-[300px] overflow-y-auto">
            <button
              v-for="template in templates"
              :key="template.id"
              type="button"
              class="w-full text-left p-3 rounded-lg border border-gray-700 hover:border-primary-500 hover:bg-gray-800 transition-colors"
              @click="applyTemplate(template.id)"
            >
              <div class="font-medium text-white">{{ template.title }}</div>
              <div class="text-sm text-gray-400 mt-1">{{ template.description }}</div>
            </button>
          </div>
          <div class="mt-4 flex justify-end">
            <UButton
              type="button"
              variant="ghost"
              @click="showTemplates = false"
            >
              Cancel
            </UButton>
          </div>
        </div>
      </template>
    </UModal>

    <!-- Title -->
    <UFormField label="Title" :error="errors.title" required>
      <UInput
        v-model="form.title"
        placeholder="Enter a clear, measurable goal title"
        size="lg"
        class="w-full"
      />
    </UFormField>

    <!-- Description -->
    <UFormField label="Description">
      <UTextarea
        v-model="form.description"
        placeholder="Describe the goal, its importance, and success criteria..."
        :rows="3"
        class="w-full"
      />
    </UFormField>

    <!-- Type & Priority Row -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <UFormField label="Goal Type" required>
        <USelect
          v-model="form.type"
          :items="typeOptions"
          class="w-full"
        />
      </UFormField>

      <UFormField label="Priority">
        <USelect
          v-model="form.priority"
          :items="priorityOptions"
          class="w-full"
        />
      </UFormField>
    </div>

    <!-- Dates Row -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <UFormField label="Start Date" :error="errors.dateRange">
        <UInput
          v-model="form.startDate"
          type="date"
          class="w-full"
        />
      </UFormField>

      <UFormField label="Due Date" :error="errors.dueDate" required>
        <UInput
          v-model="form.dueDate"
          type="date"
          :min="minDate"
          class="w-full"
        />
      </UFormField>
    </div>

    <!-- Date Range Error -->
    <p v-if="errors.dateRange" class="text-red-400 text-sm -mt-4">
      {{ errors.dateRange }}
    </p>

    <!-- Visibility -->
    <UFormField label="Visibility">
      <USelect
        v-model="form.visibility"
        :items="visibilityOptions"
        class="w-full"
      />
    </UFormField>

    <!-- Actions -->
    <div class="flex items-center justify-end gap-3 pt-4 border-t border-gray-800">
      <UButton
        type="button"
        variant="ghost"
        color="neutral"
        @click="() => { formDirty = false; emit('cancel') }"
      >
        Cancel
      </UButton>
      <UButton
        type="submit"
        color="primary"
        :loading="isLoading"
      >
        {{ mode === 'create' ? 'Create Goal' : 'Save Changes' }}
      </UButton>
    </div>
  </form>
</template>
