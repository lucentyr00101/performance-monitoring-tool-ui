<script setup lang="ts">
import type { GoalStatus } from '~/types/goal'

interface Props {
  status: GoalStatus
  size?: 'xs' | 'sm' | 'md'
}

const props = withDefaults(defineProps<Props>(), {
  size: 'sm'
})

const statusConfig: Record<GoalStatus, { label: string; color: string }> = {
  draft: { label: 'Draft', color: 'bg-gray-500/10 text-gray-400 border-gray-500/20' },
  pending: { label: 'Pending Approval', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  active: { label: 'Active', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  completed: { label: 'Completed', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  cancelled: { label: 'Cancelled', color: 'bg-red-500/10 text-red-400 border-red-500/20' }
}

const config = computed(() => statusConfig[props.status] || statusConfig.draft)

const sizeClasses = computed(() => {
  switch (props.size) {
    case 'xs': return 'px-1.5 py-0.5 text-[10px]'
    case 'md': return 'px-3 py-1 text-sm'
    default: return 'px-2 py-0.5 text-xs'
  }
})
</script>

<template>
  <span
    class="inline-flex items-center rounded-full font-medium border whitespace-nowrap"
    :class="[config.color, sizeClasses]"
  >
    {{ config.label }}
  </span>
</template>
