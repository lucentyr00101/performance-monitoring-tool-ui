<script setup lang="ts">
import type { Employee, EmployeeListItem } from '~/types/employee'
import type { ReviewFormListItem } from '~/types/review-form'

const props = defineProps<{
  isOpen: boolean
  employee?: Employee | EmployeeListItem | null
}>()

const emit = defineEmits<{
  close: []
  triggered: [{ reviewId: string; employeeName: string }]
}>()

const adhocReviewsStore = useAdhocReviewsStore()
const reviewFormsStore = useReviewFormsStore()
const employeeStore = useEmployeeStore()

// Form state
const selectedEmployeeId = ref<string>('')
const selectedFormId = ref<string | undefined>(undefined)
const dueDate = ref<string>('')
const reason = ref<string>('')
const isSubmitting = ref(false)

// Available data
const employees = ref<EmployeeListItem[]>([])
const forms = ref<ReviewFormListItem[]>([])
const isLoadingEmployees = ref(false)
const isLoadingForms = ref(false)

// Set default due date (14 days from now)
function getDefaultDueDate(): string {
  const date = new Date()
  date.setDate(date.getDate() + 14)
  return date.toISOString().split('T')[0]!
}

// Selected employee details
const selectedEmployee = computed(() => {
  if (props.employee) return props.employee
  return employees.value.find(e => e.id === selectedEmployeeId.value)
})

// Selected form (auto-selected based on department or manual override)
const selectedForm = computed(() => {
  if (selectedFormId.value) {
    return forms.value.find(f => f.id === selectedFormId.value)
  }
  // Auto-select based on department
  const deptId = selectedEmployee.value?.department?.id
  if (deptId) {
    const deptForm = forms.value.find(f => 
      f.assignedDepartments.some(d => d.id === deptId)
    )
    if (deptForm) return deptForm
  }
  // Fallback to default
  return forms.value.find(f => f.isDefault)
})

// Manager info (from employee data)
const managerInfo = computed(() => {
  const emp = selectedEmployee.value as Employee | undefined
  if (emp?.manager) {
    return `${emp.manager.firstName} ${emp.manager.lastName}`
  }
  return 'Direct Manager'
})

// Form validity
const isFormValid = computed(() => {
  return (props.employee || selectedEmployeeId.value) && dueDate.value
})

// Load data on mount
async function loadData() {
  // Load employees if not pre-selected
  if (!props.employee) {
    isLoadingEmployees.value = true
    try {
      await employeeStore.fetchEmployees({ perPage: 100 })
      employees.value = employeeStore.employees
    } catch {
      // Handle error
    } finally {
      isLoadingEmployees.value = false
    }
  }

  // Load published forms
  isLoadingForms.value = true
  try {
    await reviewFormsStore.fetchForms({ status: 'published', perPage: 50 })
    forms.value = reviewFormsStore.publishedForms
  } catch {
    // Handle error
  } finally {
    isLoadingForms.value = false
  }
}

// Reset form
function resetForm() {
  selectedEmployeeId.value = ''
  selectedFormId.value = undefined
  dueDate.value = getDefaultDueDate()
  reason.value = ''
  isSubmitting.value = false
}

// Handle submit
async function handleSubmit() {
  if (!isFormValid.value) return

  isSubmitting.value = true
  try {
    const employeeId = props.employee?.id || selectedEmployeeId.value
    const result = await adhocReviewsStore.triggerAdhocReview({
      employeeId: employeeId,
      dueDate: dueDate.value,
      reason: reason.value || undefined,
      reviewFormId: selectedFormId.value
    })

    const empName = selectedEmployee.value 
      ? `${selectedEmployee.value.firstName} ${selectedEmployee.value.lastName}`
      : 'Employee'

    emit('triggered', { reviewId: result.id, employeeName: empName })
    emit('close')
    resetForm()
  } catch {
    // Notification handled by store
  } finally {
    isSubmitting.value = false
  }
}

// Handle close
function handleClose() {
  resetForm()
  emit('close')
}

// Watch for modal open
watch(() => props.isOpen, (open) => {
  if (open) {
    dueDate.value = getDefaultDueDate()
    loadData()
  }
})

// Employee options for select
const employeeOptions = computed(() => 
  employees.value.map(e => ({
    label: `${e.firstName} ${e.lastName}`,
    value: e.id,
    description: e.jobTitle || e.department?.name
  }))
)

// Form options for select
const formOptions = computed(() => 
  forms.value.map(f => ({
    label: f.name,
    value: f.id,
    description: f.isDefault ? 'Company Default' : `${f.assignedDepartments.length} departments`
  }))
)
</script>

<template>
  <UModal
    :open="isOpen"
    @close="handleClose"
  >
    <template #header>
      <div class="flex items-center gap-3">
        <div class="p-2 bg-primary-500/20 rounded-lg">
          <UIcon name="i-heroicons-clipboard-document-check" class="w-5 h-5 text-primary-400" />
        </div>
        <div>
          <h3 class="text-lg font-semibold text-white">Trigger Performance Review</h3>
          <p class="text-sm text-gray-400">Initiate an ad-hoc review for an employee</p>
        </div>
      </div>
    </template>

    <template #body>
      <div class="space-y-6">
        <!-- Employee Selection (if not pre-selected) -->
        <div v-if="!employee">
          <label class="block text-sm font-medium text-gray-300 mb-2">
            Employee <span class="text-red-400">*</span>
          </label>
          <USelectMenu
            v-model="selectedEmployeeId"
            :items="employeeOptions"
            placeholder="Select an employee..."
            :search-input="true"
            :loading="isLoadingEmployees"
            value-key="value"
          >
            <template #item="{ item }">
              <div>
                <div class="font-medium">{{ item.label }}</div>
                <div v-if="item.description" class="text-xs text-gray-400">
                  {{ item.description }}
                </div>
              </div>
            </template>
          </USelectMenu>
        </div>

        <!-- Employee Info (if pre-selected) -->
        <div v-else class="bg-gray-800/50 rounded-lg p-4">
          <label class="block text-sm font-medium text-gray-400 mb-2">Employee</label>
          <div class="flex items-center gap-3">
            <UAvatar
              :alt="`${employee.firstName} ${employee.lastName}`"
              size="md"
            />
            <div>
              <div class="font-medium text-white">
                {{ employee.firstName }} {{ employee.lastName }}
              </div>
              <div class="text-sm text-gray-400">
                {{ employee.jobTitle }} • {{ employee.department?.name }}
              </div>
            </div>
          </div>
        </div>

        <!-- Review Form Selection -->
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">
            Review Form
          </label>
          <USelectMenu
            v-model="selectedFormId"
            :items="formOptions"
            placeholder="Auto-select based on department"
            :loading="isLoadingForms"
            value-key="value"
          >
            <template #item="{ item }">
              <div>
                <div class="font-medium">{{ item.label }}</div>
                <div class="text-xs text-gray-400">{{ item.description }}</div>
              </div>
            </template>
          </USelectMenu>
          <p v-if="selectedForm && !selectedFormId" class="mt-1 text-xs text-gray-400">
            <UIcon name="i-heroicons-information-circle" class="w-3 h-3 inline" />
            Auto-selected: {{ selectedForm.name }}
          </p>
        </div>

        <!-- Due Date -->
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">
            Due Date <span class="text-red-400">*</span>
          </label>
          <UInput
            v-model="dueDate"
            type="date"
            :min="new Date().toISOString().split('T')[0]"
            class="w-full"
          />
        </div>

        <!-- Reason -->
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">
            Reason for Review
          </label>
          <UTextarea
            v-model="reason"
            placeholder="e.g., Mid-project performance check-in, End of probation review..."
            :rows="3"
            :maxlength="500"
          />
          <p class="mt-1 text-xs text-gray-500 text-right">
            {{ reason.length }}/500
          </p>
        </div>

        <!-- Summary -->
        <div class="bg-gray-800/50 rounded-lg p-4 space-y-2">
          <h4 class="text-sm font-medium text-gray-300">Review will include:</h4>
          <div class="flex items-center gap-2 text-sm text-gray-400">
            <UIcon name="i-heroicons-check-circle" class="w-4 h-4 text-green-400" />
            <span>Self-assessment by {{ selectedEmployee ? `${selectedEmployee.firstName} ${selectedEmployee.lastName}` : 'Employee' }}</span>
          </div>
          <div class="flex items-center gap-2 text-sm text-gray-400">
            <UIcon name="i-heroicons-check-circle" class="w-4 h-4 text-green-400" />
            <span>Manager evaluation by {{ managerInfo }}</span>
          </div>
        </div>
      </div>
    </template>

    <template #footer>
      <div class="flex justify-end gap-3">
        <UButton
          variant="ghost"
          color="neutral"
          @click="handleClose"
        >
          Cancel
        </UButton>
        <UButton
          color="primary"
          :disabled="!isFormValid"
          :loading="isSubmitting"
          @click="handleSubmit"
        >
          Trigger Review
        </UButton>
      </div>
    </template>
  </UModal>
</template>
