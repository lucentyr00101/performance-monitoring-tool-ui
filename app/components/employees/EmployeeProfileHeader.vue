<script setup lang="ts">
import type { Employee } from '~/types/employee'

interface Props {
  employee: Employee
  canEdit: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  edit: []
  back: []
}>()

const statusColors: Record<string, string> = {
  active: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  inactive: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  on_leave: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  terminated: 'bg-red-500/10 text-red-400 border-red-500/20'
}

const statusLabels: Record<string, string> = {
  active: 'Active',
  inactive: 'Inactive',
  on_leave: 'On Leave',
  terminated: 'Terminated'
}

const employmentTypeLabels: Record<string, string> = {
  'full-time': 'Full-time',
  'part-time': 'Part-time',
  'contract': 'Contract'
}

const locationLabels: Record<string, string> = {
  remote: 'Remote',
  hybrid: 'Hybrid',
  office: 'Office'
}

const locationIcons: Record<string, string> = {
  remote: 'i-heroicons-home',
  hybrid: 'i-heroicons-arrows-right-left',
  office: 'i-heroicons-building-office-2'
}
</script>

<template>
  <div class="bg-gray-900 border border-gray-800 rounded-lg p-6">
    <div class="flex flex-col md:flex-row md:items-start gap-6">
      <!-- Back Button -->
      <button
        class="absolute top-4 left-4 md:static p-2 text-gray-400 hover:text-white transition-colors"
        @click="emit('back')"
      >
        <UIcon name="i-heroicons-arrow-left" class="w-5 h-5" />
      </button>

      <!-- Avatar -->
      <div class="flex-shrink-0 mx-auto md:mx-0">
        <UAvatar
          :src="employee.avatar_url"
          :alt="`${employee.first_name} ${employee.last_name}`"
          size="3xl"
          class="ring-4 ring-gray-800"
        />
      </div>

      <!-- Info -->
      <div class="flex-1 text-center md:text-left">
        <div class="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <h1 class="text-2xl font-bold text-white">
              {{ employee.first_name }} {{ employee.last_name }}
            </h1>
            <p class="text-lg text-gray-400 mt-1">
              {{ employee.job_title || 'No title' }}
            </p>
            <p class="text-gray-500 mt-0.5">
              {{ employee.department?.name || 'Unassigned' }}
            </p>
          </div>

          <!-- Edit Button -->
          <UButton
            v-if="canEdit"
            variant="outline"
            color="neutral"
            @click="emit('edit')"
          >
            <UIcon name="i-heroicons-pencil-square" class="w-4 h-4 mr-1" />
            Edit Profile
          </UButton>
        </div>

        <!-- Contact & Details -->
        <div class="flex flex-wrap items-center justify-center md:justify-start gap-x-6 gap-y-2 mt-4 text-sm">
          <div class="flex items-center gap-2 text-gray-400">
            <UIcon name="i-heroicons-envelope" class="w-4 h-4" />
            <a :href="`mailto:${employee.email}`" class="hover:text-primary-400 transition-colors">
              {{ employee.email }}
            </a>
          </div>
          <div v-if="employee.phone" class="flex items-center gap-2 text-gray-400">
            <UIcon name="i-heroicons-phone" class="w-4 h-4" />
            <a :href="`tel:${employee.phone}`" class="hover:text-primary-400 transition-colors">
              {{ employee.phone }}
            </a>
          </div>
          <div v-if="employee.work_location" class="flex items-center gap-2 text-gray-400">
            <UIcon :name="locationIcons[employee.work_location] || 'i-heroicons-map-pin'" class="w-4 h-4" />
            <span>{{ locationLabels[employee.work_location] || employee.work_location }}</span>
          </div>
        </div>

        <!-- Badges -->
        <div class="flex flex-wrap items-center justify-center md:justify-start gap-2 mt-4">
          <!-- Status -->
          <span
            class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border"
            :class="statusColors[employee.employment_status] || statusColors.active"
          >
            {{ statusLabels[employee.employment_status] || employee.employment_status }}
          </span>
          
          <!-- Employment Type -->
          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-800 text-gray-300 border border-gray-700">
            {{ employmentTypeLabels[employee.employment_type] || employee.employment_type }}
          </span>
          
          <!-- Employee Code -->
          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-800 text-gray-400 border border-gray-700">
            {{ employee.employee_code }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
