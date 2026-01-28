<script setup lang="ts">
import type { ProgressIndicator } from '~/types/goal'

interface Props {
  progress: number
  indicator?: ProgressIndicator
  showLabel?: boolean
  size?: 'xs' | 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<Props>(), {
  indicator: 'on_track',
  showLabel: true,
  size: 'md'
})

const progressColor = computed(() => {
  if (props.progress >= 100) return 'bg-emerald-500'
  
  switch (props.indicator) {
    case 'on_track': return 'bg-emerald-500'
    case 'at_risk': return 'bg-amber-500'
    case 'behind': return 'bg-red-500'
    default: return 'bg-blue-500'
  }
})

const bgColor = computed(() => {
  if (props.progress >= 100) return 'bg-emerald-500/20'
  
  switch (props.indicator) {
    case 'on_track': return 'bg-emerald-500/20'
    case 'at_risk': return 'bg-amber-500/20'
    case 'behind': return 'bg-red-500/20'
    default: return 'bg-gray-700'
  }
})

const textColor = computed(() => {
  if (props.progress >= 100) return 'text-emerald-400'
  
  switch (props.indicator) {
    case 'on_track': return 'text-emerald-400'
    case 'at_risk': return 'text-amber-400'
    case 'behind': return 'text-red-400'
    default: return 'text-gray-300'
  }
})

const heightClass = computed(() => {
  switch (props.size) {
    case 'xs': return 'h-1'
    case 'sm': return 'h-1.5'
    case 'lg': return 'h-3'
    default: return 'h-2'
  }
})

const normalizedProgress = computed(() => Math.min(Math.max(props.progress, 0), 100))
</script>

<template>
  <div class="w-full">
    <div
      v-if="showLabel"
      class="flex justify-between items-center mb-1"
    >
      <span class="text-xs text-gray-400">Progress</span>
      <span
        class="text-xs font-medium"
        :class="textColor"
      >
        {{ normalizedProgress }}%
      </span>
    </div>
    <div
      class="w-full rounded-full overflow-hidden"
      :class="[bgColor, heightClass]"
    >
      <div
        class="h-full rounded-full transition-all duration-300"
        :class="progressColor"
        :style="{ width: `${normalizedProgress}%` }"
      />
    </div>
  </div>
</template>
