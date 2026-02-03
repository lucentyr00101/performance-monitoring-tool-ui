<script setup lang="ts">
import type { ChartData, ChartOptions } from 'chart.js'

const props = withDefaults(defineProps<{
  labels: string[]
  datasets: {
    label: string
    data: number[]
    color?: string
    fill?: boolean
  }[]
  height?: string
  loading?: boolean
  showLegend?: boolean
  yAxisLabel?: string
  smooth?: boolean
}>(), {
  height: '300px',
  loading: false,
  showLegend: true,
  smooth: true
})

// Color palette for datasets
const colors = [
  { border: '#3b82f6', background: 'rgba(59, 130, 246, 0.1)' }, // Blue
  { border: '#10b981', background: 'rgba(16, 185, 129, 0.1)' }, // Green
  { border: '#f59e0b', background: 'rgba(245, 158, 11, 0.1)' }, // Amber
  { border: '#ef4444', background: 'rgba(239, 68, 68, 0.1)' }, // Red
  { border: '#8b5cf6', background: 'rgba(139, 92, 246, 0.1)' } // Purple
]

const chartData = computed<ChartData<'line'>>(() => ({
  labels: props.labels,
  datasets: props.datasets.map((dataset, index) => {
    const colorSet = colors[index % colors.length]!
    return {
      label: dataset.label,
      data: dataset.data,
      borderColor: dataset.color || colorSet.border,
      backgroundColor: dataset.fill ? (dataset.color ? `${dataset.color}1A` : colorSet.background) : 'transparent',
      fill: dataset.fill ?? false,
      tension: props.smooth ? 0.4 : 0,
      pointRadius: 4,
      pointHoverRadius: 6,
      pointBackgroundColor: dataset.color || colorSet.border,
      borderWidth: 2
    }
  })
}))

const chartOptions = computed<ChartOptions<'line'>>(() => ({
  plugins: {
    legend: {
      display: props.showLegend
    }
  },
  scales: {
    y: {
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
    type="line"
    :data="chartData"
    :options="chartOptions"
    :height="height"
    :loading="loading"
  />
</template>
