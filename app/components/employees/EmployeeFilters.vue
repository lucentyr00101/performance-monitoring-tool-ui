<script setup lang="ts">
import type { EmployeeFilters, EmploymentStatus, EmploymentType, WorkLocation } from '~/types/employee'
import type { DepartmentListItem } from '~/types/department'

interface Props {
  filters: EmployeeFilters
  departments: DepartmentListItem[]
  managers: { id: string; name: string }[]
  isLoading?: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:filters': [filters: EmployeeFilters]
  apply: []
  clear: []
}>()

// Local filter state
const localFilters = ref<EmployeeFilters>({ ...props.filters })

// Watch for external filter changes
watch(() => props.filters, (newFilters) => {
  localFilters.value = { ...newFilters }
}, { deep: true })

// Filter options
const statusOptions = [
  { label: 'All Statuses', value: '' },
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
  { label: 'On Leave', value: 'on_leave' }
]

const employmentTypeOptions = [
  { label: 'All Types', value: '' },
  { label: 'Full-time', value: 'full-time' },
  { label: 'Part-time', value: 'part-time' },
  { label: 'Contract', value: 'contract' }
]

const workLocationOptions = [
  { label: 'All Locations', value: '' },
  { label: 'Remote', value: 'remote' },
  { label: 'Hybrid', value: 'hybrid' },
  { label: 'Office', value: 'office' }
]

const roleOptions = [
  { label: 'All Roles', value: '' },
  { label: 'Admin', value: 'admin' },
  { label: 'HR', value: 'hr' },
  { label: 'Manager', value: 'manager' },
  { label: 'Employee', value: 'employee' },
  { label: 'C-Suite', value: 'csuite' }
]

// Department options
const departmentOptions = computed(() => [
  { label: 'All Departments', value: '' },
  ...props.departments.map(d => ({ label: d.name, value: d.id }))
])

// Manager options
const managerOptions = computed(() => [
  { label: 'All Managers', value: '' },
  ...props.managers.map(m => ({ label: m.name, value: m.id }))
])

// Active filter count
const activeFilterCount = computed(() => {
  return Object.values(localFilters.value).filter(v => v !== undefined && v !== '').length
})

// Update filter value
function updateFilter(key: keyof EmployeeFilters, value: string | undefined) {
  (localFilters.value as Record<string, string | undefined>)[key] = value || undefined
  emit('update:filters', { ...localFilters.value })
}

// Apply filters
function applyFilters() {
  emit('update:filters', { ...localFilters.value })
  emit('apply')
}

// Clear all filters
function clearFilters() {
  localFilters.value = {}
  emit('update:filters', {})
  emit('clear')
}
</script>

<template>
  <div class="bg-gray-900 border border-gray-800 rounded-lg p-4">
    <div class="flex items-center justify-between mb-4">
      <h3 class="font-medium text-white flex items-center gap-2">
        <UIcon name="i-heroicons-funnel" class="w-4 h-4" />
        Filters
        <span
          v-if="activeFilterCount > 0"
          class="inline-flex items-center justify-center w-5 h-5 text-xs font-medium bg-primary-500 text-white rounded-full"
        >
          {{ activeFilterCount }}
        </span>
      </h3>
      <UButton
        v-if="activeFilterCount > 0"
        variant="ghost"
        color="neutral"
        size="xs"
        @click="clearFilters"
      >
        Clear all
      </UButton>
    </div>

    <div class="space-y-4">
      <!-- Status -->
      <div>
        <label class="block text-sm font-medium text-gray-400 mb-1.5">Status</label>
        <USelectMenu
          :model-value="statusOptions.find(o => o.value === localFilters.employment_status)"
          :items="statusOptions"
          value-attribute="value"
          placeholder="All Statuses"
          class="w-full"
          @update:model-value="updateFilter('employment_status', ($event as { value: string })?.value as EmploymentStatus)"
        />
      </div>

      <!-- Department -->
      <div>
        <label class="block text-sm font-medium text-gray-400 mb-1.5">Department</label>
        <USelectMenu
          :model-value="departmentOptions.find(o => o.value === localFilters.department_id)"
          :items="departmentOptions"
          value-attribute="value"
          placeholder="All Departments"
          class="w-full"
          @update:model-value="updateFilter('department_id', ($event as { value: string })?.value)"
        />
      </div>

      <!-- Manager -->
      <div>
        <label class="block text-sm font-medium text-gray-400 mb-1.5">Manager</label>
        <USelectMenu
          :model-value="managerOptions.find(o => o.value === localFilters.manager_id)"
          :items="managerOptions"
          value-attribute="value"
          placeholder="All Managers"
          class="w-full"
          @update:model-value="updateFilter('manager_id', ($event as { value: string })?.value)"
        />
      </div>

      <!-- Employment Type -->
      <div>
        <label class="block text-sm font-medium text-gray-400 mb-1.5">Employment Type</label>
        <USelectMenu
          :model-value="employmentTypeOptions.find(o => o.value === localFilters.employment_type)"
          :items="employmentTypeOptions"
          value-attribute="value"
          placeholder="All Types"
          class="w-full"
          @update:model-value="updateFilter('employment_type', ($event as { value: string })?.value as EmploymentType)"
        />
      </div>

      <!-- Work Location -->
      <div>
        <label class="block text-sm font-medium text-gray-400 mb-1.5">Work Location</label>
        <USelectMenu
          :model-value="workLocationOptions.find(o => o.value === localFilters.work_location)"
          :items="workLocationOptions"
          value-attribute="value"
          placeholder="All Locations"
          class="w-full"
          @update:model-value="updateFilter('work_location', ($event as { value: string })?.value as WorkLocation)"
        />
      </div>

      <!-- Role -->
      <div>
        <label class="block text-sm font-medium text-gray-400 mb-1.5">Role</label>
        <USelectMenu
          :model-value="roleOptions.find(o => o.value === localFilters.role)"
          :items="roleOptions"
          value-attribute="value"
          placeholder="All Roles"
          class="w-full"
          @update:model-value="updateFilter('role', ($event as { value: string })?.value)"
        />
      </div>

      <!-- Apply Button -->
      <UButton
        color="primary"
        class="w-full"
        :loading="isLoading"
        @click="applyFilters"
      >
        Apply Filters
      </UButton>
    </div>
  </div>
</template>
