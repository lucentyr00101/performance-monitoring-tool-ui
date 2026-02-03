<script setup lang="ts">
import type { ChartData, ChartOptions } from 'chart.js'

const props = withDefaults(defineProps<{
  labels: string[]
  data: number[]
  colors?: string[]
  height?: string
  loading?: boolean
  showLegend?: boolean
  cutout?: string
  centerText?: string
  centerValue?: string | number
}>(), {
  height: '300px',
  loading: false,
  showLegend: true,
  cutout: '60%'
})

// Default color palette
const defaultColors = [
  '#3b82f6', // Blue
  '#10b981', // Green
  '#f59e0b', // Amber
  '#ef4444', // Red
  '#8b5cf6', // Purple
  '#ec4899', // Pink
  '#06b6d4', // Cyan
  '#84cc16' // Lime
]

const chartColors = computed(() =>
  props.colors || defaultColors.slice(0, props.data.length)
)

const chartData = computed<ChartData<'doughnut'>>(() => ({
  labels: props.labels,
  datasets: [{
    data: props.data,
    backgroundColor: chartColors.value,
    borderColor: '#1f2937',
    borderWidth: 2,
    hoverOffset: 8
  }]
}))

const chartOptions = computed<ChartOptions<'doughnut'>>(() => ({
  cutout: props.cutout,
  plugins: {
    legend: {
      display: props.showLegend,
      position: 'right'
    }
  }
}))

// Calculate total for percentage display
const total = computed(() => props.data.reduce((sum, val) => sum + val, 0))
</script>

<template>
  <div class="relative" :style="{ height }">
    <BaseChart
      type="doughnut"
      :data="chartData"
      :options="chartOptions"
      :height="height"
      :loading="loading"
    />

    <!-- Center text overlay -->
    <div
      v-if="(centerText || centerValue) && !loading"
      class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
    >
      <span v-if="centerValue" class="text-2xl font-bold text-white">
        {{ centerValue }}
      </span>
      <span v-if="centerText" class="text-sm text-gray-400">
        {{ centerText }}
      </span>
    </div>
  </div>
</template>
