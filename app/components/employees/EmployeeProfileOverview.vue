<script setup lang="ts">
import type { Employee } from '~/types/employee'

interface Props {
  employee: Employee
}

defineProps<Props>()

function formatDate(dateStr?: string): string {
  if (!dateStr) return 'Not set'
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

function calculateTenure(hireDate?: string): string {
  if (!hireDate) return 'Unknown'
  const hire = new Date(hireDate)
  const now = new Date()
  const years = now.getFullYear() - hire.getFullYear()
  const months = now.getMonth() - hire.getMonth()
  
  if (years > 0) {
    return `${years} year${years > 1 ? 's' : ''}${months > 0 ? `, ${months} month${months > 1 ? 's' : ''}` : ''}`
  }
  return `${months} month${months !== 1 ? 's' : ''}`
}
</script>

<template>
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <!-- Personal Information -->
    <div class="bg-gray-900 border border-gray-800 rounded-lg p-5">
      <h3 class="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <UIcon name="i-heroicons-user" class="w-5 h-5 text-gray-400" />
        Personal Information
      </h3>
      
      <div class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-medium text-gray-500 uppercase tracking-wider">First Name</label>
            <p class="mt-1 text-white">{{ employee.first_name }}</p>
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-500 uppercase tracking-wider">Last Name</label>
            <p class="mt-1 text-white">{{ employee.last_name }}</p>
          </div>
        </div>
        
        <div>
          <label class="block text-xs font-medium text-gray-500 uppercase tracking-wider">Email</label>
          <p class="mt-1 text-white">{{ employee.email }}</p>
        </div>
        
        <div>
          <label class="block text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</label>
          <p class="mt-1 text-white">{{ employee.phone || 'Not provided' }}</p>
        </div>
        
        <div>
          <label class="block text-xs font-medium text-gray-500 uppercase tracking-wider">Employee ID</label>
          <p class="mt-1 text-white font-mono">{{ employee.employee_code }}</p>
        </div>
      </div>
    </div>

    <!-- Professional Information -->
    <div class="bg-gray-900 border border-gray-800 rounded-lg p-5">
      <h3 class="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <UIcon name="i-heroicons-briefcase" class="w-5 h-5 text-gray-400" />
        Professional Information
      </h3>
      
      <div class="space-y-4">
        <div>
          <label class="block text-xs font-medium text-gray-500 uppercase tracking-wider">Job Title</label>
          <p class="mt-1 text-white">{{ employee.job_title || 'Not set' }}</p>
        </div>
        
        <div>
          <label class="block text-xs font-medium text-gray-500 uppercase tracking-wider">Department</label>
          <p class="mt-1 text-white">{{ employee.department?.name || 'Unassigned' }}</p>
        </div>
        
        <div>
          <label class="block text-xs font-medium text-gray-500 uppercase tracking-wider">Manager</label>
          <div v-if="employee.manager" class="mt-1 flex items-center gap-2">
            <UAvatar
              :alt="`${employee.manager.first_name} ${employee.manager.last_name}`"
              size="xs"
            />
            <NuxtLink
              :to="`/employees/${employee.manager.id}`"
              class="text-primary-400 hover:text-primary-300 transition-colors"
            >
              {{ employee.manager.first_name }} {{ employee.manager.last_name }}
            </NuxtLink>
          </div>
          <p v-else class="mt-1 text-gray-400">No manager assigned</p>
        </div>
        
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-medium text-gray-500 uppercase tracking-wider">Join Date</label>
            <p class="mt-1 text-white">{{ formatDate(employee.hire_date) }}</p>
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-500 uppercase tracking-wider">Tenure</label>
            <p class="mt-1 text-white">{{ calculateTenure(employee.hire_date) }}</p>
          </div>
        </div>
        
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-medium text-gray-500 uppercase tracking-wider">Employment Type</label>
            <p class="mt-1 text-white capitalize">{{ employee.employment_type?.replace('-', ' ') || 'Not set' }}</p>
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-500 uppercase tracking-wider">Work Location</label>
            <p class="mt-1 text-white capitalize">{{ employee.work_location || 'Not set' }}</p>
          </div>
        </div>
        
        <div v-if="employee.career_level">
          <label class="block text-xs font-medium text-gray-500 uppercase tracking-wider">Career Level</label>
          <p class="mt-1 text-white">{{ employee.career_level }}</p>
        </div>
      </div>
    </div>
  </div>
</template>
