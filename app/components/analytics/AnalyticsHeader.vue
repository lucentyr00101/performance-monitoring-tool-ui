<script setup lang="ts">
import type { ExportFormat } from '~/types/analytics'

const props = withDefaults(defineProps<{
  title: string
  description?: string
  lastRefreshed?: string | null
  showRefresh?: boolean
  showExport?: boolean
  canExport?: boolean
  loading?: boolean
  exporting?: boolean
}>(), {
  showRefresh: true,
  showExport: true,
  canExport: true,
  loading: false,
  exporting: false
})

const emit = defineEmits<{
  refresh: []
  export: [format: ExportFormat]
}>()

// Export dropdown state
const exportOpen = ref(false)

// Format last refreshed time
const formattedLastRefreshed = computed(() => {
  if (!props.lastRefreshed) return 'Never'

  const date = new Date(props.lastRefreshed)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins} min ago`

  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours}h ago`

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  })
})

// Export format options
const exportOptions = [
  { label: 'PDF Report', value: 'pdf', icon: 'heroicons:document' },
  { label: 'CSV File', value: 'csv', icon: 'heroicons:table-cells' },
  { label: 'Excel File', value: 'excel', icon: 'heroicons:document-chart-bar' }
]

function handleExport(format: ExportFormat) {
  exportOpen.value = false
  emit('export', format)
}
</script>

<template>
  <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
    <div>
      <h1 class="text-2xl font-bold text-white">{{ title }}</h1>
      <p v-if="description" class="text-gray-400 mt-1">{{ description }}</p>
      <p v-if="showRefresh && lastRefreshed" class="text-sm text-gray-500 mt-1">
        Last updated: {{ formattedLastRefreshed }}
      </p>
    </div>

    <div class="flex items-center gap-3">
      <!-- Refresh button -->
      <UButton
        v-if="showRefresh"
        variant="ghost"
        color="neutral"
        icon="heroicons:arrow-path"
        :loading="loading"
        :disabled="loading"
        @click="emit('refresh')"
      >
        Refresh
      </UButton>

      <!-- Export dropdown -->
      <UDropdownMenu
        v-if="showExport && canExport"
        v-model:open="exportOpen"
        :items="exportOptions.map(opt => ({
          label: opt.label,
          icon: opt.icon,
          disabled: exporting,
          onSelect: () => handleExport(opt.value as ExportFormat)
        }))"
      >
        <UButton
          color="primary"
          variant="soft"
          icon="heroicons:arrow-down-tray"
          :loading="exporting"
          :disabled="exporting || loading"
        >
          Export
        </UButton>
      </UDropdownMenu>
    </div>
  </div>
</template>
