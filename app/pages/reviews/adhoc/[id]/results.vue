<script setup lang="ts">
import type { AdhocReview } from '~/types/adhoc-review'
import type { FormAnswerValue } from '~/types/review-form'

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
const isAcknowledging = ref(false)
const acknowledgmentComments = ref('')

const currentUser = computed(() => authStore.user)
const isEmployee = computed(() => review.value?.employee?.id === currentUser.value?.employee?.id)
const canAcknowledge = computed(() =>
  isEmployee.value && review.value?.status === 'pending_acknowledgment'
)

// Form sections from snapshot
type FormSection = NonNullable<AdhocReview['formSnapshot']>['sections'][number]
type FormQuestion = FormSection['questions'][number]

const sortedSections = computed(() => {
  if (!review.value?.formSnapshot) return []
  return [...review.value.formSnapshot.sections].sort((a, b) => a.order - b.order)
})

function getSectionQuestions(section: FormSection): FormQuestion[] {
  return [...section.questions].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
}

// Get answers by question ID
function getSelfAnswer(questionId: string): FormAnswerValue | undefined {
  return review.value?.selfReview?.answers?.find(a => a.questionId === questionId)?.value
}

function getManagerAnswer(questionId: string): FormAnswerValue | undefined {
  return review.value?.managerReview?.answers?.find(a => a.questionId === questionId)?.value
}

function formatAnswer(value: FormAnswerValue | undefined, config: FormQuestion['config']): string {
  if (value === undefined || value === null) return 'Not answered'
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  if (Array.isArray(value)) return value.join(', ')
  if (typeof value === 'number' && (config.type === 'rating_scale' || config.type === 'goal_rating')) {
    const label = config.labels?.[value]
    return label ? `${value} - ${label}` : String(value)
  }
  return String(value)
}

// Check for rating discrepancy
function hasDiscrepancy(question: FormQuestion): boolean {
  if (question.config.type !== 'rating_scale' && question.config.type !== 'goal_rating') return false
  const selfVal = getSelfAnswer(question.id)
  const mgrVal = getManagerAnswer(question.id)
  if (typeof selfVal !== 'number' || typeof mgrVal !== 'number') return false
  return Math.abs(selfVal - mgrVal) >= 2
}

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

async function handleAcknowledge() {
  isAcknowledging.value = true
  try {
    await adhocReviewsStore.acknowledgeAdhocReview(reviewId.value, {
      comments: acknowledgmentComments.value || undefined
    })
    router.push(`/reviews/adhoc/${reviewId.value}`)
  } catch {
    // Error handled by store
  } finally {
    isAcknowledging.value = false
  }
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

onMounted(() => {
  loadReview()
})
</script>

<template>
  <div class="px-4 py-8">
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

    <!-- Loading -->
    <div v-if="isLoading" class="space-y-4">
      <div class="bg-gray-900 border border-gray-800 rounded-lg p-6 animate-pulse">
        <div class="w-48 h-6 bg-gray-800 rounded mb-4" />
        <div class="w-full h-4 bg-gray-800 rounded mb-2" />
        <div class="w-3/4 h-4 bg-gray-800 rounded" />
      </div>
    </div>

    <!-- No form snapshot -->
    <div
      v-else-if="review && !review.formSnapshot"
      class="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-8 text-center"
    >
      <UIcon name="i-heroicons-exclamation-triangle" class="w-12 h-12 text-yellow-400 mx-auto mb-4" />
      <h2 class="text-xl font-semibold text-white mb-2">Review Form Unavailable</h2>
      <p class="text-gray-400">The review form data is not available for display.</p>
    </div>

    <!-- Results -->
    <div v-else-if="review" class="space-y-6">
      <!-- Header -->
      <div class="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <h1 class="text-2xl font-bold text-white mb-2">Review Results</h1>
        <p class="text-gray-400">
          {{ review.employee?.firstName }} {{ review.employee?.lastName }}
          — {{ review.employee?.jobTitle }}
        </p>
        <div class="flex items-center gap-4 mt-4 text-sm text-gray-500">
          <span v-if="review.selfReview?.submittedAt">
            Self-review: {{ formatDate(review.selfReview.submittedAt) }}
          </span>
          <span v-if="review.managerReview?.submittedAt">
            Manager evaluation: {{ formatDate(review.managerReview.submittedAt) }}
          </span>
        </div>
      </div>

      <!-- Side-by-side comparison per section -->
      <div
        v-for="section in sortedSections"
        :key="section.id"
        class="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden"
      >
        <div class="bg-gray-800/50 px-6 py-4 border-b border-gray-800">
          <h3 class="text-lg font-medium text-white">{{ section.name }}</h3>
          <p v-if="section.description" class="text-sm text-gray-400 mt-1">{{ section.description }}</p>
        </div>

        <div class="p-6 space-y-6">
          <div
            v-for="question in getSectionQuestions(section)"
            :key="question.id"
            class="space-y-3"
          >
            <div class="flex items-center gap-2">
              <p class="text-sm font-medium text-gray-300">{{ question.text }}</p>
              <UBadge v-if="hasDiscrepancy(question)" color="warning" variant="subtle" size="xs">
                Discrepancy
              </UBadge>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <!-- Self-review answer -->
              <div class="bg-blue-500/5 border border-blue-500/20 rounded-lg p-3">
                <div class="flex items-center gap-2 text-xs text-blue-400 mb-2">
                  <UIcon name="i-heroicons-user" class="w-3 h-3" />
                  Self-Assessment
                </div>
                <p class="text-sm text-gray-300">
                  {{ formatAnswer(getSelfAnswer(question.id), question.config) }}
                </p>
              </div>

              <!-- Manager answer -->
              <div class="bg-primary-500/5 border border-primary-500/20 rounded-lg p-3">
                <div class="flex items-center gap-2 text-xs text-primary-400 mb-2">
                  <UIcon name="i-heroicons-user-group" class="w-3 h-3" />
                  Manager Evaluation
                </div>
                <p class="text-sm text-gray-300">
                  {{ formatAnswer(getManagerAnswer(question.id), question.config) }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Acknowledgment section -->
      <div
        v-if="canAcknowledge"
        class="bg-primary-500/10 border border-primary-500/30 rounded-lg p-6"
      >
        <h3 class="text-lg font-medium text-white mb-4">Acknowledge Review</h3>
        <p class="text-gray-300 mb-4">
          By acknowledging, you confirm that you have reviewed the results above.
          You may add optional comments.
        </p>
        <UTextarea
          v-model="acknowledgmentComments"
          placeholder="Optional comments about the review results..."
          :rows="3"
          class="mb-4"
        />
        <div class="flex justify-end gap-3">
          <UButton
            variant="ghost"
            color="neutral"
            @click="router.push(`/reviews/adhoc/${reviewId}`)"
          >
            Back
          </UButton>
          <UButton
            color="primary"
            :loading="isAcknowledging"
            @click="handleAcknowledge"
          >
            Acknowledge & Complete
          </UButton>
        </div>
      </div>

      <!-- Already completed notice -->
      <div
        v-else-if="review.status === 'completed'"
        class="bg-green-500/10 border border-green-500/30 rounded-lg p-4"
      >
        <div class="flex items-center gap-3">
          <UIcon name="i-heroicons-check-circle" class="w-5 h-5 text-green-400" />
          <div>
            <p class="text-white font-medium">Review Completed</p>
            <p v-if="review.completedAt" class="text-sm text-gray-400">
              Acknowledged on {{ formatDate(review.completedAt) }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
