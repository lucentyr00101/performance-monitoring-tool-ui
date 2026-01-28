<script setup lang="ts">
import type { Department, DepartmentListItem, DepartmentCreateRequest, DepartmentUpdateRequest } from '~/types/department'

interface Props {
  isOpen: boolean
  isSaving?: boolean
  department?: Department | DepartmentListItem | null
  departments: DepartmentListItem[]
  managers: Array<{ id: string; first_name: string; last_name: string }>
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  save: [data: DepartmentCreateRequest | DepartmentUpdateRequest]
}>()

const isEditMode = computed(() => !!props.department)

// Form data
const formData = ref<DepartmentCreateRequest>({
  name: '',
  description: '',
  parent_id: undefined,
  manager_id: undefined
})

// Form validation
const errors = ref<Record<string, string>>({})

// Reset form when modal opens or department changes
watch(
  () => props.isOpen,
  (open) => {
    if (open) {
      if (props.department) {
        formData.value = {
          name: props.department.name,
          description: props.department.description || '',
          parent_id: props.department.parent?.id,
          manager_id: props.department.manager?.id
        }
      } else {
        formData.value = {
          name: '',
          description: '',
          parent_id: undefined,
          manager_id: undefined
        }
      }
      errors.value = {}
    }
  }
)

// Parent department options (exclude self and children)
const parentOptions = computed(() => {
  if (!props.department) {
    return props.departments.map(d => ({ value: d.id, label: d.name }))
  }
  
  // Exclude self and any department that has this as parent (direct children)
  const selfId = props.department.id
  return props.departments
    .filter(d => d.id !== selfId && d.parent?.id !== selfId)
    .map(d => ({ value: d.id, label: d.name }))
})

// Manager options
const managerOptions = computed(() => {
  return props.managers.map(m => ({
    value: m.id,
    label: `${m.first_name} ${m.last_name}`
  }))
})

function validateForm(): boolean {
  errors.value = {}
  
  if (!formData.value.name?.trim()) {
    errors.value.name = 'Department name is required'
  } else if (formData.value.name.length < 2) {
    errors.value.name = 'Department name must be at least 2 characters'
  }
  
  return Object.keys(errors.value).length === 0
}

function handleSubmit() {
  if (!validateForm()) return
  emit('save', formData.value)
}

function handleClose() {
  errors.value = {}
  emit('close')
}
</script>

<template>
  <USlideover
    :open="isOpen"
    side="right"
    @close="handleClose"
  >
    <template #header>
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 bg-primary-500/20 rounded-full flex items-center justify-center">
          <UIcon name="i-heroicons-building-office-2" class="w-5 h-5 text-primary-400" />
        </div>
        <div>
          <h2 class="text-lg font-semibold text-white">
            {{ isEditMode ? 'Edit Department' : 'Add Department' }}
          </h2>
          <p class="text-sm text-gray-400">
            {{ isEditMode ? `Update ${department?.name}` : 'Create a new department' }}
          </p>
        </div>
      </div>
    </template>

    <template #body>
      <form class="space-y-6" @submit.prevent="handleSubmit">
        <!-- Basic Information -->
        <div>
          <h3 class="text-sm font-medium text-gray-400 uppercase tracking-wider mb-4">
            Basic Information
          </h3>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-1">
                Department Name <span class="text-red-400">*</span>
              </label>
              <UInput
                v-model="formData.name"
                placeholder="e.g., Engineering, Marketing"
                :color="errors.name ? 'error' : 'neutral'"
              />
              <p v-if="errors.name" class="text-xs text-red-400 mt-1">
                {{ errors.name }}
              </p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-300 mb-1">Description</label>
              <UTextarea
                v-model="formData.description"
                placeholder="Brief description of the department's responsibilities..."
                :rows="3"
              />
            </div>
          </div>
        </div>

        <!-- Structure -->
        <div>
          <h3 class="text-sm font-medium text-gray-400 uppercase tracking-wider mb-4">
            Structure
          </h3>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-1">Parent Department</label>
              <USelectMenu
                v-model="formData.parent_id"
                :items="[{ value: undefined, label: 'None (Top Level)' }, ...parentOptions]"
                placeholder="Select parent department"
                value-key="value"
              />
              <p class="text-xs text-gray-500 mt-1">
                Leave empty for a top-level department
              </p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-300 mb-1">Department Head</label>
              <USelectMenu
                v-model="formData.manager_id"
                :items="[{ value: undefined, label: 'No manager assigned' }, ...managerOptions]"
                placeholder="Select department head"
                value-key="value"
              />
            </div>
          </div>
        </div>
      </form>
    </template>

    <template #footer>
      <div class="flex justify-end gap-3">
        <UButton
          variant="ghost"
          color="neutral"
          :disabled="isSaving"
          @click="handleClose"
        >
          Cancel
        </UButton>
        <UButton
          variant="solid"
          color="primary"
          :loading="isSaving"
          @click="handleSubmit"
        >
          {{ isEditMode ? 'Save Changes' : 'Create Department' }}
        </UButton>
      </div>
    </template>
  </USlideover>
</template>
