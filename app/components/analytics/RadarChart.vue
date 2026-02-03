<script setup lang="ts">
import type { ChartData, ChartOptions } from 'chart.js'

const props = withDefaults(defineProps<{
  labels: string[]
  datasets: {
    label: string
    data: number[]
    color?: string
  }[]
  height?: string
  loading?: boolean
  showLegend?: boolean
  maxValue?: number
}>(), {
  height: '300px',
  loading: false,
  showLegend: true
})

// Color palette for datasets
const colors = [
  { background: 'rgba(59, 130, 246, 0.2)', border: '#3b82f6' }, // Blue
  { background: 'rgba(16, 185, 129, 0.2)', border: '#10b981' }, // Green
  { background: 'rgba(245, 158, 11, 0.2)', border: '#f59e0b' }, // Amber
  { background: 'rgba(239, 68, 68, 0.2)', border: '#ef4444' }, // Red
  { background: 'rgba(139, 92, 246, 0.2)', border: '#8b5cf6' } // Purple
]

const chartData = computed<ChartData<'radar'>>(() => ({
  labels: props.labels,
  datasets: props.datasets.map((dataset, index) => {
    const colorSet = colors[index % colors.length]!
    return {
      label: dataset.label,
      data: dataset.data,
      backgroundColor: dataset.color ? `${dataset.color}33` : colorSet.background,
      borderColor: dataset.color || colorSet.border,
      borderWidth: 2,
      pointBackgroundColor: dataset.color || colorSet.border,
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: dataset.color || colorSet.border
    }
  })
}))

const chartOptions = computed<ChartOptions<'radar'>>(() => ({
  plugins: {
    legend: {
      display: props.showLegend
    }
  },
  scales: {
    r: {
      beginAtZero: true,
      max: props.maxValue,
      grid: {
        color: '#374151'
      },
      angleLines: {
        color: '#374151'
      },
      pointLabels: {
        color: '#e5e7eb',
        font: {
          size: 11
        }
      },
      ticks: {
        color: '#9ca3af',
        backdropColor: 'transparent'
      }
    }
  }
}))
</script>

<template>
  <BaseChart
    type="radar"
    :data="chartData"
    :options="chartOptions"
    :height="height"
    :loading="loading"
  />
</template>
