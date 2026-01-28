<script setup lang="ts">
interface Props {
  id: string
  name: string
  jobTitle?: string
  avatarUrl?: string
  employeeCount?: number
  isHighlighted?: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  click: []
}>()
</script>

<template>
  <div
    class="org-node px-4 py-3 bg-gray-900 border-2 rounded-lg cursor-pointer transition-all hover:shadow-lg hover:shadow-primary-500/10"
    :class="isHighlighted 
      ? 'border-primary-500 shadow-lg shadow-primary-500/20' 
      : 'border-gray-700 hover:border-gray-600'"
    @click="emit('click')"
  >
    <div class="flex items-center gap-3">
      <!-- Avatar -->
      <UAvatar
        :src="avatarUrl"
        :alt="name"
        size="md"
        class="ring-2 ring-gray-800"
      />
      
      <div class="flex-1 min-w-0">
        <p class="font-medium text-white truncate text-sm">
          {{ name }}
        </p>
        <p v-if="jobTitle" class="text-xs text-gray-400 truncate">
          {{ jobTitle }}
        </p>
      </div>
    </div>
    
    <!-- Employee count badge -->
    <div
      v-if="employeeCount && employeeCount > 0"
      class="mt-2 flex items-center gap-1 text-xs text-gray-500"
    >
      <UIcon name="i-heroicons-users" class="w-3 h-3" />
      <span>{{ employeeCount }} direct reports</span>
    </div>
  </div>
</template>

<style scoped>
.org-node {
  min-width: 180px;
  max-width: 220px;
}
</style>
