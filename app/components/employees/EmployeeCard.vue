<script setup lang="ts">
import type { EmployeeListItem } from '~/types/employee'

interface Props {
  employee: EmployeeListItem
  searchQuery?: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  click: [employee: EmployeeListItem]
}>()

// Highlight matching text in search results
function highlightMatch(text: string): string {
  if (!props.searchQuery || props.searchQuery.length < 2) return text
  const regex = new RegExp(`(${props.searchQuery})`, 'gi')
  return text.replace(regex, '<mark class="bg-primary-500/30 text-primary-300 rounded px-0.5">$1</mark>')
}

const fullName = computed(() => `${props.employee.first_name} ${props.employee.last_name}`)

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
</script>

<template>
  <div
    class="group bg-gray-900 border border-gray-800 rounded-lg p-5 hover:border-gray-700 hover:bg-gray-900/80 transition-all duration-200 cursor-pointer hover:-translate-y-0.5"
    @click="emit('click', employee)"
  >
    <!-- Avatar & Name -->
    <div class="flex flex-col items-center text-center mb-4">
      <UAvatar
        :src="employee.avatar_url"
        :alt="fullName"
        size="xl"
        class="mb-3"
      />
      <h3
        class="font-semibold text-white group-hover:text-primary-400 transition-colors"
        v-html="highlightMatch(fullName)"
      />
      <p
        class="text-sm text-gray-400 mt-0.5"
        v-html="highlightMatch(employee.job_title || 'No title')"
      />
    </div>

    <!-- Divider -->
    <div class="border-t border-gray-800 my-4" />

    <!-- Info -->
    <div class="space-y-2 text-sm">
      <div class="flex items-center gap-2 text-gray-400">
        <UIcon name="i-heroicons-envelope" class="w-4 h-4 flex-shrink-0" />
        <span
          class="truncate"
          v-html="highlightMatch(employee.email)"
        />
      </div>
      <div class="flex items-center gap-2 text-gray-400">
        <UIcon name="i-heroicons-building-office-2" class="w-4 h-4 flex-shrink-0" />
        <span class="truncate">{{ employee.department?.name || 'Unassigned' }}</span>
      </div>
    </div>

    <!-- Status Badge -->
    <div class="mt-4 flex justify-center">
      <span
        class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border"
        :class="statusColors[employee.employment_status] || statusColors.active"
      >
        {{ statusLabels[employee.employment_status] || employee.employment_status }}
      </span>
    </div>
  </div>
</template>
