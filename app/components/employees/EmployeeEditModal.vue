<script setup lang="ts">
import type { Employee, EmployeeUpdateRequest } from '~/types/employee'

interface Props {
  employee: Employee
  isOpen: boolean
  isSaving?: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  save: [data: EmployeeUpdateRequest]
}>()

// Form data - reactive copy of employee
const formData = ref<EmployeeUpdateRequest>({})

// Reset form when modal opens or employee changes
watch(
  () => props.employee,
  (employee) => {
    if (employee) {
      formData.value = {
        first_name: employee.first_name,
        last_name: employee.last_name,
        email: employee.email,
        phone: employee.phone || '',
        job_title: employee.job_title || '',
        department_id: employee.department_id,
        work_location: employee.work_location,
        employment_type: employee.employment_type,
        employment_status: employee.employment_status,
        career_level: employee.career_level || ''
      }
    }
  },
  { immediate: true }
)

// Watch isOpen to reset form
watch(
  () => props.isOpen,
  (open) => {
    if (open && props.employee) {
      formData.value = {
        first_name: props.employee.first_name,
        last_name: props.employee.last_name,
        email: props.employee.email,
        phone: props.employee.phone || '',
        job_title: props.employee.job_title || '',
        department_id: props.employee.department_id,
        work_location: props.employee.work_location,
        employment_type: props.employee.employment_type,
        employment_status: props.employee.employment_status,
        career_level: props.employee.career_level || ''
      }
    }
  }
)

// Department store for dropdown
const departmentStore = useDepartmentStore()

// Load departments for dropdown
onMounted(() => {
  if (departmentStore.departments.length === 0) {
    departmentStore.fetchDepartments()
  }
})

// Form validation
const errors = ref<Record<string, string>>({})

function validateForm(): boolean {
  errors.value = {}
  
  if (!formData.value.first_name?.trim()) {
    errors.value.first_name = 'First name is required'
  }
  
  if (!formData.value.last_name?.trim()) {
    errors.value.last_name = 'Last name is required'
  }
  
  if (!formData.value.email?.trim()) {
    errors.value.email = 'Email is required'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.value.email)) {
    errors.value.email = 'Invalid email format'
  }
  
  if (formData.value.phone && !/^[\d\s\-+()]*$/.test(formData.value.phone)) {
    errors.value.phone = 'Invalid phone number format'
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

// Options
const employmentTypeOptions = [
  { value: 'full-time', label: 'Full-time' },
  { value: 'part-time', label: 'Part-time' },
  { value: 'contract', label: 'Contract' }
]

const employmentStatusOptions = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'on_leave', label: 'On Leave' },
  { value: 'terminated', label: 'Terminated' }
]

const workLocationOptions = [
  { value: 'remote', label: 'Remote' },
  { value: 'hybrid', label: 'Hybrid' },
  { value: 'office', label: 'Office' }
]
</script>

<template>
  <USlideover
    :open="isOpen"
    side="right"
    @close="handleClose"
  >
    <template #header>
      <div class="flex items-center gap-3">
        <UAvatar
          :src="employee.avatar_url"
          :alt="`${employee.first_name} ${employee.last_name}`"
          size="sm"
        />
        <div>
          <h2 class="text-lg font-semibold text-white">Edit Employee</h2>
          <p class="text-sm text-gray-400">{{ employee.first_name }} {{ employee.last_name }}</p>
        </div>
      </div>
    </template>

    <template #body>
      <form class="space-y-6" @submit.prevent="handleSubmit">
        <!-- Personal Information -->
        <div>
          <h3 class="text-sm font-medium text-gray-400 uppercase tracking-wider mb-4">
            Personal Information
          </h3>
          <div class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-1">
                  First Name <span class="text-red-400">*</span>
                </label>
                <UInput
                  v-model="formData.first_name"
                  placeholder="First name"
                  :color="errors.first_name ? 'error' : 'neutral'"
                />
                <p v-if="errors.first_name" class="text-xs text-red-400 mt-1">
                  {{ errors.first_name }}
                </p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-1">
                  Last Name <span class="text-red-400">*</span>
                </label>
                <UInput
                  v-model="formData.last_name"
                  placeholder="Last name"
                  :color="errors.last_name ? 'error' : 'neutral'"
                />
                <p v-if="errors.last_name" class="text-xs text-red-400 mt-1">
                  {{ errors.last_name }}
                </p>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-300 mb-1">
                Email <span class="text-red-400">*</span>
              </label>
              <UInput
                v-model="formData.email"
                type="email"
                placeholder="email@example.com"
                :color="errors.email ? 'error' : 'neutral'"
              />
              <p v-if="errors.email" class="text-xs text-red-400 mt-1">
                {{ errors.email }}
              </p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-300 mb-1">Phone</label>
              <UInput
                v-model="formData.phone"
                type="tel"
                placeholder="+1 (555) 000-0000"
                :color="errors.phone ? 'error' : 'neutral'"
              />
              <p v-if="errors.phone" class="text-xs text-red-400 mt-1">
                {{ errors.phone }}
              </p>
            </div>
          </div>
        </div>

        <!-- Professional Information -->
        <div>
          <h3 class="text-sm font-medium text-gray-400 uppercase tracking-wider mb-4">
            Professional Information
          </h3>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-1">Job Title</label>
              <UInput
                v-model="formData.job_title"
                placeholder="e.g., Senior Developer"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-300 mb-1">Department</label>
              <USelectMenu
                v-model="formData.department_id"
                :items="departmentStore.departments.map(d => ({ value: d.id, label: d.name }))"
                placeholder="Select department"
                value-key="value"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-300 mb-1">Career Level</label>
              <UInput
                v-model="formData.career_level"
                placeholder="e.g., Senior, Lead, Director"
              />
            </div>
          </div>
        </div>

        <!-- Employment Details -->
        <div>
          <h3 class="text-sm font-medium text-gray-400 uppercase tracking-wider mb-4">
            Employment Details
          </h3>
          <div class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-1">Employment Type</label>
                <USelectMenu
                  v-model="formData.employment_type"
                  :items="employmentTypeOptions"
                  value-key="value"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-1">Status</label>
                <USelectMenu
                  v-model="formData.employment_status"
                  :items="employmentStatusOptions"
                  value-key="value"
                />
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-300 mb-1">Work Location</label>
              <USelectMenu
                v-model="formData.work_location"
                :items="workLocationOptions"
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
          Save Changes
        </UButton>
      </div>
    </template>
  </USlideover>
</template>
