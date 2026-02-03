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
  horizontal?: boolean
  stacked?: boolean
  yAxisLabel?: string
}>(), {
  height: '300px',
  loading: false,
  showLegend: true,
  horizontal: false,
  stacked: false
})

// Color palette for datasets
const colors = [
  { background: 'rgba(59, 130, 246, 0.8)', border: '#3b82f6' }, // Blue
  { background: 'rgba(16, 185, 129, 0.8)', border: '#10b981' }, // Green
  { background: 'rgba(245, 158, 11, 0.8)', border: '#f59e0b' }, // Amber
  { background: 'rgba(239, 68, 68, 0.8)', border: '#ef4444' }, // Red
  { background: 'rgba(139, 92, 246, 0.8)', border: '#8b5cf6' } // Purple
]

const chartData = computed<ChartData<'bar'>>(() => ({
  labels: props.labels,
  datasets: props.datasets.map((dataset, index) => {
    const colorSet = colors[index % colors.length]!
    return {
      label: dataset.label,
      data: dataset.data,
      backgroundColor: dataset.color ? `${dataset.color}CC` : colorSet.background,
      borderColor: dataset.color || colorSet.border,
      borderWidth: 1,
      borderRadius: 4,
      hoverBackgroundColor: dataset.color || colorSet.border
    }
  })
}))

const chartOptions = computed<ChartOptions<'bar'>>(() => ({
  indexAxis: props.horizontal ? 'y' : 'x',
  plugins: {
    legend: {
      display: props.showLegend && props.datasets.length > 1
    }
  },
  scales: {
    x: {
      stacked: props.stacked
    },
    y: {
      stacked: props.stacked,
      title: {
        display: !!props.yAxisLabel,
        text: props.yAxisLabel,
        color: '#9ca3af'
      },
      beginAtZero: true
    }
  }
}))
</script>

<template>
  <BaseChart
    type="bar"
    :data="chartData"
    :options="chartOptions"
    :height="height"
    :loading="loading"
  />
</template>
