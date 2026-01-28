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
  active: 'text-emerald-400',
  inactive: 'text-gray-400',
  on_leave: 'text-amber-400',
  terminated: 'text-red-400'
}

const statusIcons: Record<string, string> = {
  active: 'i-heroicons-check-circle',
  inactive: 'i-heroicons-minus-circle',
  on_leave: 'i-heroicons-clock',
  terminated: 'i-heroicons-x-circle'
}
</script>

<template>
  <div
    class="group flex items-center gap-4 bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 hover:border-gray-700 hover:bg-gray-900/80 transition-all duration-200 cursor-pointer"
    @click="emit('click', employee)"
  >
    <!-- Avatar -->
    <UAvatar
      :src="employee.avatar_url"
      :alt="fullName"
      size="md"
    />

    <!-- Name & Title -->
    <div class="flex-1 min-w-0">
      <h3
        class="font-medium text-white group-hover:text-primary-400 transition-colors truncate"
        v-html="highlightMatch(fullName)"
      />
      <p
        class="text-sm text-gray-400 truncate"
        v-html="highlightMatch(employee.job_title || 'No title')"
      />
    </div>

    <!-- Department -->
    <div class="hidden md:block w-40">
      <span class="text-sm text-gray-400 truncate block">
        {{ employee.department?.name || 'Unassigned' }}
      </span>
    </div>

    <!-- Email -->
    <div class="hidden lg:block w-56">
      <span
        class="text-sm text-gray-400 truncate block"
        v-html="highlightMatch(employee.email)"
      />
    </div>

    <!-- Status -->
    <div class="flex items-center gap-1.5">
      <UIcon
        :name="statusIcons[employee.employment_status] || statusIcons.active"
        class="w-4 h-4"
        :class="statusColors[employee.employment_status] || statusColors.active"
      />
      <span class="text-sm hidden sm:inline" :class="statusColors[employee.employment_status]">
        {{ employee.employment_status === 'on_leave' ? 'Leave' : employee.employment_status }}
      </span>
    </div>

    <!-- Arrow -->
    <UIcon
      name="i-heroicons-chevron-right"
      class="w-5 h-5 text-gray-600 group-hover:text-gray-400 transition-colors"
    />
  </div>
</template>
