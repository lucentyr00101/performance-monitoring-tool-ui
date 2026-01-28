<script setup lang="ts">
import type { KeyResult, KeyResultCreateRequest } from '~/types/goal'

interface Props {
  keyResult?: KeyResult | null
  mode?: 'create' | 'edit'
}

const props = withDefaults(defineProps<Props>(), {
  keyResult: null,
  mode: 'create'
})

const emit = defineEmits<{
  submit: [data: KeyResultCreateRequest]
  cancel: []
}>()

const isLoading = ref(false)

// Form state
const form = reactive({
  title: props.keyResult?.title || '',
  description: props.keyResult?.description || '',
  target_value: props.keyResult?.target_value || 100,
  current_value: props.keyResult?.current_value || 0,
  unit: props.keyResult?.unit || 'percent',
  due_date: props.keyResult?.due_date || ''
})

const unitOptions = [
  { label: 'Percent (%)', value: 'percent' },
  { label: 'Number', value: 'number' },
  { label: 'Currency ($)', value: 'currency' },
  { label: 'Hours', value: 'hours' },
  { label: 'Days', value: 'days' },
  { label: 'Items', value: 'items' },
  { label: 'Users', value: 'users' },
  { label: 'Points', value: 'points' }
]

// Validation
const errors = reactive({
  title: '',
  target_value: ''
})

function validate(): boolean {
  errors.title = ''
  errors.target_value = ''
  
  if (!form.title.trim()) {
    errors.title = 'Title is required'
  } else if (form.title.length < 3) {
    errors.title = 'Title must be at least 3 characters'
  }
  
  if (form.target_value <= 0) {
    errors.target_value = 'Target value must be greater than 0'
  }
  
  return !errors.title && !errors.target_value
}

async function handleSubmit() {
  if (!validate()) return
  
  isLoading.value = true
  try {
    const data: KeyResultCreateRequest = {
      title: form.title.trim(),
      description: form.description.trim() || undefined,
      target_value: Number(form.target_value),
      current_value: Number(form.current_value),
      unit: form.unit,
      due_date: form.due_date || undefined
    }
    emit('submit', data)
  } finally {
    isLoading.value = false
  }
}

// Calculate progress preview
const progressPreview = computed(() => {
  if (form.target_value <= 0) return 0
  return Math.min(Math.round((form.current_value / form.target_value) * 100), 100)
})
</script>

<template>
  <form @submit.prevent="handleSubmit" class="space-y-5">
    <!-- Title -->
    <UFormField label="Title" :error="errors.title" required>
      <UInput
        v-model="form.title"
        placeholder="e.g., Increase user retention to 85%"
        size="lg"
      />
    </UFormField>

    <!-- Description -->
    <UFormField label="Description">
      <UTextarea
        v-model="form.description"
        placeholder="Describe how this key result will be measured..."
        :rows="2"
      />
    </UFormField>

    <!-- Unit -->
    <UFormField label="Measurement Unit">
      <USelect
        v-model="form.unit"
        :items="unitOptions"
      />
    </UFormField>

    <!-- Target & Current Values -->
    <div class="grid grid-cols-2 gap-4">
      <UFormField label="Target Value" :error="errors.target_value" required>
        <UInput
          v-model.number="form.target_value"
          type="number"
          :min="1"
          placeholder="100"
        />
      </UFormField>

      <UFormField label="Current Value">
        <UInput
          v-model.number="form.current_value"
          type="number"
          :min="0"
          :max="form.target_value"
          placeholder="0"
        />
      </UFormField>
    </div>

    <!-- Progress Preview -->
    <div class="bg-gray-800/50 rounded-lg p-4">
      <div class="flex items-center justify-between text-sm mb-2">
        <span class="text-gray-400">Progress Preview</span>
        <span class="text-white font-medium">{{ progressPreview }}%</span>
      </div>
      <div class="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
        <div
          class="h-full bg-primary-500 rounded-full transition-all duration-300"
          :style="{ width: `${progressPreview}%` }"
        />
      </div>
    </div>

    <!-- Due Date -->
    <UFormField label="Due Date">
      <UInput
        v-model="form.due_date"
        type="date"
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
        {{ mode === 'create' ? 'Add Key Result' : 'Save Changes' }}
      </UButton>
    </div>
  </form>
</template>
