<script setup lang="ts">
import type { ChartData } from '~/types/dashboard'

defineProps<{
  title: string
  data: ChartData
  type?: 'line' | 'bar' | 'doughnut'
  loading?: boolean
  height?: string
}>()

// Helper function for doughnut chart colors - static classes for Tailwind purge
function getDoughnutColor(index: number): string {
  const colors = [
    'bg-primary-500',
    'bg-emerald-500', 
    'bg-amber-500',
    'bg-red-500',
    'bg-blue-500',
    'bg-purple-500'
  ]
  return colors[index % colors.length] || 'bg-primary-500'
}

// For MVP, we'll render a simple visual representation
// In production, integrate Chart.js or similar
function getBarWidth(value: number, max: number): string {
  return `${(value / max) * 100}%`
}
</script>

<template>
  <UCard class="bg-gray-900 ring-gray-800">
    <template #header>
      <h3 class="font-semibold text-white">{{ title }}</h3>
    </template>

    <!-- Loading skeleton -->
    <template v-if="loading">
      <div class="space-y-3" :style="{ minHeight: height || '200px' }">
        <USkeleton class="h-full w-full rounded" />
      </div>
    </template>

    <!-- Empty state -->
    <template v-else-if="!data?.labels?.length">
      <div class="text-center py-8 text-gray-500" :style="{ minHeight: height || '200px' }">
        <UIcon name="i-heroicons-chart-bar" class="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p>No data available</p>
      </div>
    </template>

    <!-- Bar Chart (default visual representation) -->
    <template v-else-if="type === 'bar' || !type">
      <div class="space-y-3" :style="{ minHeight: height || '200px' }">
        <div
          v-for="(label, index) in data.labels"
          :key="label"
          class="space-y-1"
        >
          <div class="flex items-center justify-between text-sm">
            <span class="text-gray-300">{{ label }}</span>
            <span class="text-white font-medium">{{ data.datasets[0]?.data[index] }}</span>
          </div>
          <div class="h-3 bg-gray-800 rounded-full overflow-hidden">
            <div
              class="h-full bg-primary-500 rounded-full transition-all duration-500"
              :style="{ width: getBarWidth(data.datasets[0]?.data[index] || 0, Math.max(...(data.datasets[0]?.data || [1]))) }"
            />
          </div>
        </div>
      </div>
    </template>

    <!-- Line Chart representation -->
    <template v-else-if="type === 'line'">
      <div class="relative" :style="{ minHeight: height || '200px' }">
        <!-- Simple sparkline-style representation -->
        <div class="flex items-end justify-between h-32 gap-1">
          <div
            v-for="(value, index) in data.datasets[0]?.data"
            :key="index"
            class="flex-1 flex flex-col items-center gap-1"
          >
            <div
              class="w-full bg-primary-500/20 rounded-t transition-all duration-500"
              :style="{ height: `${(value / Math.max(...(data.datasets[0]?.data || [1]))) * 100}%` }"
            >
              <div class="w-2 h-2 bg-primary-500 rounded-full mx-auto -mt-1" />
            </div>
            <span class="text-xs text-gray-500">{{ data.labels[index] }}</span>
          </div>
        </div>
        <!-- Legend -->
        <div v-if="data.datasets.length > 1" class="flex items-center gap-4 mt-4 justify-center">
          <div
            v-for="dataset in data.datasets"
            :key="dataset.label"
            class="flex items-center gap-2 text-sm"
          >
            <div class="w-3 h-3 rounded-full bg-primary-500" />
            <span class="text-gray-400">{{ dataset.label }}</span>
          </div>
        </div>
      </div>
    </template>

    <!-- Doughnut Chart representation -->
    <template v-else-if="type === 'doughnut'">
      <div class="flex items-center justify-center gap-8" :style="{ minHeight: height || '200px' }">
        <!-- Simplified doughnut as stacked bars -->
        <div class="flex-1 space-y-2">
          <div
            v-for="(value, index) in data.datasets[0]?.data"
            :key="index"
            class="flex items-center gap-3"
          >
            <div class="w-3 h-3 rounded-full" :class="getDoughnutColor(index)" />
            <div class="flex-1">
              <div class="flex items-center justify-between text-sm mb-1">
                <span class="text-gray-300">{{ data.labels[index] }}</span>
                <span class="text-white font-medium">{{ value }}</span>
              </div>
              <div class="h-2 bg-gray-800 rounded-full overflow-hidden">
                <div
                  class="h-full rounded-full"
                  :class="getDoughnutColor(index)"
                  :style="{ width: getBarWidth(value, data.datasets[0]?.data.reduce((a, b) => a + b, 0) || 1) }"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </UCard>
</template>
