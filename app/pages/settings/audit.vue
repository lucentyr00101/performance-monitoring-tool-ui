<script setup lang="ts">
import { api } from '~/utils/api'

definePageMeta({
  layout: 'default',
  middleware: ['auth']
})

const { userRole } = useAuth()

if (userRole.value !== 'admin') {
  navigateTo('/403')
}

interface AuditLogEntry {
  id: string
  timestamp: string
  userId: string
  userEmail: string
  userName: string
  action: string
  resource: string
  resourceId?: string
  ipAddress?: string
}

interface AuditLogsResponse {
  entries: AuditLogEntry[]
  total: number
  page: number
  perPage: number
  totalPages: number
}

// Filters
const filters = reactive({
  userId: '',
  action: '',
  startDate: '',
  endDate: ''
})

const page = ref(1)
const PER_PAGE = 20

const actionOptions = [
  { label: 'All Actions', value: '' },
  { label: 'Login', value: 'login' },
  { label: 'Logout', value: 'logout' },
  { label: 'Create', value: 'create' },
  { label: 'Update', value: 'update' },
  { label: 'Delete', value: 'delete' },
  { label: 'View', value: 'view' }
]

// Data
const logs = ref<AuditLogEntry[]>([])
const total = ref(0)
const totalPages = ref(0)
const isLoading = ref(false)
const error = ref<string | null>(null)

const actionColors: Record<string, string> = {
  login: 'success',
  logout: 'neutral',
  create: 'primary',
  update: 'warning',
  delete: 'error',
  view: 'info'
}

async function fetchLogs() {
  isLoading.value = true
  error.value = null
  try {
    const qs = new URLSearchParams({
      page: String(page.value),
      per_page: String(PER_PAGE),
      ...(filters.userId && { user_id: filters.userId }),
      ...(filters.action && { action: filters.action }),
      ...(filters.startDate && { start_date: filters.startDate }),
      ...(filters.endDate && { end_date: filters.endDate })
    }).toString()

    const response = await api.get<AuditLogsResponse>(`/admin/audit-logs?${qs}`)
    logs.value = response.data.entries
    total.value = response.data.total
    totalPages.value = response.data.totalPages
  }
  catch {
    error.value = 'Failed to load audit logs. Please try again.'
  }
  finally {
    isLoading.value = false
  }
}

function applyFilters() {
  page.value = 1
  fetchLogs()
}

function clearFilters() {
  filters.userId = ''
  filters.action = ''
  filters.startDate = ''
  filters.endDate = ''
  page.value = 1
  fetchLogs()
}

function handlePageChange(newPage: number) {
  page.value = newPage
  fetchLogs()
}

function formatTimestamp(ts: string) {
  return new Date(ts).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

onMounted(() => {
  fetchLogs()
})
</script>

<template>
  <div class="px-4 py-8 max-w-6xl">
    <!-- Header -->
    <div class="flex items-center gap-4 mb-8">
      <NuxtLink to="/settings">
        <UButton variant="ghost" color="neutral" size="sm">
          <UIcon name="i-heroicons-arrow-left" class="w-4 h-4 mr-1" />
          Settings
        </UButton>
      </NuxtLink>
      <div>
        <h1 class="text-2xl font-bold text-white">Audit Logs</h1>
        <p class="text-gray-400 text-sm mt-0.5">System activity and security events</p>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-gray-900 border border-gray-800 rounded-lg p-4 mb-6">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <UFormField label="User ID">
          <UInput v-model="filters.userId" placeholder="Filter by user ID" class="w-full" />
        </UFormField>

        <UFormField label="Action">
          <USelect v-model="filters.action" :items="actionOptions" value-key="value" class="w-full" />
        </UFormField>

        <UFormField label="Start Date">
          <UInput v-model="filters.startDate" type="date" class="w-full" />
        </UFormField>

        <UFormField label="End Date">
          <UInput v-model="filters.endDate" type="date" class="w-full" />
        </UFormField>
      </div>

      <div class="flex justify-end gap-2 mt-4">
        <UButton variant="outline" color="neutral" size="sm" @click="clearFilters">
          Clear
        </UButton>
        <UButton color="primary" size="sm" @click="applyFilters">
          Apply Filters
        </UButton>
      </div>
    </div>

    <!-- Error State -->
    <div v-if="error" class="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6">
      <div class="flex items-center gap-3">
        <UIcon name="i-heroicons-exclamation-triangle" class="w-5 h-5 text-red-400" />
        <p class="text-red-400">{{ error }}</p>
        <UButton class="ml-auto" variant="outline" color="error" size="sm" @click="fetchLogs">
          Retry
        </UButton>
      </div>
    </div>

    <!-- Loading Skeletons -->
    <div v-else-if="isLoading" class="space-y-2">
      <div v-for="i in 5" :key="i" class="bg-gray-900 border border-gray-800 rounded-lg p-4 animate-pulse">
        <div class="flex items-center gap-4">
          <div class="w-32 h-4 bg-gray-800 rounded" />
          <div class="w-24 h-4 bg-gray-800 rounded" />
          <div class="flex-1 h-4 bg-gray-800 rounded" />
          <div class="w-20 h-4 bg-gray-800 rounded" />
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="logs.length === 0" class="text-center py-12">
      <UIcon name="i-heroicons-clipboard-document-list" class="w-12 h-12 text-gray-500 mx-auto mb-3" />
      <p class="text-gray-400">No audit logs found</p>
      <p class="text-gray-500 text-sm">Try adjusting your filters</p>
    </div>

    <!-- Table -->
    <div v-else class="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-gray-800">
              <th class="text-left px-4 py-3 text-gray-400 font-medium">Timestamp</th>
              <th class="text-left px-4 py-3 text-gray-400 font-medium">User</th>
              <th class="text-left px-4 py-3 text-gray-400 font-medium">Action</th>
              <th class="text-left px-4 py-3 text-gray-400 font-medium">Resource</th>
              <th class="text-left px-4 py-3 text-gray-400 font-medium">IP Address</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-800">
            <tr v-for="entry in logs" :key="entry.id" class="hover:bg-gray-800/30 transition-colors">
              <td class="px-4 py-3 text-gray-300 whitespace-nowrap">
                {{ formatTimestamp(entry.timestamp) }}
              </td>
              <td class="px-4 py-3">
                <div class="font-medium text-white">{{ entry.userName }}</div>
                <div class="text-xs text-gray-400">{{ entry.userEmail }}</div>
              </td>
              <td class="px-4 py-3">
                <UBadge
                  :color="(actionColors[entry.action] || 'neutral') as any"
                  variant="subtle"
                  size="sm"
                >
                  {{ entry.action }}
                </UBadge>
              </td>
              <td class="px-4 py-3 text-gray-300">
                <span>{{ entry.resource }}</span>
                <span v-if="entry.resourceId" class="text-gray-500 text-xs ml-1">#{{ entry.resourceId }}</span>
              </td>
              <td class="px-4 py-3 text-gray-400 font-mono text-xs">
                {{ entry.ipAddress || '—' }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="flex justify-center p-4 border-t border-gray-800">
        <UPagination
          :model-value="page"
          :page-count="PER_PAGE"
          :total="total"
          @update:model-value="handlePageChange"
        />
      </div>
    </div>
  </div>
</template>
