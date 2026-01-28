<script setup lang="ts">
import type { GoalPriority } from '~/types/goal'

interface Props {
  priority: GoalPriority
  size?: 'xs' | 'sm' | 'md'
}

const props = withDefaults(defineProps<Props>(), {
  size: 'sm'
})

const priorityConfig: Record<GoalPriority, { label: string; color: string; icon: string }> = {
  low: { 
    label: 'Low', 
    color: 'text-gray-400',
    icon: 'i-heroicons-minus'
  },
  medium: { 
    label: 'Medium', 
    color: 'text-amber-400',
    icon: 'i-heroicons-bars-2'
  },
  high: { 
    label: 'High', 
    color: 'text-red-400',
    icon: 'i-heroicons-chevron-double-up'
  }
}

const config = computed(() => priorityConfig[props.priority] || priorityConfig.medium)

const iconSize = computed(() => {
  switch (props.size) {
    case 'xs': return 'w-3 h-3'
    case 'md': return 'w-5 h-5'
    default: return 'w-4 h-4'
  }
})

const textSize = computed(() => {
  switch (props.size) {
    case 'xs': return 'text-[10px]'
    case 'md': return 'text-sm'
    default: return 'text-xs'
  }
})
</script>

<template>
  <span
    class="inline-flex items-center gap-0.5 font-medium"
    :class="[config.color, textSize]"
    :title="`${config.label} Priority`"
  >
    <UIcon :name="config.icon" :class="iconSize" />
    <span class="sr-only sm:not-sr-only">{{ config.label }}</span>
  </span>
</template>
