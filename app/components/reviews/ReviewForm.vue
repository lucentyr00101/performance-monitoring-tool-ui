<script setup lang="ts">
import type { Review, ReviewUpdateRequest } from '~/types/review'

interface Props {
  review: Review
  selfAssessment?: Review // For manager view - show employee's self assessment
  readonly?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  readonly: false
})

const emit = defineEmits<{
  submit: [data: ReviewUpdateRequest]
  saveDraft: [data: ReviewUpdateRequest]
  cancel: []
}>()

const { getRatingLabel, formatEmployeeName } = useReviews()

// Form state
const rating = ref(props.review.rating || 0)
const strengths = ref(props.review.strengths || '')
const improvements = ref(props.review.improvements || '')
const comments = ref(props.review.comments || '')

// Ratings breakdown
const technicalSkills = ref(props.review.ratings_breakdown?.technical_skills || 0)
const communication = ref(props.review.ratings_breakdown?.communication || 0)
const teamwork = ref(props.review.ratings_breakdown?.teamwork || 0)
const problemSolving = ref(props.review.ratings_breakdown?.problem_solving || 0)
const initiative = ref(props.review.ratings_breakdown?.initiative || 0)

// Auto-calculate overall rating from breakdown
const calculatedRating = computed(() => {
  const ratings = [technicalSkills.value, communication.value, teamwork.value, problemSolving.value, initiative.value]
  const validRatings = ratings.filter(r => r > 0)
  if (validRatings.length === 0) return 0
  return validRatings.reduce((sum, r) => sum + r, 0) / validRatings.length
})

// Sync calculated rating
watch(calculatedRating, (value) => {
  if (value > 0) {
    rating.value = Math.round(value * 10) / 10
  }
})

const isValid = computed(() => {
  return rating.value > 0 && 
         strengths.value.trim() !== '' && 
         improvements.value.trim() !== ''
})

function getFormData(): ReviewUpdateRequest {
  return {
    rating: rating.value,
    ratings_breakdown: {
      technical_skills: technicalSkills.value,
      communication: communication.value,
      teamwork: teamwork.value,
      problem_solving: problemSolving.value,
      initiative: initiative.value
    },
    strengths: strengths.value.trim(),
    improvements: improvements.value.trim(),
    comments: comments.value.trim() || undefined
  }
}

function handleSubmit() {
  if (!isValid.value) return
  emit('submit', getFormData())
}

function handleSaveDraft() {
  emit('saveDraft', getFormData())
}

const ratingCategories = [
  { key: 'technicalSkills', label: 'Technical Skills', model: technicalSkills },
  { key: 'communication', label: 'Communication', model: communication },
  { key: 'teamwork', label: 'Teamwork', model: teamwork },
  { key: 'problemSolving', label: 'Problem Solving', model: problemSolving },
  { key: 'initiative', label: 'Initiative', model: initiative }
]
</script>

<template>
  <div class="space-y-8">
    <!-- Header with employee info -->
    <div class="flex items-center gap-4 pb-6 border-b border-gray-800">
      <UAvatar
        :src="review.employee.avatar_url"
        :alt="formatEmployeeName(review.employee)"
        size="lg"
      />
      <div>
        <h2 class="text-xl font-semibold text-white">
          {{ formatEmployeeName(review.employee) }}
        </h2>
        <p class="text-gray-400">{{ review.employee.job_title }}</p>
        <div class="flex items-center gap-2 mt-1">
          <ReviewsReviewTypeBadge :type="review.type" size="xs" />
          <span class="text-sm text-gray-500">{{ review.cycle.name }}</span>
        </div>
      </div>
    </div>

    <!-- Self Assessment Reference (for manager view) -->
    <div v-if="selfAssessment && review.type === 'manager'" class="bg-gray-800/50 rounded-lg p-4">
      <h3 class="text-sm font-medium text-gray-300 mb-3">
        <UIcon name="i-heroicons-document-text" class="w-4 h-4 inline mr-1" />
        Employee's Self Assessment
      </h3>
      <div class="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span class="text-gray-400">Self Rating:</span>
          <span class="text-white ml-2">{{ selfAssessment.rating?.toFixed(1) || 'N/A' }}</span>
        </div>
        <div v-if="selfAssessment.strengths">
          <span class="text-gray-400">Strengths:</span>
          <p class="text-gray-300 mt-1">{{ selfAssessment.strengths }}</p>
        </div>
      </div>
    </div>

    <!-- Rating Categories -->
    <div class="space-y-4">
      <h3 class="text-lg font-medium text-white">Performance Ratings</h3>
      
      <div class="grid gap-4">
        <div 
          v-for="category in ratingCategories"
          :key="category.key"
          class="flex items-center justify-between bg-gray-900 rounded-lg p-4"
        >
          <span class="text-gray-300">{{ category.label }}</span>
          <ReviewsReviewRating
            v-model:rating="category.model.value"
            :readonly="readonly"
            :show-value="false"
            size="md"
          />
        </div>
      </div>

      <!-- Overall Rating -->
      <div class="flex items-center justify-between bg-gray-800 rounded-lg p-4 mt-4">
        <div>
          <span class="text-white font-medium">Overall Rating</span>
          <p class="text-sm text-gray-400">{{ getRatingLabel(rating) }}</p>
        </div>
        <div class="flex items-center gap-3">
          <ReviewsReviewRating
            v-model:rating="rating"
            :readonly="readonly"
            size="lg"
          />
        </div>
      </div>
    </div>

    <!-- Strengths -->
    <UFormField label="Strengths" required>
      <UTextarea
        v-model="strengths"
        :readonly="readonly"
        placeholder="Describe key strengths and achievements..."
        :rows="4"
        class="w-full"
      />
      <template #hint>
        <span class="text-gray-500">{{ strengths.length }}/2000 characters</span>
      </template>
    </UFormField>

    <!-- Areas for Improvement -->
    <UFormField label="Areas for Improvement" required>
      <UTextarea
        v-model="improvements"
        :readonly="readonly"
        placeholder="Describe areas where improvement is needed..."
        :rows="4"
        class="w-full"
      />
      <template #hint>
        <span class="text-gray-500">{{ improvements.length }}/2000 characters</span>
      </template>
    </UFormField>

    <!-- Additional Comments -->
    <UFormField label="Additional Comments">
      <UTextarea
        v-model="comments"
        :readonly="readonly"
        placeholder="Any additional feedback or notes..."
        :rows="3"
        class="w-full"
      />
    </UFormField>

    <!-- Actions -->
    <div v-if="!readonly" class="flex items-center justify-between pt-6 border-t border-gray-800">
      <UButton
        variant="ghost"
        color="neutral"
        @click="emit('cancel')"
      >
        Cancel
      </UButton>
      
      <div class="flex items-center gap-3">
        <UButton
          variant="outline"
          color="neutral"
          @click="handleSaveDraft"
        >
          <UIcon name="i-heroicons-bookmark" class="w-4 h-4 mr-1" />
          Save Draft
        </UButton>
        <UButton
          color="primary"
          :disabled="!isValid"
          @click="handleSubmit"
        >
          <UIcon name="i-heroicons-paper-airplane" class="w-4 h-4 mr-1" />
          Submit Review
        </UButton>
      </div>
    </div>
  </div>
</template>
