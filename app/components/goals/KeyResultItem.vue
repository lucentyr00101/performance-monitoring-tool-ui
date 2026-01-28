<script setup lang="ts">
import type { KeyResult } from '~/types/goal'

interface Props {
  keyResult: KeyResult
  editable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  editable: false
})

const emit = defineEmits<{
  edit: [keyResult: KeyResult]
  delete: [keyResult: KeyResult]
  updateProgress: [keyResult: KeyResult, value: number]
}>()

const progress = computed(() => {
  if (props.keyResult.target_value === 0) return 0
  return Math.min((props.keyResult.current_value / props.keyResult.target_value) * 100, 100)
})

// Determine display config based on status and progress
const statusConfig = computed(() => {
  // Completed status
  if (props.keyResult.status === 'completed') {
    return { color: 'text-emerald-400', bgColor: 'bg-emerald-500/10', label: 'Completed' }
  }
  
  // Cancelled status
  if (props.keyResult.status === 'cancelled') {
    return { color: 'text-gray-400', bgColor: 'bg-gray-500/10', label: 'Cancelled' }
  }
  
  // In progress - determine color based on progress
  if (progress.value >= 70) {
    return { color: 'text-emerald-400', bgColor: 'bg-emerald-500/10', label: 'On Track' }
  }
  if (progress.value >= 40) {
    return { color: 'text-amber-400', bgColor: 'bg-amber-500/10', label: 'At Risk' }
  }
  return { color: 'text-blue-400', bgColor: 'bg-blue-500/10', label: 'In Progress' }
})

const unitDisplay = computed(() => {
  const unit = props.keyResult.unit
  if (!unit) return ''
  if (unit === 'percent') return '%'
  if (unit === 'currency') return '$'
  return ` ${unit}`
})

function formatValue(value: number): string {
  if (props.keyResult.unit === 'currency') {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
  }
  if (props.keyResult.unit === 'percent') {
    return `${value}%`
  }
  return `${value.toLocaleString()}${unitDisplay.value}`
}
</script>

<template>
  <div class="group bg-gray-800/50 border border-gray-700 rounded-lg p-4 hover:border-gray-600 transition-colors">
    <div class="flex items-start justify-between gap-3">
      <!-- Content -->
      <div class="flex-1 min-w-0">
        <!-- Title & Status -->
        <div class="flex items-center gap-2 mb-2">
          <span
            class="w-2 h-2 rounded-full flex-shrink-0"
            :class="statusConfig.bgColor.replace('/10', '')"
          />
          <h4 class="font-medium text-white truncate">{{ keyResult.title }}</h4>
        </div>

        <!-- Description -->
        <p
          v-if="keyResult.description"
          class="text-sm text-gray-400 line-clamp-2 mb-3"
        >
          {{ keyResult.description }}
        </p>

        <!-- Progress -->
        <div class="space-y-2">
          <div class="flex items-center justify-between text-sm">
            <span class="text-gray-400">
              {{ formatValue(keyResult.current_value) }} / {{ formatValue(keyResult.target_value) }}
            </span>
            <span
              class="font-medium"
              :class="statusConfig.color"
            >
              {{ Math.round(progress) }}%
            </span>
          </div>
          <div class="w-full h-1.5 bg-gray-700 rounded-full overflow-hidden">
            <div
              class="h-full rounded-full transition-all duration-300"
              :class="statusConfig.bgColor.replace('/10', '')"
              :style="{ width: `${progress}%` }"
            />
          </div>
        </div>

        <!-- Due Date -->
        <div
          v-if="keyResult.due_date"
          class="flex items-center gap-1.5 mt-3 text-xs text-gray-500"
        >
          <UIcon name="i-heroicons-calendar" class="w-3.5 h-3.5" />
          <span>Due {{ new Date(keyResult.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) }}</span>
        </div>
      </div>

      <!-- Actions -->
      <div
        v-if="editable"
        class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <UButton
          icon="i-heroicons-pencil"
          color="neutral"
          variant="ghost"
          size="xs"
          @click.stop="emit('edit', keyResult)"
        />
        <UButton
          icon="i-heroicons-trash"
          color="error"
          variant="ghost"
          size="xs"
          @click.stop="emit('delete', keyResult)"
        />
      </div>
    </div>
  </div>
</template>
