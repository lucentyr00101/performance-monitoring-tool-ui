<script setup lang="ts">
definePageMeta({
  layout: 'default',
  middleware: ['auth']
})

const employeeStore = useEmployeeStore()
const { error: notifyError, info } = useNotification()

// Loading state
const isLoading = ref(true)

interface OrgEmployee {
  id: string
  name: string
  jobTitle?: string
  avatarUrl?: string
  managerId?: string
  directReportsCount: number
  department?: string
}

// Transform employees to org chart format with proper typing
const orgEmployees = computed<OrgEmployee[]>(() => {
  return employeeStore.employees.map((e) => ({
    id: e.id,
    name: `${e.firstName} ${e.lastName}`,
    jobTitle: e.jobTitle,
    avatarUrl: e.avatarUrl,
    managerId: e.manager?.id,
    directReportsCount: e.directReportsCount ?? 0,
    department: e.department?.name
  }))
})

// Fetch all employees for org chart
onMounted(async () => {
  isLoading.value = true
  try {
    await employeeStore.fetchEmployees({ perPage: 100 })
  }
  catch {
    notifyError('Failed to load organization chart data', 'network')
  }
  finally {
    isLoading.value = false
  }
})

// Handle export
async function handleExport() {
  // TODO: Implement PNG export
  info('Export', 'Export functionality coming soon.')
}

// Handle node click
function handleNodeClick(_id: string) {
  // Navigation is handled in OrgChart component
}
</script>

<template>
  <div>
    <!-- Page Header -->
    <div class="mb-6">
      <div class="flex items-center gap-4">
        <NuxtLink to="/employees">
          <UButton variant="ghost" color="neutral" size="sm">
            <UIcon name="i-heroicons-arrow-left" class="w-4 h-4 mr-1" />
            Back
          </UButton>
        </NuxtLink>
        <div>
          <h1 class="text-2xl font-bold text-white">Organization Chart</h1>
          <p class="text-gray-400 mt-1">Visual representation of your organization's structure</p>
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div v-if="employeeStore.error" class="bg-red-500/10 border border-red-500/20 rounded-lg p-6 text-center">
      <UIcon name="i-heroicons-exclamation-triangle" class="w-12 h-12 text-red-400 mx-auto mb-4" />
      <h3 class="text-lg font-medium text-white mb-2">Failed to load chart</h3>
      <p class="text-gray-400 mb-4">{{ employeeStore.error }}</p>
      <UButton variant="solid" color="primary" @click="employeeStore.fetchEmployees({ perPage: 100 })">
        Try Again
      </UButton>
    </div>

    <!-- Org Chart -->
    <EmployeesOrgChart
      v-else
      :employees="orgEmployees"
      :is-loading="isLoading"
      @node-click="handleNodeClick"
      @export="handleExport"
    />
  </div>
</template>
