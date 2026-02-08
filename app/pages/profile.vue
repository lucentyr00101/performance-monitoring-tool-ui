<script setup lang="ts">
import type { UserRole } from '~/types/auth'

definePageMeta({
  layout: 'default',
  middleware: ['auth']
})

const { user, userRole, userFullName } = useAuth()

const roleLabels: Record<UserRole, string> = {
  admin: 'Administrator',
  hr: 'HR Manager',
  manager: 'Manager',
  employee: 'Employee',
  csuite: 'Executive'
}

const employee = computed(() => user.value?.employee)
</script>

<template>
  <div class="px-4 py-8">
    <h1 class="text-2xl font-bold text-white mb-6">My Profile</h1>

    <div class="space-y-6">
      <!-- Profile header -->
      <div class="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <div class="flex items-center gap-6">
          <UAvatar
            :alt="userFullName"
            :src="employee?.avatarUrl"
            size="xl"
          />
          <div>
            <h2 class="text-xl font-semibold text-white">{{ userFullName }}</h2>
            <p class="text-gray-400">{{ employee?.jobTitle }}</p>
            <UBadge color="primary" variant="subtle" class="mt-2">
              {{ roleLabels[userRole as UserRole] || userRole }}
            </UBadge>
          </div>
        </div>
      </div>

      <!-- Details -->
      <div class="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <h3 class="text-lg font-medium text-white mb-4">Details</h3>
        <dl class="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
          <div>
            <dt class="text-sm text-gray-400">Email</dt>
            <dd class="text-white">{{ user?.email }}</dd>
          </div>
          <div v-if="employee?.phone">
            <dt class="text-sm text-gray-400">Phone</dt>
            <dd class="text-white">{{ employee.phone }}</dd>
          </div>
          <div v-if="employee?.department">
            <dt class="text-sm text-gray-400">Department</dt>
            <dd class="text-white">{{ employee.department.name }}</dd>
          </div>
          <div v-if="employee?.employeeCode">
            <dt class="text-sm text-gray-400">Employee Code</dt>
            <dd class="text-white">{{ employee.employeeCode }}</dd>
          </div>
          <div v-if="employee?.hireDate">
            <dt class="text-sm text-gray-400">Hire Date</dt>
            <dd class="text-white">
              {{ new Date(employee.hireDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) }}
            </dd>
          </div>
          <div v-if="employee?.employmentType">
            <dt class="text-sm text-gray-400">Employment Type</dt>
            <dd class="text-white capitalize">{{ employee.employmentType }}</dd>
          </div>
          <div v-if="employee?.manager">
            <dt class="text-sm text-gray-400">Reports To</dt>
            <dd class="text-white">{{ employee.manager.firstName }} {{ employee.manager.lastName }}</dd>
          </div>
        </dl>
      </div>

      <!-- Account -->
      <div class="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <h3 class="text-lg font-medium text-white mb-4">Account</h3>
        <dl class="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
          <div>
            <dt class="text-sm text-gray-400">Status</dt>
            <dd>
              <UBadge :color="user?.status === 'active' ? 'success' : 'warning'" variant="subtle">
                {{ user?.status }}
              </UBadge>
            </dd>
          </div>
          <div v-if="user?.last_login_at">
            <dt class="text-sm text-gray-400">Last Login</dt>
            <dd class="text-white">
              {{ new Date(user.last_login_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }) }}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  </div>
</template>
