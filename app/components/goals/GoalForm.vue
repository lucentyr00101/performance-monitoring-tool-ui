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

// Form state
const form = reactive({
  title: props.goal?.title || '',
  description: props.goal?.description || '',
  type: (props.goal?.type || 'individual') as GoalType,
  priority: (props.goal?.priority || 'medium') as GoalPriority,
  visibility: (props.goal?.visibility || 'private') as GoalVisibility,
  due_date: props.goal?.due_date || '',
  start_date: props.goal?.start_date || '',
  parent_goal_id: props.goal?.parent_goal_id || '',
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
  title: '',
  due_date: '',
  date_range: ''
})

function validate(): boolean {
  errors.title = ''
  errors.due_date = ''
  errors.date_range = ''
  
  if (!form.title.trim()) {
    errors.title = 'Title is required'
  } else if (form.title.length < 5) {
    errors.title = 'Title must be at least 5 characters'
  }
  
  if (!form.due_date) {
    errors.due_date = 'Due date is required'
  } else if (new Date(form.due_date) < new Date()) {
    errors.due_date = 'Due date must be in the future'
  }
  
  // Validate start date is before due date
  if (form.start_date && form.due_date) {
    const startDate = new Date(form.start_date)
    const dueDate = new Date(form.due_date)
    if (startDate >= dueDate) {
      errors.date_range = 'Start date must be before due date'
    }
  }
  
  return !errors.title && !errors.due_date && !errors.date_range
}

async function handleSubmit() {
  if (!validate()) return
  
  isLoading.value = true
  try {
    const data: GoalCreateRequest = {
      title: form.title.trim(),
      description: form.description.trim() || undefined,
      type: form.type,
      owner_id: user.value?.id || '',
      priority: form.priority,
      visibility: form.visibility,
      due_date: form.due_date,
      start_date: form.start_date || undefined,
      parent_goal_id: form.parent_goal_id || undefined,
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
    form.priority = template.default_priority || 'medium'
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
  <form @submit.prevent="handleSubmit" class="space-y-6">
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
      />
    </UFormField>

    <!-- Description -->
    <UFormField label="Description">
      <UTextarea
        v-model="form.description"
        placeholder="Describe the goal, its importance, and success criteria..."
        :rows="3"
      />
    </UFormField>

    <!-- Type & Priority Row -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <UFormField label="Goal Type" required>
        <USelect
          v-model="form.type"
          :items="typeOptions"
        />
      </UFormField>

      <UFormField label="Priority">
        <USelect
          v-model="form.priority"
          :items="priorityOptions"
        />
      </UFormField>
    </div>

    <!-- Dates Row -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <UFormField label="Start Date" :error="errors.date_range">
        <UInput
          v-model="form.start_date"
          type="date"
        />
      </UFormField>

      <UFormField label="Due Date" :error="errors.due_date" required>
        <UInput
          v-model="form.due_date"
          type="date"
          :min="minDate"
        />
      </UFormField>
    </div>

    <!-- Date Range Error -->
    <p v-if="errors.date_range" class="text-red-400 text-sm -mt-4">
      {{ errors.date_range }}
    </p>

    <!-- Visibility -->
    <UFormField label="Visibility">
      <USelect
        v-model="form.visibility"
        :items="visibilityOptions"
      />
    </UFormField>

    <!-- Actions -->
    <div class="flex items-center justify-end gap-3 pt-4 border-t border-gray-800">
      <UButton
        type="button"
        variant="ghost"
        color="neutral"
        @click="emit('cancel')"
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
