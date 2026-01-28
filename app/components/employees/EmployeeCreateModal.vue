<script setup lang="ts">
import type { EmployeeCreateRequest } from '~/types/employee'

interface Props {
  isOpen: boolean
  isSaving?: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  save: [data: EmployeeCreateRequest]
}>()

// Form data
const formData = ref<EmployeeCreateRequest>({
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  job_title: '',
  department_id: undefined,
  hire_date: new Date().toISOString().split('T')[0],
  employment_type: 'full-time',
  create_user_account: false,
  user_role: 'employee'
})

// Form validation - declare before watch
const errors = ref<Record<string, string>>({})

// Reset form when modal opens
watch(
  () => props.isOpen,
  (open) => {
    if (open) {
      formData.value = {
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        job_title: '',
        department_id: undefined,
        hire_date: new Date().toISOString().split('T')[0],
        employment_type: 'full-time',
        create_user_account: false,
        user_role: 'employee'
      }
      errors.value = {}
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
  
  if (!formData.value.hire_date) {
    errors.value.hire_date = 'Hire date is required'
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

const userRoleOptions = [
  { value: 'employee', label: 'Employee' },
  { value: 'manager', label: 'Manager' },
  { value: 'hr', label: 'HR' },
  { value: 'admin', label: 'Admin' }
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
        <div class="w-10 h-10 bg-primary-500/20 rounded-full flex items-center justify-center">
          <UIcon name="i-heroicons-user-plus" class="w-5 h-5 text-primary-400" />
        </div>
        <div>
          <h2 class="text-lg font-semibold text-white">Add New Employee</h2>
          <p class="text-sm text-gray-400">Create a new employee record</p>
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

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-1">
                  Hire Date <span class="text-red-400">*</span>
                </label>
                <UInput
                  v-model="formData.hire_date"
                  type="date"
                  :color="errors.hire_date ? 'error' : 'neutral'"
                />
                <p v-if="errors.hire_date" class="text-xs text-red-400 mt-1">
                  {{ errors.hire_date }}
                </p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-1">Employment Type</label>
                <USelectMenu
                  v-model="formData.employment_type"
                  :items="employmentTypeOptions"
                  value-key="value"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- User Account -->
        <div>
          <h3 class="text-sm font-medium text-gray-400 uppercase tracking-wider mb-4">
            User Account
          </h3>
          <div class="space-y-4">
            <div class="flex items-center gap-3">
              <UCheckbox
                v-model="formData.create_user_account"
                name="create_user_account"
              />
              <label class="text-sm text-gray-300">
                Create user account for this employee
              </label>
            </div>

            <div v-if="formData.create_user_account">
              <label class="block text-sm font-medium text-gray-300 mb-1">User Role</label>
              <USelectMenu
                v-model="formData.user_role"
                :items="userRoleOptions"
                value-key="value"
              />
              <p class="text-xs text-gray-500 mt-1">
                A temporary password will be generated and sent to the employee's email.
              </p>
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
          Create Employee
        </UButton>
      </div>
    </template>
  </USlideover>
</template>
