<script setup lang="ts">
import type { ReviewListItem } from '~/types/review'

interface Props {
  review: ReviewListItem
  showCycle?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showCycle: true
})

const emit = defineEmits<{
  click: [review: ReviewListItem]
}>()

const { formatDate, formatEmployeeName } = useReviews()
</script>

<template>
  <div
    class="group bg-gray-900 border border-gray-800 rounded-lg p-4 hover:border-gray-700 hover:bg-gray-900/80 transition-all duration-200 cursor-pointer"
    @click="emit('click', review)"
  >
    <div class="flex items-start gap-4">
      <!-- Employee Avatar -->
      <UAvatar
        :src="review.employee.avatar_url"
        :alt="formatEmployeeName(review.employee)"
        size="md"
      />

      <!-- Content -->
      <div class="flex-1 min-w-0">
        <!-- Header -->
        <div class="flex items-center justify-between gap-2 mb-1">
          <h4 class="font-medium text-white truncate group-hover:text-primary-400 transition-colors">
            {{ formatEmployeeName(review.employee) }}
          </h4>
          <ReviewsReviewStatusBadge :status="review.status" size="xs" />
        </div>

        <!-- Job Title -->
        <p v-if="review.employee.job_title" class="text-sm text-gray-400 truncate mb-2">
          {{ review.employee.job_title }}
        </p>

        <!-- Tags -->
        <div class="flex items-center gap-2 flex-wrap">
          <ReviewsReviewTypeBadge :type="review.type" size="xs" />
          <span v-if="showCycle" class="text-xs text-gray-500">
            {{ review.cycle.name }}
          </span>
        </div>
      </div>

      <!-- Rating (if available) -->
      <div v-if="review.rating" class="flex items-center gap-1 text-sm">
        <UIcon name="i-heroicons-star-solid" class="w-4 h-4 text-yellow-400" />
        <span class="text-white font-medium">{{ review.rating.toFixed(1) }}</span>
      </div>
    </div>

    <!-- Footer -->
    <div v-if="review.submitted_at" class="mt-3 pt-3 border-t border-gray-800 text-xs text-gray-500">
      Submitted {{ formatDate(review.submitted_at) }}
    </div>
  </div>
</template>
