<script setup lang="ts">
import type { ReviewUpdateRequest } from '~/types/review'

definePageMeta({
  layout: 'default',
  middleware: ['auth']
})

const route = useRoute()
const router = useRouter()
const toast = useToast()

const reviewId = computed(() => route.params.id as string)

const {
  currentReview,
  isLoading,
  error,
  fetchReview,
  submitReview,
  saveDraft,
  acknowledgeReview,
  canEditReview,
  canAcknowledgeReview,
  formatDate,
  formatEmployeeName,
  getRatingLabel
} = useReviews()

// Acknowledge modal
const isAcknowledgeModalOpen = ref(false)
const employeeComments = ref('')
const isAcknowledging = ref(false)

// Fetch review
async function loadData() {
  try {
    await fetchReview(reviewId.value)
  }
  catch {
    // Error handled in store
  }
}

onMounted(loadData)
watch(reviewId, loadData)

// Check permissions
const canEdit = computed(() => currentReview.value ? canEditReview(currentReview.value) : false)
const canAcknowledge = computed(() => currentReview.value ? canAcknowledgeReview(currentReview.value) : false)
const isReadonly = computed(() => !canEdit.value)

// Handle submit
async function handleSubmit(data: ReviewUpdateRequest) {
  if (!currentReview.value) return
  
  try {
    await submitReview(currentReview.value.id, data)
    toast.add({
      title: 'Review Submitted',
      description: 'Your review has been submitted successfully.',
      color: 'success'
    })
    router.push(`/reviews/cycles/${currentReview.value.cycle_id}`)
  }
  catch {
    toast.add({
      title: 'Submission Failed',
      description: 'Failed to submit review. Please try again.',
      color: 'error'
    })
  }
}

// Handle save draft
async function handleSaveDraft(data: ReviewUpdateRequest) {
  if (!currentReview.value) return
  
  try {
    await saveDraft(currentReview.value.id, data)
    toast.add({
      title: 'Draft Saved',
      description: 'Your progress has been saved.',
      color: 'success'
    })
  }
  catch {
    toast.add({
      title: 'Save Failed',
      description: 'Failed to save draft. Please try again.',
      color: 'error'
    })
  }
}

// Handle acknowledge
async function handleAcknowledge() {
  if (!currentReview.value) return
  
  isAcknowledging.value = true
  try {
    await acknowledgeReview(currentReview.value.id, { 
      employee_comments: employeeComments.value.trim() || undefined 
    })
    isAcknowledgeModalOpen.value = false
    toast.add({
      title: 'Review Acknowledged',
      description: 'You have acknowledged this review.',
      color: 'success'
    })
    await loadData()
  }
  catch {
    toast.add({
      title: 'Acknowledgment Failed',
      description: 'Failed to acknowledge review. Please try again.',
      color: 'error'
    })
  }
  finally {
    isAcknowledging.value = false
  }
}

// Handle cancel
function handleCancel() {
  if (currentReview.value) {
    router.push(`/reviews/cycles/${currentReview.value.cycle_id}`)
  } else {
    router.push('/reviews')
  }
}
</script>

<template>
  <div>
    <!-- Back Button -->
    <div class="mb-4">
      <UButton
        variant="ghost"
        color="neutral"
        size="sm"
        @click="handleCancel"
      >
        <UIcon name="i-heroicons-arrow-left" class="w-4 h-4 mr-1" />
        Back
      </UButton>
    </div>

    <!-- Loading -->
    <div v-if="isLoading && !currentReview" class="flex items-center justify-center py-12">
      <div class="flex items-center gap-3 text-gray-400">
        <UIcon name="i-heroicons-arrow-path" class="w-5 h-5 animate-spin" />
        <span>Loading review...</span>
      </div>
    </div>

    <!-- Error -->
    <div v-else-if="error && !currentReview" class="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
      <div class="flex items-center gap-3">
        <UIcon name="i-heroicons-exclamation-triangle" class="w-5 h-5 text-red-400" />
        <div>
          <p class="text-red-400 font-medium">Failed to load review</p>
          <p class="text-red-400/70 text-sm">{{ error }}</p>
        </div>
        <UButton variant="outline" color="error" size="sm" class="ml-auto" @click="loadData">
          Retry
        </UButton>
      </div>
    </div>

    <!-- Content -->
    <template v-else-if="currentReview">
      <div class="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <!-- Header for read-only view -->
        <div v-if="isReadonly" class="mb-6 pb-6 border-b border-gray-800">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <ReviewsReviewTypeBadge :type="currentReview.type" />
              <ReviewsReviewStatusBadge :status="currentReview.status" />
            </div>
            
            <!-- Acknowledge button -->
            <UButton
              v-if="canAcknowledge"
              color="primary"
              @click="isAcknowledgeModalOpen = true"
            >
              <UIcon name="i-heroicons-check-circle" class="w-4 h-4 mr-1" />
              Acknowledge Review
            </UButton>
          </div>
        </div>

        <!-- Review Form (editable or readonly) -->
        <ReviewsReviewForm
          v-if="canEdit"
          :review="currentReview"
          :readonly="false"
          @submit="handleSubmit"
          @save-draft="handleSaveDraft"
          @cancel="handleCancel"
        />

        <!-- Read-only View -->
        <div v-else class="space-y-6">
          <!-- Employee Info -->
          <div class="flex items-center gap-4 pb-6 border-b border-gray-800">
            <UAvatar
              :src="currentReview.employee.avatar_url"
              :alt="formatEmployeeName(currentReview.employee)"
              size="lg"
            />
            <div>
              <h2 class="text-xl font-semibold text-white">
                {{ formatEmployeeName(currentReview.employee) }}
              </h2>
              <p class="text-gray-400">{{ currentReview.employee.job_title }}</p>
              <p class="text-sm text-gray-500 mt-1">{{ currentReview.cycle.name }}</p>
            </div>
          </div>

          <!-- Rating -->
          <div v-if="currentReview.rating" class="bg-gray-800 rounded-lg p-4">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-400 mb-1">Overall Rating</p>
                <p class="text-lg font-medium text-white">{{ getRatingLabel(currentReview.rating) }}</p>
              </div>
              <ReviewsReviewRating
                :rating="currentReview.rating"
                readonly
                size="lg"
              />
            </div>
          </div>

          <!-- Ratings Breakdown -->
          <div v-if="currentReview.ratings_breakdown" class="space-y-3">
            <h3 class="text-sm font-medium text-gray-300">Performance Ratings</h3>
            <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div 
                v-for="(value, key) in currentReview.ratings_breakdown" 
                :key="key"
                class="bg-gray-800/50 rounded-lg p-3"
              >
                <p class="text-xs text-gray-400 capitalize mb-1">{{ String(key).replace('_', ' ') }}</p>
                <div class="flex items-center gap-2">
                  <UIcon name="i-heroicons-star-solid" class="w-4 h-4 text-yellow-400" />
                  <span class="text-white font-medium">{{ value }}</span>
                  <span class="text-gray-500">/5</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Strengths -->
          <div v-if="currentReview.strengths">
            <h3 class="text-sm font-medium text-gray-300 mb-2">Strengths</h3>
            <p class="text-gray-400 bg-gray-800/50 rounded-lg p-4">{{ currentReview.strengths }}</p>
          </div>

          <!-- Areas for Improvement -->
          <div v-if="currentReview.improvements">
            <h3 class="text-sm font-medium text-gray-300 mb-2">Areas for Improvement</h3>
            <p class="text-gray-400 bg-gray-800/50 rounded-lg p-4">{{ currentReview.improvements }}</p>
          </div>

          <!-- Comments -->
          <div v-if="currentReview.comments">
            <h3 class="text-sm font-medium text-gray-300 mb-2">Additional Comments</h3>
            <p class="text-gray-400 bg-gray-800/50 rounded-lg p-4">{{ currentReview.comments }}</p>
          </div>

          <!-- Employee Comments (if acknowledged) -->
          <div v-if="currentReview.employee_comments" class="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
            <h3 class="text-sm font-medium text-blue-400 mb-2">Employee Response</h3>
            <p class="text-gray-300">{{ currentReview.employee_comments }}</p>
          </div>

          <!-- Timestamps -->
          <div class="flex items-center gap-6 text-xs text-gray-500 pt-4 border-t border-gray-800">
            <span v-if="currentReview.submitted_at">
              Submitted: {{ formatDate(currentReview.submitted_at) }}
            </span>
            <span v-if="currentReview.acknowledged_at">
              Acknowledged: {{ formatDate(currentReview.acknowledged_at) }}
            </span>
          </div>
        </div>
      </div>
    </template>

    <!-- Acknowledge Modal -->
    <UModal v-model:open="isAcknowledgeModalOpen">
      <template #content>
        <div class="p-6">
          <h2 class="text-xl font-semibold text-white mb-4">Acknowledge Review</h2>
          
          <p class="text-gray-400 mb-4">
            By acknowledging, you confirm that you have read and understood this performance review.
          </p>

          <UFormField label="Your Comments (Optional)" class="mb-6">
            <UTextarea
              v-model="employeeComments"
              placeholder="Add any comments or feedback..."
              :rows="4"
              class="w-full"
            />
          </UFormField>
          
          <div class="flex items-center justify-end gap-3">
            <UButton
              variant="ghost"
              color="neutral"
              :disabled="isAcknowledging"
              @click="isAcknowledgeModalOpen = false"
            >
              Cancel
            </UButton>
            <UButton
              color="primary"
              :loading="isAcknowledging"
              @click="handleAcknowledge"
            >
              Acknowledge
            </UButton>
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>
