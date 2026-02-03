<script setup lang="ts">
import type { ExportFormat, AnalyticsType, ExportOptions } from '~/types/analytics'

const props = withDefaults(defineProps<{
  open: boolean
  analyticsType: AnalyticsType
  loading?: boolean
}>(), {
  loading: false
})

const emit = defineEmits<{
  'update:open': [value: boolean]
  export: [options: ExportOptions]
}>()

// Form state
const selectedFormat = ref<ExportFormat>('pdf')
const includeCharts = ref(true)
const includeRawData = ref(false)
const includeSummary = ref(true)

// Reset form when modal opens
watch(() => props.open, (isOpen) => {
  if (isOpen) {
    selectedFormat.value = 'pdf'
    includeCharts.value = true
    includeRawData.value = false
    includeSummary.value = true
  }
})

// Format options
const formatOptions = [
  {
    value: 'pdf',
    label: 'PDF Report',
    description: 'Best for sharing and printing',
    icon: 'heroicons:document'
  },
  {
    value: 'csv',
    label: 'CSV File',
    description: 'Raw data for spreadsheets',
    icon: 'heroicons:table-cells'
  },
  {
    value: 'excel',
    label: 'Excel File',
    description: 'Formatted spreadsheet with charts',
    icon: 'heroicons:document-chart-bar'
  }
]

// Analytics type labels
const typeLabels: Record<AnalyticsType, string> = {
  goals: 'Goal Analytics',
  performance: 'Performance Analytics',
  reviews: 'Review Cycle Analytics',
  team: 'Team Analytics',
  employee: 'My Analytics'
}

function handleExport() {
  emit('export', {
    format: selectedFormat.value,
    type: props.analyticsType,
    filters: {},
    includeCharts: includeCharts.value,
    includeRawData: includeRawData.value,
    includeSummary: includeSummary.value
  })
}

function closeModal() {
  emit('update:open', false)
}
</script>

<template>
  <UModal :open="open" @update:open="emit('update:open', $event)">
    <template #header>
      <div class="flex items-center gap-3">
        <div class="p-2 bg-primary-500/10 rounded-lg">
          <UIcon name="heroicons:arrow-down-tray" class="w-5 h-5 text-primary-400" />
        </div>
        <div>
          <h3 class="text-lg font-semibold text-white">Export {{ typeLabels[analyticsType] }}</h3>
          <p class="text-sm text-gray-400">Choose format and options</p>
        </div>
      </div>
    </template>

    <template #body>
      <div class="space-y-6">
        <!-- Format selection -->
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-3">Export Format</label>
          <div class="space-y-2">
            <div
              v-for="option in formatOptions"
              :key="option.value"
              class="flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors"
              :class="selectedFormat === option.value
                ? 'bg-primary-500/10 border border-primary-500/50'
                : 'bg-gray-800 border border-gray-700 hover:border-gray-600'"
              @click="selectedFormat = option.value as ExportFormat"
            >
              <div
                class="p-2 rounded-lg"
                :class="selectedFormat === option.value ? 'bg-primary-500/20' : 'bg-gray-700'"
              >
                <UIcon
                  :name="option.icon"
                  class="w-5 h-5"
                  :class="selectedFormat === option.value ? 'text-primary-400' : 'text-gray-400'"
                />
              </div>
              <div class="flex-1">
                <p
                  class="font-medium"
                  :class="selectedFormat === option.value ? 'text-white' : 'text-gray-300'"
                >
                  {{ option.label }}
                </p>
                <p class="text-sm text-gray-500">{{ option.description }}</p>
              </div>
              <UIcon
                v-if="selectedFormat === option.value"
                name="heroicons:check-circle-solid"
                class="w-5 h-5 text-primary-400"
              />
            </div>
          </div>
        </div>

        <!-- Include options -->
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-3">Include in Export</label>
          <div class="space-y-3">
            <label class="flex items-center gap-3 cursor-pointer">
              <UCheckbox v-model="includeSummary" />
              <div>
                <span class="text-gray-300">Summary metrics</span>
                <p class="text-sm text-gray-500">Key performance indicators and totals</p>
              </div>
            </label>
            <label class="flex items-center gap-3 cursor-pointer">
              <UCheckbox v-model="includeCharts" :disabled="selectedFormat === 'csv'" />
              <div>
                <span class="text-gray-300" :class="{ 'opacity-50': selectedFormat === 'csv' }">
                  Charts and visualizations
                </span>
                <p class="text-sm text-gray-500" :class="{ 'opacity-50': selectedFormat === 'csv' }">
                  {{ selectedFormat === 'csv' ? 'Not available for CSV format' : 'Visual representations of data' }}
                </p>
              </div>
            </label>
            <label class="flex items-center gap-3 cursor-pointer">
              <UCheckbox v-model="includeRawData" />
              <div>
                <span class="text-gray-300">Raw data tables</span>
                <p class="text-sm text-gray-500">Detailed breakdown of all data points</p>
              </div>
            </label>
          </div>
        </div>
      </div>
    </template>

    <template #footer>
      <div class="flex justify-end gap-3">
        <UButton
          variant="ghost"
          color="neutral"
          :disabled="loading"
          @click="closeModal"
        >
          Cancel
        </UButton>
        <UButton
          color="primary"
          :loading="loading"
          :disabled="loading"
          icon="heroicons:arrow-down-tray"
          @click="handleExport"
        >
          Export
        </UButton>
      </div>
    </template>
  </UModal>
</template>
