<script setup lang="ts">
const props = withDefaults(defineProps<{
  label: string
  value: string | number
  icon?: string
  trend?: {
    direction: 'up' | 'down' | 'stable'
    value: string | number
    isPositive?: boolean
  }
  color?: 'primary' | 'success' | 'warning' | 'error' | 'neutral'
  loading?: boolean
  size?: 'sm' | 'md' | 'lg'
}>(), {
  color: 'primary',
  loading: false,
  size: 'md'
})

const colorClasses = computed(() => {
  const colors: Record<string, { bg: string; text: string; icon: string }> = {
    primary: { bg: 'bg-primary-500/10', text: 'text-primary-400', icon: 'text-primary-400' },
    success: { bg: 'bg-green-500/10', text: 'text-green-400', icon: 'text-green-400' },
    warning: { bg: 'bg-amber-500/10', text: 'text-amber-400', icon: 'text-amber-400' },
    error: { bg: 'bg-red-500/10', text: 'text-red-400', icon: 'text-red-400' },
    neutral: { bg: 'bg-gray-500/10', text: 'text-gray-400', icon: 'text-gray-400' }
  }
  return colors[props.color ?? 'primary']!
})

const trendColor = computed(() => {
  if (!props.trend) return ''

  if (props.trend.isPositive !== undefined) {
    return props.trend.isPositive ? 'text-green-400' : 'text-red-400'
  }

  return props.trend.direction === 'up' ? 'text-green-400' :
         props.trend.direction === 'down' ? 'text-red-400' : 'text-gray-400'
})

const trendIcon = computed(() => {
  if (!props.trend) return ''

  return props.trend.direction === 'up' ? 'heroicons:arrow-trending-up' :
         props.trend.direction === 'down' ? 'heroicons:arrow-trending-down' :
         'heroicons:minus'
})

const sizeClasses = computed(() => ({
  sm: { value: 'text-xl', label: 'text-xs', icon: 'w-8 h-8', iconSize: 'w-4 h-4' },
  md: { value: 'text-2xl', label: 'text-sm', icon: 'w-10 h-10', iconSize: 'w-5 h-5' },
  lg: { value: 'text-3xl', label: 'text-base', icon: 'w-12 h-12', iconSize: 'w-6 h-6' }
}[props.size]))
</script>

<template>
  <div class="bg-gray-900 border border-gray-800 rounded-lg p-4">
    <!-- Loading state -->
    <template v-if="loading">
      <div class="flex items-start justify-between">
        <div class="space-y-2 flex-1">
          <USkeleton class="h-4 w-24" />
          <USkeleton class="h-8 w-20" />
        </div>
        <USkeleton class="h-10 w-10 rounded-lg" />
      </div>
    </template>

    <!-- Content -->
    <template v-else>
      <div class="flex items-start justify-between">
        <div class="space-y-1">
          <p :class="['text-gray-400', sizeClasses.label]">{{ label }}</p>
          <p :class="['font-bold text-white', sizeClasses.value]">{{ value }}</p>

          <!-- Trend indicator -->
          <div v-if="trend" class="flex items-center gap-1" :class="trendColor">
            <UIcon :name="trendIcon" :class="['w-4 h-4']" />
            <span class="text-sm font-medium">{{ trend.value }}</span>
          </div>
        </div>

        <!-- Icon -->
        <div
          v-if="icon"
          :class="['rounded-lg flex items-center justify-center', colorClasses.bg, sizeClasses.icon]"
        >
          <UIcon :name="icon" :class="[colorClasses.icon, sizeClasses.iconSize]" />
        </div>
      </div>
    </template>
  </div>
</template>
