<script setup lang="ts">
import type { Employee, EmployeeGoalSummary, EmployeeReviewSummary, EmployeeTeamMember } from '~/types/employee'

interface Props {
  employee: Employee
  goals: EmployeeGoalSummary[]
  reviews: EmployeeReviewSummary[]
  directReports: EmployeeTeamMember[]
  isLoading?: boolean
  isLoadingGoals?: boolean
  isLoadingReviews?: boolean
  isLoadingTeam?: boolean
  canEdit?: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  edit: []
  viewEmployee: [id: string]
  back: []
}>()
</script>

<template>
  <div class="space-y-6">
    <!-- Back Button -->
    <button
      class="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
      @click="emit('back')"
    >
      <UIcon name="i-heroicons-arrow-left" class="w-5 h-5" />
      <span class="text-sm font-medium">Back to Directory</span>
    </button>

    <!-- Loading State -->
    <div v-if="isLoading" class="space-y-6">
      <!-- Header Skeleton -->
      <div class="animate-pulse bg-gray-900 border border-gray-800 rounded-lg p-6">
        <div class="flex items-center gap-4">
          <div class="w-20 h-20 bg-gray-800 rounded-full" />
          <div class="flex-1">
            <div class="h-6 w-48 bg-gray-800 rounded mb-2" />
            <div class="h-4 w-32 bg-gray-800 rounded mb-2" />
            <div class="h-4 w-24 bg-gray-800 rounded" />
          </div>
        </div>
      </div>
      
      <!-- Tabs Skeleton -->
      <div class="animate-pulse">
        <div class="flex gap-4 border-b border-gray-800 pb-3 mb-6">
          <div class="h-5 w-20 bg-gray-800 rounded" />
          <div class="h-5 w-16 bg-gray-800 rounded" />
          <div class="h-5 w-20 bg-gray-800 rounded" />
          <div class="h-5 w-18 bg-gray-800 rounded" />
        </div>
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div class="lg:col-span-2 h-64 bg-gray-900 border border-gray-800 rounded-lg" />
          <div class="h-64 bg-gray-900 border border-gray-800 rounded-lg" />
        </div>
      </div>
    </div>

    <!-- Profile Content -->
    <template v-else>
      <!-- Profile Header -->
      <EmployeesEmployeeProfileHeader
        :employee="employee"
        :can-edit="canEdit"
        @edit="emit('edit')"
      />

      <!-- Profile Tabs -->
      <EmployeesEmployeeProfileTabs
        :employee="employee"
        :goals="goals"
        :reviews="reviews"
        :direct-reports="directReports"
        :is-loading-goals="isLoadingGoals"
        :is-loading-reviews="isLoadingReviews"
        :is-loading-team="isLoadingTeam"
        @view-employee="emit('viewEmployee', $event)"
      />
    </template>
  </div>
</template>
