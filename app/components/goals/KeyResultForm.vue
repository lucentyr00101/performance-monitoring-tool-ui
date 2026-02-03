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
  targetValue: props.keyResult?.targetValue || 100,
  currentValue: props.keyResult?.currentValue || 0,
  unit: props.keyResult?.unit || 'percent',
  dueDate: props.keyResult?.dueDate || ''
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
  targetValue: ''
})

function validate(): boolean {
  errors.title = ''
  errors.targetValue = ''
  
  if (!form.title.trim()) {
    errors.title = 'Title is required'
  } else if (form.title.length < 3) {
    errors.title = 'Title must be at least 3 characters'
  }
  
  if (form.targetValue <= 0) {
    errors.targetValue = 'Target value must be greater than 0'
  }
  
  return !errors.title && !errors.targetValue
}

async function handleSubmit() {
  if (!validate()) return
  
  isLoading.value = true
  try {
    const data: KeyResultCreateRequest = {
      title: form.title.trim(),
      description: form.description.trim() || undefined,
      targetValue: Number(form.targetValue),
      currentValue: Number(form.currentValue),
      unit: form.unit,
      dueDate: form.dueDate || undefined
    }
    emit('submit', data)
  } finally {
    isLoading.value = false
  }
}

// Calculate progress preview
const progressPreview = computed(() => {
  if (form.targetValue <= 0) return 0
  return Math.min(Math.round((form.currentValue / form.targetValue) * 100), 100)
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
      <UFormField label="Target Value" :error="errors.targetValue" required>
        <UInput
          v-model.number="form.targetValue"
          type="number"
          :min="1"
          placeholder="100"
        />
      </UFormField>

      <UFormField label="Current Value">
        <UInput
          v-model.number="form.currentValue"
          type="number"
          :min="0"
          :max="form.targetValue"
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
        v-model="form.dueDate"
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
