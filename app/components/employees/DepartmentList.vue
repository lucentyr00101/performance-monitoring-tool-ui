<script setup lang="ts">
import type { DepartmentListItem } from '~/types/department'

interface Props {
  departments: DepartmentListItem[]
  isLoading?: boolean
  canManage?: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  create: []
  edit: [department: DepartmentListItem]
  delete: [department: DepartmentListItem]
  view: [department: DepartmentListItem]
}>()

// Search
const searchQuery = ref('')

const filteredDepartments = computed(() => {
  if (!searchQuery.value) return props.departments
  
  const query = searchQuery.value.toLowerCase()
  return props.departments.filter(d => 
    d.name.toLowerCase().includes(query) ||
    d.description?.toLowerCase().includes(query)
  )
})
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between gap-4">
      <div class="flex-1 max-w-md">
        <UInput
          v-model="searchQuery"
          placeholder="Search departments..."
          icon="i-heroicons-magnifying-glass"
        />
      </div>
      
      <UButton
        v-if="canManage"
        variant="solid"
        color="primary"
        @click="emit('create')"
      >
        <UIcon name="i-heroicons-plus" class="w-4 h-4 mr-1" />
        Add Department
      </UButton>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div 
        v-for="i in 6" 
        :key="i" 
        class="animate-pulse bg-gray-900 border border-gray-800 rounded-lg p-4"
      >
        <div class="h-5 w-32 bg-gray-800 rounded mb-2" />
        <div class="h-4 w-full bg-gray-800 rounded mb-3" />
        <div class="flex items-center gap-4">
          <div class="h-4 w-20 bg-gray-800 rounded" />
          <div class="h-4 w-24 bg-gray-800 rounded" />
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="filteredDepartments.length === 0" class="text-center py-12 bg-gray-900 border border-gray-800 rounded-lg">
      <UIcon name="i-heroicons-building-office-2" class="w-12 h-12 text-gray-700 mx-auto mb-3" />
      <h3 class="text-lg font-medium text-white mb-2">
        {{ searchQuery ? 'No departments found' : 'No departments yet' }}
      </h3>
      <p class="text-gray-500 mb-4">
        {{ searchQuery ? 'Try adjusting your search query' : 'Create your first department to get started' }}
      </p>
      <UButton
        v-if="!searchQuery && canManage"
        variant="solid"
        color="primary"
        @click="emit('create')"
      >
        <UIcon name="i-heroicons-plus" class="w-4 h-4 mr-1" />
        Add Department
      </UButton>
    </div>

    <!-- Departments Grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <EmployeesDepartmentCard
        v-for="department in filteredDepartments"
        :key="department.id"
        :department="department"
        @click="emit('view', department)"
        @edit="emit('edit', department)"
        @delete="emit('delete', department)"
      />
    </div>

    <!-- Stats Summary -->
    <div v-if="!isLoading && departments.length > 0" class="flex items-center gap-6 text-sm text-gray-400">
      <div class="flex items-center gap-2">
        <UIcon name="i-heroicons-building-office-2" class="w-4 h-4" />
        <span>{{ departments.length }} departments</span>
      </div>
      <div class="flex items-center gap-2">
        <UIcon name="i-heroicons-users" class="w-4 h-4" />
        <span>{{ departments.reduce((sum, d) => sum + (d.employee_count || 0), 0) }} total employees</span>
      </div>
    </div>
  </div>
</template>
