<script setup lang="ts">
import type { AdhocReview } from '~/types/adhoc-review'
import type { FormAnswer } from '~/types/review-form'

definePageMeta({
  layout: 'default',
  middleware: ['auth']
})

const route = useRoute()
const router = useRouter()
const adhocReviewsStore = useAdhocReviewsStore()
const authStore = useAuthStore()

const reviewId = computed(() => route.params.id as string)
const review = ref<AdhocReview | null>(null)
const isLoading = ref(true)
const isSubmitting = ref(false)
const isSavingDraft = ref(false)
const formDirty = ref(false)
const lastDraftResponses = ref<FormAnswer[]>([])

// User permissions — compare employee entity IDs, not user account IDs
const currentUser = computed(() => authStore.user)
const isEmployee = computed(() => review.value?.employee.id === currentUser.value?.employee?.id)
const isViewOnly = computed(() => {
  if (!review.value) return true
  return review.value.selfReview?.status === 'submitted' || !isEmployee.value
})

// Unsaved changes guard
useUnsavedChanges(() => formDirty.value && !isViewOnly.value)

// Auto-save
const { statusText: autoSaveStatus } = useAutoSave({
  interval: 30000,
  enabled: computed(() => !isViewOnly.value && lastDraftResponses.value.length > 0),
  async onSave() {
    if (lastDraftResponses.value.length > 0) {
      await adhocReviewsStore.submitSelfReview(reviewId.value, {
        answers: lastDraftResponses.value,
        status: 'in_progress'
      })
      formDirty.value = false
    }
  }
})

// Load review
async function loadReview() {
  isLoading.value = true
  try {
    review.value = await adhocReviewsStore.fetchAdhocReview(reviewId.value)
  } catch {
    router.push('/reviews/adhoc')
  } finally {
    isLoading.value = false
  }
}

// Submit self-review
async function handleSubmit(responses: FormAnswer[]) {
  isSubmitting.value = true
  try {
    await adhocReviewsStore.submitSelfReview(reviewId.value, {
      answers: responses,
      status: 'submitted'
    })
    formDirty.value = false
    router.push(`/reviews/adhoc/${reviewId.value}`)
  } catch {
    // Error handled by store
  } finally {
    isSubmitting.value = false
  }
}

// Save draft
async function handleSaveDraft(responses: FormAnswer[]) {
  isSavingDraft.value = true
  try {
    await adhocReviewsStore.submitSelfReview(reviewId.value, {
      answers: responses,
      status: 'in_progress'
    })
    formDirty.value = false
  } catch {
    // Error handled by store
  } finally {
    isSavingDraft.value = false
  }
}

// Track form changes for auto-save
function handleFormChange(responses: FormAnswer[]) {
  formDirty.value = true
  lastDraftResponses.value = responses
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
    <div v-if="isLoading" class="space-y-6">
      <!-- Form header skeleton -->
      <div class="bg-gray-900 border border-gray-800 rounded-lg p-6 animate-pulse">
        <div class="w-48 h-6 bg-gray-800 rounded mb-4" />
        <div class="w-full h-4 bg-gray-800 rounded mb-2" />
        <div class="w-3/4 h-4 bg-gray-800 rounded" />
      </div>
      <!-- Section skeletons -->
      <div v-for="n in 3" :key="n" class="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden animate-pulse">
        <div class="bg-gray-800/50 px-6 py-4 border-b border-gray-800">
          <div class="w-32 h-5 bg-gray-700 rounded" />
        </div>
        <div class="p-6 space-y-4">
          <div v-for="q in 2" :key="q" class="space-y-2">
            <div class="w-40 h-4 bg-gray-800 rounded" />
            <div class="w-full h-10 bg-gray-800 rounded" />
          </div>
        </div>
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

    <!-- Auto-save status -->
    <div v-if="autoSaveStatus && !isViewOnly" class="text-xs text-gray-500 mb-2 text-right">
      {{ autoSaveStatus }}
    </div>

    <!-- Self-Review Form -->
    <div v-if="review">
      <SelfReviewForm
        :review="review"
        :disabled="isViewOnly || isSubmitting"
        @submit="handleSubmit"
        @save-draft="(responses) => { handleFormChange(responses); handleSaveDraft(responses) }"
      />
    </div>
  </div>
</template>
