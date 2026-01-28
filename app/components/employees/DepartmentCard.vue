<script setup lang="ts">
import type { DepartmentListItem } from '~/types/department'

interface Props {
  department: DepartmentListItem
}

defineProps<Props>()

const emit = defineEmits<{
  click: []
  edit: []
  delete: []
}>()

const statusColors: Record<string, string> = {
  active: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  inactive: 'bg-gray-500/10 text-gray-400 border-gray-500/20'
}
</script>

<template>
  <div
    class="bg-gray-900 border border-gray-800 rounded-lg p-4 hover:border-gray-700 transition-colors cursor-pointer group"
    @click="emit('click')"
  >
    <div class="flex items-start justify-between">
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2">
          <h3 class="font-medium text-white truncate">
            {{ department.name }}
          </h3>
          <span
            class="px-2 py-0.5 text-xs font-medium rounded-full border"
            :class="statusColors[department.status] || statusColors.active"
          >
            {{ department.status }}
          </span>
        </div>
        
        <p v-if="department.description" class="text-sm text-gray-400 mt-1 line-clamp-2">
          {{ department.description }}
        </p>
        
        <div class="flex items-center gap-4 mt-3 text-sm">
          <div class="flex items-center gap-1 text-gray-400">
            <UIcon name="i-heroicons-users" class="w-4 h-4" />
            <span>{{ department.employee_count || 0 }} employees</span>
          </div>
          
          <div v-if="department.parent" class="flex items-center gap-1 text-gray-500">
            <UIcon name="i-heroicons-arrow-turn-up-right" class="w-4 h-4" />
            <span>{{ department.parent.name }}</span>
          </div>
        </div>
        
        <div v-if="department.manager" class="flex items-center gap-2 mt-3">
          <UAvatar
            :alt="`${department.manager.first_name} ${department.manager.last_name}`"
            size="xs"
          />
          <span class="text-sm text-gray-400">
            {{ department.manager.first_name }} {{ department.manager.last_name }}
          </span>
        </div>
      </div>
      
      <!-- Actions -->
      <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <UButton
          variant="ghost"
          color="neutral"
          size="xs"
          @click.stop="emit('edit')"
        >
          <UIcon name="i-heroicons-pencil-square" class="w-4 h-4" />
        </UButton>
        <UButton
          variant="ghost"
          color="error"
          size="xs"
          @click.stop="emit('delete')"
        >
          <UIcon name="i-heroicons-trash" class="w-4 h-4" />
        </UButton>
      </div>
    </div>
  </div>
</template>
