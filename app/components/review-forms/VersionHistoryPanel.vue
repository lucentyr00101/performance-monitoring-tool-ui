<script setup lang="ts">
import type { FormVersionHistoryItem } from '~/types/review-form'

/**
 * VersionHistoryPanel — lazy-loads and displays the version history for a review form.
 * Placed on the form detail page, visible to HR/Admin only.
 */
const props = defineProps<{
  formId: string
}>()

const reviewFormsStore = useReviewFormsStore()
const isExpanded = ref(false)
const isLoading = ref(false)
const history = ref<FormVersionHistoryItem[]>([])

/**
 * Fetches version history on first expand (lazy loading).
 */
async function toggleExpand() {
  isExpanded.value = !isExpanded.value

  if (isExpanded.value && history.value.length === 0) {
    isLoading.value = true
    try {
      history.value = await reviewFormsStore.fetchVersionHistory(props.formId)
    }
    catch {
      // Notifications handled by store
    }
    finally {
      isLoading.value = false
    }
  }
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}
</script>

<template>
  <div class="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
    <!-- Panel header - always visible -->
    <button
      class="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gray-800/40 transition-colors"
      @click="toggleExpand"
    >
      <div class="flex items-center gap-2">
        <UIcon name="i-heroicons-clock" class="w-5 h-5 text-gray-400" />
        <h3 class="text-base font-medium text-white">Version History</h3>
      </div>
      <UIcon
        :name="isExpanded ? 'i-heroicons-chevron-up' : 'i-heroicons-chevron-down'"
        class="w-4 h-4 text-gray-500"
      />
    </button>

    <!-- Expanded content -->
    <div v-if="isExpanded" class="border-t border-gray-800">
      <!-- Loading -->
      <div v-if="isLoading" class="p-6 space-y-3">
        <div v-for="i in 3" :key="i" class="flex items-center gap-3 animate-pulse">
          <div class="w-12 h-4 bg-gray-800 rounded" />
          <div class="flex-1 h-4 bg-gray-800 rounded" />
          <div class="w-20 h-4 bg-gray-800 rounded" />
        </div>
      </div>

      <!-- Empty state -->
      <div v-else-if="history.length === 0" class="p-6 text-center text-gray-500">
        <UIcon name="i-heroicons-document-text" class="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p class="text-sm">No version history available.</p>
      </div>

      <!-- History table -->
      <div v-else class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-gray-800">
              <th class="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Version</th>
              <th class="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Changed By</th>
              <th class="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Summary</th>
              <th class="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Date</th>
              <th class="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Reviews Using</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-800">
            <tr
              v-for="item in history"
              :key="item.version"
              class="hover:bg-gray-800/30 transition-colors"
            >
              <td class="px-6 py-3">
                <UBadge color="neutral" variant="subtle" size="xs">v{{ item.version }}</UBadge>
              </td>
              <td class="px-6 py-3 text-gray-300">
                {{ item.changedBy.firstName }} {{ item.changedBy.lastName }}
              </td>
              <td class="px-6 py-3 text-gray-400">
                {{ item.changeSummary || '—' }}
              </td>
              <td class="px-6 py-3 text-gray-500">
                {{ formatDate(item.createdAt) }}
              </td>
              <td class="px-6 py-3 text-right text-gray-400">
                {{ item.reviewsUsing }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
