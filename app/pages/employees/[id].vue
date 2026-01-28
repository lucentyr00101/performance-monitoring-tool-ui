<script setup lang="ts">
import type { EmployeeGoalSummary, EmployeeReviewSummary, EmployeeTeamMember, EmployeeUpdateRequest } from '~/types/employee'

const route = useRoute()
const router = useRouter()
const employeeStore = useEmployeeStore()
const toast = useToast()

const employeeId = computed(() => route.params.id as string)

// Local state for profile data
const goals = ref<EmployeeGoalSummary[]>([])
const reviews = ref<EmployeeReviewSummary[]>([])
const directReports = ref<EmployeeTeamMember[]>([])

const isLoadingGoals = ref(false)
const isLoadingReviews = ref(false)
const isLoadingTeam = ref(false)

// Edit modal state
const isEditModalOpen = ref(false)
const isSaving = ref(false)

// TODO: Replace with actual access control logic
const canEdit = computed(() => true)

// Fetch employee data
async function loadEmployee() {
  try {
    await employeeStore.fetchEmployee(employeeId.value)
    // Fetch related data in parallel
    await Promise.all([
      loadGoals(),
      loadReviews(),
      loadTeam()
    ])
  }
  catch (error) {
    console.error('Failed to load employee:', error)
  }
}

async function loadGoals() {
  isLoadingGoals.value = true
  try {
    goals.value = await employeeStore.fetchEmployeeGoals(employeeId.value)
  }
  catch {
    goals.value = []
  }
  finally {
    isLoadingGoals.value = false
  }
}

async function loadReviews() {
  isLoadingReviews.value = true
  try {
    reviews.value = await employeeStore.fetchEmployeeReviews(employeeId.value)
  }
  catch {
    reviews.value = []
  }
  finally {
    isLoadingReviews.value = false
  }
}

async function loadTeam() {
  isLoadingTeam.value = true
  try {
    directReports.value = await employeeStore.fetchEmployeeTeam(employeeId.value)
  }
  catch {
    directReports.value = []
  }
  finally {
    isLoadingTeam.value = false
  }
}

// Navigation
function handleBack() {
  router.push('/employees')
}

function handleViewEmployee(id: string) {
  router.push(`/employees/${id}`)
}

function handleEdit() {
  isEditModalOpen.value = true
}

async function handleSaveEmployee(data: EmployeeUpdateRequest) {
  isSaving.value = true
  try {
    await employeeStore.updateEmployee(employeeId.value, data)
    isEditModalOpen.value = false
    toast.add({
      title: 'Profile Updated',
      description: 'Employee profile has been successfully updated.',
      color: 'success'
    })
  }
  catch {
    toast.add({
      title: 'Update Failed',
      description: 'Failed to update employee profile. Please try again.',
      color: 'error'
    })
  }
  finally {
    isSaving.value = false
  }
}

// Watch for route changes (when navigating between profiles)
watch(
  () => route.params.id,
  (newId) => {
    if (newId) {
      loadEmployee()
    }
  },
  { immediate: true }
)

// Page meta
useHead({
  title: computed(() => {
    if (!employeeStore.currentEmployee) return 'Employee Profile'
    return `${employeeStore.currentEmployee.first_name} ${employeeStore.currentEmployee.last_name} | Employee Profile`
  })
})
</script>

<template>
  <div class="min-h-screen bg-gray-950 py-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Error State -->
      <div v-if="employeeStore.error" class="text-center py-12">
        <div class="bg-red-500/10 border border-red-500/20 rounded-lg p-6 max-w-md mx-auto">
          <UIcon name="i-heroicons-exclamation-triangle" class="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 class="text-lg font-medium text-white mb-2">Error Loading Profile</h2>
          <p class="text-gray-400 mb-4">{{ employeeStore.error }}</p>
          <div class="flex gap-3 justify-center">
            <UButton variant="outline" color="neutral" @click="handleBack">
              Back to Directory
            </UButton>
            <UButton variant="solid" color="primary" @click="loadEmployee">
              Try Again
            </UButton>
          </div>
        </div>
      </div>

      <!-- Profile Component -->
      <EmployeesEmployeeProfile
        v-else-if="employeeStore.currentEmployee"
        :employee="employeeStore.currentEmployee"
        :goals="goals"
        :reviews="reviews"
        :direct-reports="directReports"
        :is-loading="employeeStore.isLoading"
        :is-loading-goals="isLoadingGoals"
        :is-loading-reviews="isLoadingReviews"
        :is-loading-team="isLoadingTeam"
        :can-edit="canEdit"
        @edit="handleEdit"
        @view-employee="handleViewEmployee"
        @back="handleBack"
      />

      <!-- Loading State (when no employee yet) -->
      <div v-else-if="employeeStore.isLoading" class="space-y-6">
        <button
          class="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          @click="handleBack"
        >
          <UIcon name="i-heroicons-arrow-left" class="w-5 h-5" />
          <span class="text-sm font-medium">Back to Directory</span>
        </button>
        
        <!-- Skeleton -->
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
      </div>

      <!-- Edit Modal -->
      <EmployeesEmployeeEditModal
        v-if="employeeStore.currentEmployee"
        :employee="employeeStore.currentEmployee"
        :is-open="isEditModalOpen"
        :is-saving="isSaving"
        @close="isEditModalOpen = false"
        @save="handleSaveEmployee"
      />
    </div>
  </div>
</template>
