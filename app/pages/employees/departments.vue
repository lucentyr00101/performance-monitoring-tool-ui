<script setup lang="ts">
import type { DepartmentListItem, DepartmentCreateRequest, DepartmentUpdateRequest, DepartmentHierarchy } from '~/types/department'

definePageMeta({
  layout: 'default',
  middleware: ['auth']
})

const departmentStore = useDepartmentStore()
const employeeStore = useEmployeeStore()
const toast = useToast()
const { user } = useAuth()

// Check if user can manage departments
const canManage = computed(() => {
  const role = user.value?.role
  return role === 'admin' || role === 'hr'
})

// View mode: list or hierarchy
const viewMode = ref<'list' | 'hierarchy'>('list')

// Modal state
const isModalOpen = ref(false)
const isSaving = ref(false)
const selectedDepartment = ref<DepartmentListItem | null>(null)

// Confirmation dialog
const isDeleteDialogOpen = ref(false)
const departmentToDelete = ref<DepartmentListItem | null>(null)

// Fetch data on mount
onMounted(async () => {
  await Promise.all([
    departmentStore.fetchDepartments(),
    departmentStore.fetchHierarchy()
  ])
  
  // Load managers for the dropdown
  await employeeStore.fetchEmployees({ per_page: 100 })
})

// Get managers from employees
const managers = computed(() => {
  return employeeStore.employees
    .filter(e => e.employment_status === 'active')
    .map(e => ({
      id: e.id,
      first_name: e.first_name,
      last_name: e.last_name
    }))
})

// Handle create
function handleCreate() {
  selectedDepartment.value = null
  isModalOpen.value = true
}

// Handle edit
function handleEdit(department: DepartmentListItem) {
  selectedDepartment.value = department
  isModalOpen.value = true
}

// Handle view
function handleView(department: DepartmentListItem | DepartmentHierarchy) {
  // For now, just edit
  selectedDepartment.value = department as DepartmentListItem
  isModalOpen.value = true
}

// Handle delete confirmation
function handleDeleteRequest(department: DepartmentListItem) {
  departmentToDelete.value = department
  isDeleteDialogOpen.value = true
}

// Handle delete
async function handleDelete() {
  if (!departmentToDelete.value) return
  
  try {
    await departmentStore.deleteDepartment(departmentToDelete.value.id)
    toast.add({
      title: 'Department Deleted',
      description: `${departmentToDelete.value.name} has been deleted.`,
      color: 'success'
    })
    isDeleteDialogOpen.value = false
    departmentToDelete.value = null
  }
  catch (error: unknown) {
    const err = error as { error?: { message?: string } }
    toast.add({
      title: 'Delete Failed',
      description: err?.error?.message || 'Failed to delete department. Please try again.',
      color: 'error'
    })
  }
}

// Handle save
async function handleSave(data: DepartmentCreateRequest | DepartmentUpdateRequest) {
  isSaving.value = true
  
  try {
    if (selectedDepartment.value) {
      await departmentStore.updateDepartment(selectedDepartment.value.id, data as DepartmentUpdateRequest)
      toast.add({
        title: 'Department Updated',
        description: `${data.name} has been updated.`,
        color: 'success'
      })
    } else {
      await departmentStore.createDepartment(data as DepartmentCreateRequest)
      toast.add({
        title: 'Department Created',
        description: `${data.name} has been created.`,
        color: 'success'
      })
    }
    
    isModalOpen.value = false
    selectedDepartment.value = null
    
    // Refresh hierarchy
    await departmentStore.fetchHierarchy()
  }
  catch (error: unknown) {
    const err = error as { error?: { message?: string } }
    toast.add({
      title: selectedDepartment.value ? 'Update Failed' : 'Creation Failed',
      description: err?.error?.message || 'Please try again.',
      color: 'error'
    })
  }
  finally {
    isSaving.value = false
  }
}
</script>

<template>
  <div>
    <!-- Page Header -->
    <div class="mb-6">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <NuxtLink to="/employees">
            <UButton variant="ghost" color="neutral" size="sm">
              <UIcon name="i-heroicons-arrow-left" class="w-4 h-4 mr-1" />
              Back
            </UButton>
          </NuxtLink>
          <div>
            <h1 class="text-2xl font-bold text-white">Departments</h1>
            <p class="text-gray-400 mt-1">Manage organizational structure and departments</p>
          </div>
        </div>
        
        <!-- View Toggle -->
        <div class="flex items-center gap-2">
          <div class="flex items-center border border-gray-700 rounded-lg p-1">
            <button
              class="px-3 py-1.5 text-sm font-medium rounded-md transition-colors"
              :class="viewMode === 'list'
                ? 'bg-gray-700 text-white'
                : 'text-gray-400 hover:text-white'"
              @click="viewMode = 'list'"
            >
              <UIcon name="i-heroicons-squares-2x2" class="w-4 h-4" />
            </button>
            <button
              class="px-3 py-1.5 text-sm font-medium rounded-md transition-colors"
              :class="viewMode === 'hierarchy'
                ? 'bg-gray-700 text-white'
                : 'text-gray-400 hover:text-white'"
              @click="viewMode = 'hierarchy'"
            >
              <UIcon name="i-heroicons-rectangle-group" class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- List View -->
    <EmployeesDepartmentList
      v-if="viewMode === 'list'"
      :departments="departmentStore.departments"
      :is-loading="departmentStore.isLoading"
      :can-manage="canManage"
      @create="handleCreate"
      @edit="handleEdit"
      @delete="handleDeleteRequest"
      @view="handleView"
    />

    <!-- Hierarchy View -->
    <div v-else class="space-y-4">
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-medium text-white">Organization Hierarchy</h2>
        <UButton
          v-if="canManage"
          variant="solid"
          color="primary"
          @click="handleCreate"
        >
          <UIcon name="i-heroicons-plus" class="w-4 h-4 mr-1" />
          Add Department
        </UButton>
      </div>
      
      <EmployeesDepartmentHierarchy
        :hierarchy="departmentStore.hierarchy"
        :is-loading="departmentStore.isLoadingHierarchy"
        @select="handleView"
      />
    </div>

    <!-- Department Modal -->
    <EmployeesDepartmentModal
      :is-open="isModalOpen"
      :is-saving="isSaving"
      :department="selectedDepartment"
      :departments="departmentStore.departments"
      :managers="managers"
      @close="isModalOpen = false"
      @save="handleSave"
    />

    <!-- Delete Confirmation Dialog -->
    <UModal v-model:open="isDeleteDialogOpen">
      <template #content>
        <div class="p-6">
          <div class="flex items-start gap-4">
            <div class="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center flex-shrink-0">
              <UIcon name="i-heroicons-exclamation-triangle" class="w-6 h-6 text-red-400" />
            </div>
            <div>
              <h3 class="text-lg font-medium text-white">Delete Department</h3>
              <p class="text-gray-400 mt-2">
                Are you sure you want to delete <strong>{{ departmentToDelete?.name }}</strong>?
                This action cannot be undone.
              </p>
              <p v-if="departmentToDelete?.employee_count" class="text-amber-400 text-sm mt-2">
                ⚠️ This department has {{ departmentToDelete.employee_count }} employees.
                You must reassign them first.
              </p>
            </div>
          </div>
          
          <div class="flex justify-end gap-3 mt-6">
            <UButton
              variant="ghost"
              color="neutral"
              @click="isDeleteDialogOpen = false"
            >
              Cancel
            </UButton>
            <UButton
              variant="solid"
              color="error"
              :disabled="(departmentToDelete?.employee_count || 0) > 0"
              @click="handleDelete"
            >
              Delete
            </UButton>
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>
