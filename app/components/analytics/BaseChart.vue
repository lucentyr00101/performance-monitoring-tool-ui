<script setup lang="ts">
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
)

export type ChartType = 'line' | 'bar' | 'doughnut' | 'radar'

const props = withDefaults(defineProps<{
  type: ChartType
  data: unknown
  options?: Record<string, unknown>
  height?: string
  loading?: boolean
}>(), {
  height: '300px',
  loading: false
})

// Dark theme colors
const darkThemeColors = {
  text: '#e5e7eb',
  textMuted: '#9ca3af',
  gridLines: '#374151',
  background: '#111827'
}

// Default options with dark theme
const defaultOptions = computed(() => {
  const baseOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: darkThemeColors.text,
          padding: 16,
          usePointStyle: true
        }
      },
      tooltip: {
        backgroundColor: '#1f2937',
        titleColor: darkThemeColors.text,
        bodyColor: darkThemeColors.textMuted,
        borderColor: '#374151',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8
      }
    }
  }

  // Add scales for non-circular charts
  if (props.type === 'line' || props.type === 'bar') {
    return {
      ...baseOptions,
      scales: {
        x: {
          grid: {
            color: darkThemeColors.gridLines,
            display: false
          },
          ticks: {
            color: darkThemeColors.textMuted
          }
        },
        y: {
          grid: {
            color: darkThemeColors.gridLines
          },
          ticks: {
            color: darkThemeColors.textMuted
          }
        }
      }
    }
  }

  if (props.type === 'radar') {
    return {
      ...baseOptions,
      scales: {
        r: {
          grid: {
            color: darkThemeColors.gridLines
          },
          pointLabels: {
            color: darkThemeColors.text
          },
          ticks: {
            color: darkThemeColors.textMuted,
            backdropColor: 'transparent'
          }
        }
      }
    }
  }

  return baseOptions
})

const mergedOptions = computed(() => ({
  ...defaultOptions.value,
  ...props.options
}))
</script>

<template>
  <div class="relative" :style="{ height }">
    <!-- Loading skeleton -->
    <template v-if="loading">
      <div class="absolute inset-0 flex items-center justify-center">
        <USkeleton class="w-full h-full rounded-lg" />
      </div>
    </template>

    <!-- Chart content -->
    <template v-else>
      <ClientOnly>
        <component
          :is="type === 'line' ? defineAsyncComponent(() => import('vue-chartjs').then(m => m.Line)) :
               type === 'bar' ? defineAsyncComponent(() => import('vue-chartjs').then(m => m.Bar)) :
               type === 'doughnut' ? defineAsyncComponent(() => import('vue-chartjs').then(m => m.Doughnut)) :
               defineAsyncComponent(() => import('vue-chartjs').then(m => m.Radar))"
          :data="(data as any)"
          :options="(mergedOptions as any)"
        />
        <template #fallback>
          <div class="w-full h-full flex items-center justify-center bg-gray-800/50 rounded-lg">
            <UIcon name="heroicons:chart-bar" class="w-8 h-8 text-gray-500" />
          </div>
        </template>
      </ClientOnly>
    </template>
  </div>
</template>
