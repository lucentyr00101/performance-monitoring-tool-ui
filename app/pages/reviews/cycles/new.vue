<script setup lang="ts">
import type { ReviewCycleCreateRequest } from '~/types/review'

definePageMeta({
  layout: 'default',
  middleware: ['auth']
})

const router = useRouter()
const toast = useToast()

const {
  createCycle,
  canCreateCycle
} = useReviews()

// Check if user can create cycles
const canCreate = computed(() => canCreateCycle())

const isCreating = ref(false)

// Handle create cycle
async function handleCreateCycle(data: ReviewCycleCreateRequest) {
  isCreating.value = true
  try {
    const cycle = await createCycle(data)
    toast.add({
      title: 'Review Cycle Created',
      description: `"${cycle.name}" has been created as a draft.`,
      color: 'success'
    })
    router.push(`/reviews/cycles/${cycle.id}`)
  }
  catch {
    toast.add({
      title: 'Creation Failed',
      description: 'Failed to create review cycle. Please try again.',
      color: 'error'
    })
  }
  finally {
    isCreating.value = false
  }
}

// Handle cancel
function handleCancel() {
  router.push('/reviews')
}

// Redirect if user cannot create
onMounted(() => {
  if (!canCreate.value) {
    toast.add({
      title: 'Access Denied',
      description: 'You do not have permission to create review cycles.',
      color: 'error'
    })
    router.push('/reviews')
  }
})
</script>

<template>
  <div>
    <!-- Page Header -->
    <div class="mb-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-white">Create Review Cycle</h1>
          <p class="text-gray-400 mt-1">Set up a new performance review cycle</p>
        </div>
        <UButton
          variant="ghost"
          color="neutral"
          @click="handleCancel"
        >
          <UIcon name="i-heroicons-x-mark" class="w-4 h-4 mr-1" />
          Cancel
        </UButton>
      </div>
    </div>

    <!-- Access Denied -->
    <div v-if="!canCreate" class="text-center py-12">
      <div class="bg-red-500/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
        <UIcon name="i-heroicons-exclamation-triangle" class="w-8 h-8 text-red-400" />
      </div>
      <h3 class="text-lg font-medium text-white mb-2">Access Denied</h3>
      <p class="text-gray-400 mb-4">
        You do not have permission to create review cycles.
      </p>
      <UButton color="primary" @click="handleCancel">
        Back to Reviews
      </UButton>
    </div>

    <!-- Form -->
    <div v-else class="max-w-2xl">
      <UCard class="bg-gray-900 ring-gray-800">
        <ReviewsReviewCycleForm
          mode="create"
          @submit="handleCreateCycle"
          @cancel="handleCancel"
        />
      </UCard>
    </div>
  </div>
</template>
