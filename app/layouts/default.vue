<script setup lang="ts">
import type { UserRole } from '~/types/auth'

const { user, userFullName, userRole, logout, showSessionWarning, extendSession } = useAuth()

interface NavItem {
  label: string
  icon: string
  to: string
  roles?: UserRole[]
}

const navItems: NavItem[] = [
  { label: 'Dashboard', icon: 'i-heroicons-home', to: '/' },
  { label: 'Employees', icon: 'i-heroicons-users', to: '/employees', roles: ['admin', 'hr', 'manager', 'csuite'] },
  { label: 'Goals', icon: 'i-heroicons-flag', to: '/goals' },
  { label: 'Reviews', icon: 'i-heroicons-document-text', to: '/reviews' },
  { label: 'Analytics', icon: 'i-heroicons-chart-pie', to: '/analytics', roles: ['admin', 'hr', 'manager', 'csuite'] },
  { label: 'Settings', icon: 'i-heroicons-cog-6-tooth', to: '/settings', roles: ['admin'] }
]

const filteredNavItems = computed(() => {
  return navItems.filter(item => {
    if (!item.roles) return true
    return item.roles.includes(userRole.value as UserRole)
  })
})

const userMenuItems = [
  [{
    label: 'Profile',
    icon: 'i-heroicons-user-circle',
    to: '/profile'
  }],
  [{
    label: 'Sign out',
    icon: 'i-heroicons-arrow-right-on-rectangle',
    click: async () => {
      await logout()
      navigateTo('/auth/login')
    }
  }]
]

const roleLabels: Record<UserRole, string> = {
  admin: 'Administrator',
  hr: 'HR Manager',
  manager: 'Manager',
  employee: 'Employee',
  csuite: 'Executive'
}

const isSidebarOpen = ref(true)
const showSessionModal = ref(false)

watch(showSessionWarning, (value) => {
  showSessionModal.value = value
})

async function handleExtendSession() {
  await extendSession()
  showSessionModal.value = false
}

async function handleLogout() {
  await logout()
  navigateTo('/auth/login')
}
</script>

<template>
  <div class="min-h-screen bg-gray-950">
    <!-- Sidebar -->
    <aside
      class="fixed top-0 left-0 h-full bg-gray-900 border-r border-gray-800 transition-all duration-300 z-40"
      :class="isSidebarOpen ? 'w-64' : 'w-20'"
    >
      <!-- Logo -->
      <div class="flex items-center h-16 px-4 border-b border-gray-800">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-primary-500/10 flex items-center justify-center">
            <UIcon name="i-heroicons-chart-bar" class="w-5 h-5 text-primary-500" />
          </div>
          <span v-if="isSidebarOpen" class="font-semibold text-white">Performance</span>
        </div>
      </div>

      <!-- Navigation -->
      <nav class="p-4 space-y-1">
        <NuxtLink
          v-for="item in filteredNavItems"
          :key="item.to"
          :to="item.to"
          class="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          active-class="!text-primary-500 !bg-primary-500/10"
        >
          <UIcon :name="item.icon" class="w-5 h-5 flex-shrink-0" />
          <span v-if="isSidebarOpen">{{ item.label }}</span>
        </NuxtLink>
      </nav>

      <!-- Toggle button -->
      <button
        class="absolute -right-3 top-20 w-6 h-6 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center text-gray-400 hover:text-white"
        @click="isSidebarOpen = !isSidebarOpen"
      >
        <UIcon :name="isSidebarOpen ? 'i-heroicons-chevron-left' : 'i-heroicons-chevron-right'" class="w-3 h-3" />
      </button>
    </aside>

    <!-- Main content -->
    <div :class="isSidebarOpen ? 'pl-64' : 'pl-20'" class="transition-all duration-300">
      <!-- Top header -->
      <header class="sticky top-0 h-16 bg-gray-900/80 backdrop-blur-sm border-b border-gray-800 flex items-center justify-between px-6 z-30">
        <div>
          <!-- Breadcrumb or page title can go here -->
        </div>

        <!-- User menu -->
        <div class="flex items-center gap-4">
          <UDropdownMenu :items="userMenuItems">
            <button class="flex items-center gap-3 hover:bg-gray-800 rounded-lg px-3 py-2 transition-colors">
              <UAvatar
                :alt="userFullName"
                :src="user?.employee?.avatar_url"
                size="sm"
              />
              <div class="text-left hidden sm:block">
                <div class="text-sm font-medium text-white">{{ userFullName }}</div>
                <div class="text-xs text-gray-400">{{ roleLabels[userRole as UserRole] || userRole }}</div>
              </div>
              <UIcon name="i-heroicons-chevron-down" class="w-4 h-4 text-gray-400" />
            </button>
          </UDropdownMenu>
        </div>
      </header>

      <!-- Page content -->
      <main class="p-6">
        <slot />
      </main>
    </div>

    <!-- Session timeout warning modal -->
    <UModal v-model:open="showSessionModal">
      <template #content>
        <UCard>
          <template #header>
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center">
                <UIcon name="i-heroicons-clock" class="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <h3 class="font-semibold text-white">Session Expiring</h3>
                <p class="text-sm text-gray-400">Your session will expire soon</p>
              </div>
            </div>
          </template>

          <p class="text-gray-300">
            Your session will expire in less than 5 minutes due to inactivity.
            Would you like to extend your session?
          </p>

          <template #footer>
            <div class="flex justify-end gap-3">
              <UButton variant="ghost" color="neutral" @click="handleLogout">
                Sign out
              </UButton>
              <UButton color="primary" @click="handleExtendSession">
                Extend Session
              </UButton>
            </div>
          </template>
        </UCard>
      </template>
    </UModal>
  </div>
</template>
