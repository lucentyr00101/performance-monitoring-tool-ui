<script setup lang="ts">
import type { Employee, EmployeeTeamMember } from '~/types/employee'

interface Props {
  employee: Employee
  directReports: EmployeeTeamMember[]
  isLoading?: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  viewEmployee: [id: string]
}>()
</script>

<template>
  <div class="bg-gray-900 border border-gray-800 rounded-lg p-5">
    <h3 class="text-lg font-semibold text-white mb-4 flex items-center gap-2">
      <UIcon name="i-heroicons-user-group" class="w-5 h-5 text-gray-400" />
      Reporting Structure
    </h3>

    <div class="space-y-6">
      <!-- Manager -->
      <div v-if="employee.manager">
        <label class="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
          Reports To
        </label>
        <button
          class="flex items-center gap-3 w-full p-3 bg-gray-800/50 border border-gray-700 rounded-lg hover:bg-gray-800 hover:border-gray-600 transition-colors text-left"
          @click="emit('viewEmployee', employee.manager.id)"
        >
          <UAvatar
            :alt="`${employee.manager.first_name} ${employee.manager.last_name}`"
            size="sm"
          />
          <div class="flex-1 min-w-0">
            <p class="font-medium text-white truncate">
              {{ employee.manager.first_name }} {{ employee.manager.last_name }}
            </p>
            <p class="text-sm text-gray-400 truncate">
              {{ employee.manager.job_title || 'Manager' }}
            </p>
          </div>
          <UIcon name="i-heroicons-chevron-right" class="w-5 h-5 text-gray-500" />
        </button>
      </div>

      <!-- Current Employee (Highlighted) -->
      <div>
        <label class="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
          {{ employee.manager ? '' : 'Current Employee' }}
        </label>
        <div class="flex items-center gap-3 p-3 bg-primary-500/10 border border-primary-500/30 rounded-lg">
          <div class="relative">
            <UAvatar
              :src="employee.avatar_url"
              :alt="`${employee.first_name} ${employee.last_name}`"
              size="sm"
            />
            <div class="absolute -bottom-1 -right-1 w-4 h-4 bg-primary-500 rounded-full flex items-center justify-center">
              <UIcon name="i-heroicons-user" class="w-2.5 h-2.5 text-white" />
            </div>
          </div>
          <div class="flex-1 min-w-0">
            <p class="font-medium text-primary-400 truncate">
              {{ employee.first_name }} {{ employee.last_name }}
              <span class="text-xs text-primary-400/60 ml-1">(You)</span>
            </p>
            <p class="text-sm text-gray-400 truncate">
              {{ employee.job_title || 'Employee' }}
            </p>
          </div>
        </div>
      </div>

      <!-- Direct Reports -->
      <div v-if="directReports.length > 0 || isLoading">
        <label class="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
          Direct Reports ({{ directReports.length }})
        </label>

        <!-- Loading -->
        <div v-if="isLoading" class="space-y-2">
          <div v-for="i in 3" :key="i" class="animate-pulse flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg">
            <div class="w-8 h-8 bg-gray-700 rounded-full" />
            <div class="flex-1">
              <div class="h-4 w-24 bg-gray-700 rounded mb-1" />
              <div class="h-3 w-20 bg-gray-700 rounded" />
            </div>
          </div>
        </div>

        <!-- Reports List -->
        <div v-else class="space-y-2">
          <button
            v-for="report in directReports"
            :key="report.id"
            class="flex items-center gap-3 w-full p-3 bg-gray-800/50 border border-gray-700 rounded-lg hover:bg-gray-800 hover:border-gray-600 transition-colors text-left"
            @click="emit('viewEmployee', report.id)"
          >
            <UAvatar
              :src="report.avatar_url"
              :alt="`${report.first_name} ${report.last_name}`"
              size="sm"
            />
            <div class="flex-1 min-w-0">
              <p class="font-medium text-white truncate">
                {{ report.first_name }} {{ report.last_name }}
              </p>
              <p class="text-sm text-gray-400 truncate">
                {{ report.job_title || 'Employee' }}
              </p>
            </div>
            <div class="flex items-center gap-2 text-xs">
              <span v-if="report.active_goals_count > 0" class="px-2 py-0.5 bg-primary-500/10 text-primary-400 rounded-full">
                {{ report.active_goals_count }} goals
              </span>
              <span v-if="report.pending_reviews_count > 0" class="px-2 py-0.5 bg-amber-500/10 text-amber-400 rounded-full">
                {{ report.pending_reviews_count }} pending
              </span>
            </div>
            <UIcon name="i-heroicons-chevron-right" class="w-5 h-5 text-gray-500 flex-shrink-0" />
          </button>
        </div>
      </div>

      <!-- No Direct Reports -->
      <div v-else-if="!isLoading && directReports.length === 0" class="text-center py-4">
        <p class="text-sm text-gray-500">No direct reports</p>
      </div>
    </div>
  </div>
</template>
