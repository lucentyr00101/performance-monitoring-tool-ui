<script setup lang="ts">
import type { KpiCard } from '~/types/dashboard'

const props = defineProps<{
  kpi: KpiCard
  loading?: boolean
}>()

const colorClasses = computed(() => {
  const colors: Record<string, { bg: string; text: string; icon: string }> = {
    primary: { bg: 'bg-primary-500/10', text: 'text-primary-500', icon: 'text-primary-500' },
    success: { bg: 'bg-emerald-500/10', text: 'text-emerald-500', icon: 'text-emerald-500' },
    warning: { bg: 'bg-amber-500/10', text: 'text-amber-500', icon: 'text-amber-500' },
    error: { bg: 'bg-red-500/10', text: 'text-red-500', icon: 'text-red-500' },
    info: { bg: 'bg-cyan-500/10', text: 'text-cyan-500', icon: 'text-cyan-500' },
    neutral: { bg: 'bg-gray-500/10', text: 'text-gray-400', icon: 'text-gray-400' }
  }
  return colors[props.kpi.color || 'primary'] || colors.primary
})

const trendClasses = computed(() => {
  if (!props.kpi.trend) return ''
  const isPositive = props.kpi.trend.isPositive ?? props.kpi.trend.direction === 'up'
  return isPositive ? 'text-emerald-500' : 'text-red-500'
})

const trendIcon = computed(() => {
  if (!props.kpi.trend) return ''
  return props.kpi.trend.direction === 'up'
    ? 'i-heroicons-arrow-trending-up'
    : props.kpi.trend.direction === 'down'
      ? 'i-heroicons-arrow-trending-down'
      : 'i-heroicons-minus'
})
</script>

<template>
  <component
    :is="kpi.link ? 'NuxtLink' : 'div'"
    :to="kpi.link"
    class="block"
  >
    <UCard
      class="bg-gray-900 ring-gray-800 transition-all duration-200"
      :class="{ 'hover:ring-gray-700 hover:bg-gray-900/80 cursor-pointer': kpi.link }"
    >
      <!-- Loading skeleton -->
      <template v-if="loading">
        <div class="flex items-center gap-4">
          <USkeleton class="w-12 h-12 rounded-lg" />
          <div class="flex-1 space-y-2">
            <USkeleton class="h-6 w-16" />
            <USkeleton class="h-4 w-24" />
          </div>
        </div>
      </template>

      <!-- Content -->
      <template v-else>
        <div class="flex items-center gap-4">
          <!-- Icon -->
          <div
            v-if="kpi.icon"
            class="w-12 h-12 rounded-lg flex items-center justify-center shrink-0"
            :class="colorClasses.bg"
          >
            <UIcon :name="kpi.icon" class="w-6 h-6" :class="colorClasses.icon" />
          </div>

          <!-- Value and label -->
          <div class="min-w-0 flex-1">
            <div class="flex items-baseline gap-2">
              <p class="text-2xl font-bold text-white truncate">
                {{ kpi.value }}
              </p>
              <!-- Trend indicator -->
              <div v-if="kpi.trend" class="flex items-center gap-1 text-sm" :class="trendClasses">
                <UIcon :name="trendIcon" class="w-4 h-4" />
                <span>{{ kpi.trend.value }}</span>
              </div>
            </div>
            <p class="text-sm text-gray-400 truncate">
              {{ kpi.label }}
            </p>
          </div>
        </div>
      </template>
    </UCard>
  </component>
</template>
