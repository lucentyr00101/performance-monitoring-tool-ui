<script setup lang="ts">
import type { ReviewCycleCreateRequest, ReviewCycleType, ReviewCycle } from '~/types/review'

interface Props {
  mode: 'create' | 'edit'
  cycle?: ReviewCycle
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'create'
})

const emit = defineEmits<{
  submit: [data: ReviewCycleCreateRequest]
  cancel: []
}>()

// Form state
const name = ref(props.cycle?.name || '')
const description = ref(props.cycle?.description || '')
const type = ref<ReviewCycleType>(props.cycle?.type || 'quarterly')
const startDate = ref(props.cycle?.start_date || '')
const endDate = ref(props.cycle?.end_date || '')
const includeSelfAssessment = ref(props.cycle?.settings?.include_self_assessment ?? true)
const includeManagerReview = ref(props.cycle?.settings?.include_manager_review ?? true)
const includePeerReview = ref(props.cycle?.settings?.include_peer_review ?? false)

// Validation
const errors = ref<Record<string, string>>({})

const typeOptions = [
  { label: 'Annual', value: 'annual' as ReviewCycleType },
  { label: 'Semi-Annual', value: 'semi-annual' as ReviewCycleType },
  { label: 'Quarterly', value: 'quarterly' as ReviewCycleType },
  { label: 'Monthly', value: 'monthly' as ReviewCycleType }
]

const isValid = computed(() => {
  return name.value.trim() !== '' &&
         type.value !== undefined &&
         startDate.value !== '' &&
         endDate.value !== '' &&
         new Date(endDate.value) > new Date(startDate.value)
})

function validate(): boolean {
  errors.value = {}
  
  if (!name.value.trim()) {
    errors.value.name = 'Name is required'
  }
  
  if (!startDate.value) {
    errors.value.startDate = 'Start date is required'
  }
  
  if (!endDate.value) {
    errors.value.endDate = 'End date is required'
  } else if (startDate.value && new Date(endDate.value) <= new Date(startDate.value)) {
    errors.value.endDate = 'End date must be after start date'
  }
  
  return Object.keys(errors.value).length === 0
}

function handleSubmit() {
  if (!validate()) return
  
  const data: ReviewCycleCreateRequest = {
    name: name.value.trim(),
    description: description.value.trim() || undefined,
    type: type.value,
    start_date: startDate.value,
    end_date: endDate.value,
    settings: {
      include_self_assessment: includeSelfAssessment.value,
      include_manager_review: includeManagerReview.value,
      include_peer_review: includePeerReview.value,
      rating_scale: { min: 1, max: 5 }
    }
  }
  
  emit('submit', data)
}

// Quick date helpers
function setQuarterlyDates() {
  const now = new Date()
  const quarter = Math.floor(now.getMonth() / 3) + 1
  const year = now.getFullYear()
  
  // Next quarter start
  const nextQuarterMonth = quarter * 3
  const startYear = nextQuarterMonth >= 12 ? year + 1 : year
  const startMonth = nextQuarterMonth >= 12 ? 0 : nextQuarterMonth
  
  const start = new Date(startYear, startMonth, 1)
  const end = new Date(startYear, startMonth + 1, 0) // Last day of month
  
  startDate.value = start.toISOString().split('T')[0]!
  endDate.value = end.toISOString().split('T')[0]!
}
</script>

<template>
  <form class="space-y-6" @submit.prevent="handleSubmit">
    <!-- Cycle Name -->
    <UFormField label="Cycle Name" required :error="errors.name">
      <UInput
        v-model="name"
        placeholder="e.g., Q1 2026 Performance Review"
        class="w-full"
      />
    </UFormField>

    <!-- Description -->
    <UFormField label="Description">
      <UTextarea
        v-model="description"
        placeholder="Brief description of this review cycle..."
        :rows="3"
        class="w-full"
      />
    </UFormField>

    <!-- Type -->
    <UFormField label="Cycle Type" required>
      <USelect
        v-model="type"
        :items="typeOptions"
        placeholder="Select cycle type"
        value-key="value"
        class="w-full"
      />
    </UFormField>

    <!-- Dates -->
    <div class="grid grid-cols-2 gap-4">
      <UFormField label="Start Date" required :error="errors.startDate">
        <UInput
          v-model="startDate"
          type="date"
          class="w-full"
        />
      </UFormField>
      
      <UFormField label="End Date" required :error="errors.endDate">
        <UInput
          v-model="endDate"
          type="date"
          class="w-full"
        />
      </UFormField>
    </div>

    <!-- Quick Date Button -->
    <div v-if="type === 'quarterly'" class="flex justify-end">
      <UButton
        type="button"
        variant="ghost"
        size="sm"
        color="neutral"
        @click="setQuarterlyDates"
      >
        <UIcon name="i-heroicons-calendar" class="w-4 h-4 mr-1" />
        Set Next Quarter
      </UButton>
    </div>

    <!-- Review Settings -->
    <div class="space-y-3">
      <label class="block text-sm font-medium text-gray-300">Review Types</label>
      
      <div class="space-y-2">
        <UCheckbox
          v-model="includeSelfAssessment"
          label="Include Self Assessments"
        />
        
        <UCheckbox
          v-model="includeManagerReview"
          label="Include Manager Reviews"
        />
        
        <UCheckbox
          v-model="includePeerReview"
          label="Include Peer Reviews"
          disabled
        />
        <p class="text-xs text-gray-500 ml-6">Peer reviews coming in future release</p>
      </div>
    </div>

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
        :disabled="!isValid"
      >
        {{ mode === 'create' ? 'Create Cycle' : 'Save Changes' }}
      </UButton>
    </div>
  </form>
</template>
