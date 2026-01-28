<script setup lang="ts">
import type { GoalType } from '~/types/goal'

interface Props {
  type: GoalType
  size?: 'xs' | 'sm' | 'md'
}

const props = withDefaults(defineProps<Props>(), {
  size: 'sm'
})

const typeConfig: Record<GoalType, { label: string; color: string; icon: string }> = {
  individual: { 
    label: 'Individual', 
    color: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    icon: 'i-heroicons-user'
  },
  team: { 
    label: 'Team', 
    color: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    icon: 'i-heroicons-user-group'
  },
  department: { 
    label: 'Department', 
    color: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    icon: 'i-heroicons-building-office'
  },
  company: { 
    label: 'Company', 
    color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    icon: 'i-heroicons-building-office-2'
  }
}

const config = computed(() => typeConfig[props.type] || typeConfig.individual)

const sizeClasses = computed(() => {
  switch (props.size) {
    case 'xs': return 'px-1.5 py-0.5 text-[10px]'
    case 'md': return 'px-3 py-1 text-sm'
    default: return 'px-2 py-0.5 text-xs'
  }
})

const iconSize = computed(() => {
  switch (props.size) {
    case 'xs': return 'w-3 h-3'
    case 'md': return 'w-4 h-4'
    default: return 'w-3.5 h-3.5'
  }
})
</script>

<template>
  <span
    class="inline-flex items-center gap-1 rounded-full font-medium border whitespace-nowrap"
    :class="[config.color, sizeClasses]"
  >
    <UIcon :name="config.icon" :class="iconSize" />
    {{ config.label }}
  </span>
</template>
