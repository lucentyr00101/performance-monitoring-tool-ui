<script setup lang="ts">
import type { AdhocReview } from '~/types/adhoc-review'
import type { ReviewFormResponse } from '~/types/review-form'

definePageMeta({
  layout: 'default',
  middleware: ['auth']
})

const route = useRoute()
const router = useRouter()
const toast = useToast()
const adhocReviewsStore = useAdhocReviewsStore()
const authStore = useAuthStore()

const reviewId = computed(() => route.params.id as string)
const review = ref<AdhocReview | null>(null)
const isLoading = ref(true)
const isSubmitting = ref(false)
const isSavingDraft = ref(false)

// User permissions
const currentUser = computed(() => authStore.user)
const isEmployee = computed(() => review.value?.employee.id === currentUser.value?.id)
const isViewOnly = computed(() => {
  if (!review.value) return true
  // View only if already submitted or user is not the employee
  return review.value.selfReview?.status === 'submitted' || !isEmployee.value
})

// Load review
async function loadReview() {
  isLoading.value = true
  try {
    review.value = await adhocReviewsStore.fetchAdhocReview(reviewId.value)
  } catch {
    // Notification handled by store
    router.push('/reviews/adhoc')
  } finally {
    isLoading.value = false
  }
}

// Submit self-review
async function handleSubmit(_responses: ReviewFormResponse[]) {
  isSubmitting.value = true
  try {
    // In a real app, this would call the API with _responses
    // For now, simulate a successful submission
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    toast.add({
      title: 'Self-Review Submitted',
      description: 'Your self-review has been submitted successfully',
      color: 'success'
    })
    
    // Navigate back to review detail
    router.push(`/reviews/adhoc/${reviewId.value}`)
  } catch {
    toast.add({
      title: 'Failed to submit',
      description: 'An error occurred while submitting your self-review',
      color: 'error'
    })
  } finally {
    isSubmitting.value = false
  }
}

// Save draft
async function handleSaveDraft(_responses: ReviewFormResponse[]) {
  isSavingDraft.value = true
  try {
    // In a real app, this would call the API with _responses
    await new Promise(resolve => setTimeout(resolve, 500))
    
    toast.add({
      title: 'Draft Saved',
      description: 'Your progress has been saved',
      color: 'success'
    })
  } catch {
    toast.add({
      title: 'Failed to save draft',
      color: 'error'
    })
  } finally {
    isSavingDraft.value = false
  }
}

// Load on mount
onMounted(() => {
  loadReview()
})
</script>

<template>
  <div class="container mx-auto px-4 py-8 max-w-4xl">
    <!-- Back button -->
    <UButton
      variant="ghost"
      color="neutral"
      icon="i-heroicons-arrow-left"
      class="mb-6"
      @click="router.push(`/reviews/adhoc/${reviewId}`)"
    >
      Back to Review
    </UButton>

    <!-- Loading state -->
    <div v-if="isLoading" class="space-y-4">
      <div class="bg-gray-900 border border-gray-800 rounded-lg p-6 animate-pulse">
        <div class="w-48 h-6 bg-gray-800 rounded mb-4" />
        <div class="w-full h-4 bg-gray-800 rounded mb-2" />
        <div class="w-3/4 h-4 bg-gray-800 rounded" />
      </div>
    </div>

    <!-- Not authorized -->
    <div 
      v-else-if="review && !isEmployee && !isViewOnly"
      class="bg-red-500/10 border border-red-500/30 rounded-lg p-8 text-center"
    >
      <UIcon name="i-heroicons-exclamation-triangle" class="w-12 h-12 text-red-400 mx-auto mb-4" />
      <h2 class="text-xl font-semibold text-white mb-2">Access Denied</h2>
      <p class="text-gray-400">
        You are not authorized to complete this self-review.
      </p>
    </div>

    <!-- View mode notice -->
    <div 
      v-else-if="review && isViewOnly && review.selfReview?.status === 'submitted'"
      class="mb-6 bg-blue-500/10 border border-blue-500/30 rounded-lg p-4"
    >
      <div class="flex items-center gap-3">
        <UIcon name="i-heroicons-eye" class="w-5 h-5 text-blue-400" />
        <div>
          <p class="text-white font-medium">Viewing Submitted Self-Review</p>
          <p class="text-sm text-gray-400">
            This self-review was submitted on 
            {{ new Date(review.selfReview.submittedAt!).toLocaleDateString() }}
          </p>
        </div>
      </div>
    </div>

    <!-- Self-Review Form -->
    <div v-if="review">
      <SelfReviewForm
        :review="review"
        :disabled="isViewOnly || isSubmitting"
        @submit="handleSubmit"
        @save-draft="handleSaveDraft"
      />
    </div>
  </div>
</template>
