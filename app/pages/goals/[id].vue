<script setup lang="ts">
import type { KeyResult, KeyResultCreateRequest, KeyResultUpdateRequest, GoalUpdateRequest } from '~/types/goal'

definePageMeta({
  layout: 'default',
  middleware: ['auth']
})

const route = useRoute()
const router = useRouter()
const toast = useToast()

const goalId = computed(() => route.params.id as string)

const {
  currentGoal,
  isLoading,
  error,
  currentGoalKeyResultsCompleted,
  currentGoalKeyResultsTotal,
  currentGoalProgressIndicator,
  fetchGoal,
  updateGoal,
  deleteGoal,
  submitForApproval,
  approveGoal,
  rejectGoal,
  addKeyResult,
  updateKeyResult,
  deleteKeyResult,
  canEditGoal,
  canDeleteGoal,
  canApproveGoal,
  canUpdateProgress,
  formatDueDate,
  isOverdue,
  getDaysRemaining,
  clearCurrentGoal
} = useGoals()

// Fetch goal on mount
onMounted(async () => {
  await fetchGoal(goalId.value)
})

// Clean up on unmount
onUnmounted(() => {
  clearCurrentGoal()
})

// Computed permissions
const canEdit = computed(() => currentGoal.value ? canEditGoal(currentGoal.value) : false)
const canDelete = computed(() => currentGoal.value ? canDeleteGoal(currentGoal.value) : false)
const canApprove = computed(() => currentGoal.value ? canApproveGoal(currentGoal.value) : false)
const canProgress = computed(() => currentGoal.value ? canUpdateProgress(currentGoal.value) : false)

// Edit modal state
const isEditModalOpen = ref(false)
const isDeleting = ref(false)

// Key result modal state
const isKeyResultModalOpen = ref(false)
const editingKeyResult = ref<KeyResult | null>(null)
const isEditingKeyResult = computed(() => editingKeyResult.value !== null)

// Approval modal state
const isApprovalModalOpen = ref(false)
const approvalAction = ref<'approve' | 'reject'>('approve')
const approvalComment = ref('')

// Handle goal update
async function handleUpdateGoal(data: GoalUpdateRequest) {
  if (!currentGoal.value) return
  
  try {
    await updateGoal(goalId.value, data)
    isEditModalOpen.value = false
    toast.add({
      title: 'Goal Updated',
      description: 'Your changes have been saved.',
      color: 'success'
    })
  }
  catch {
    toast.add({
      title: 'Update Failed',
      description: 'Failed to update goal. Please try again.',
      color: 'error'
    })
  }
}

// Handle goal delete
async function handleDeleteGoal() {
  if (!currentGoal.value) return
  
  isDeleting.value = true
  try {
    await deleteGoal(goalId.value)
    toast.add({
      title: 'Goal Deleted',
      description: currentGoal.value.status === 'draft' ? 'The goal has been deleted.' : 'The goal has been cancelled.',
      color: 'success'
    })
    router.push('/goals')
  }
  catch {
    toast.add({
      title: 'Delete Failed',
      description: 'Failed to delete goal. Please try again.',
      color: 'error'
    })
  }
  finally {
    isDeleting.value = false
  }
}

// Handle submit for approval
async function handleSubmitForApproval() {
  try {
    await submitForApproval(goalId.value)
    toast.add({
      title: 'Goal Submitted',
      description: 'Your goal has been submitted for approval.',
      color: 'success'
    })
  }
  catch {
    toast.add({
      title: 'Submission Failed',
      description: 'Failed to submit goal. Please try again.',
      color: 'error'
    })
  }
}

// Handle approval action
async function handleApproval() {
  try {
    if (approvalAction.value === 'approve') {
      await approveGoal(goalId.value, approvalComment.value || undefined)
      toast.add({
        title: 'Goal Approved',
        description: 'The goal has been approved and is now active.',
        color: 'success'
      })
    } else {
      await rejectGoal(goalId.value, approvalComment.value)
      toast.add({
        title: 'Goal Rejected',
        description: 'The goal has been returned to draft status.',
        color: 'warning'
      })
    }
    isApprovalModalOpen.value = false
    approvalComment.value = ''
  }
  catch {
    toast.add({
      title: 'Action Failed',
      description: 'Failed to process approval. Please try again.',
      color: 'error'
    })
  }
}

// Handle add key result
async function handleAddKeyResult(data: KeyResultCreateRequest) {
  try {
    await addKeyResult(goalId.value, data)
    isKeyResultModalOpen.value = false
    toast.add({
      title: 'Key Result Added',
      description: 'New key result has been added.',
      color: 'success'
    })
  }
  catch {
    toast.add({
      title: 'Failed',
      description: 'Failed to add key result.',
      color: 'error'
    })
  }
}

// Handle update key result
async function handleUpdateKeyResult(data: KeyResultUpdateRequest) {
  if (!editingKeyResult.value) return
  
  try {
    await updateKeyResult(goalId.value, editingKeyResult.value.id, data)
    editingKeyResult.value = null
    toast.add({
      title: 'Key Result Updated',
      color: 'success'
    })
  }
  catch {
    toast.add({
      title: 'Update Failed',
      color: 'error'
    })
  }
}

// Handle edit key result click
function handleEditKeyResult(kr: KeyResult) {
  editingKeyResult.value = kr
}

// Handle delete key result
async function handleDeleteKeyResult(krId: string) {
  try {
    await deleteKeyResult(goalId.value, krId)
    toast.add({
      title: 'Key Result Deleted',
      color: 'success'
    })
  }
  catch {
    toast.add({
      title: 'Delete Failed',
      color: 'error'
    })
  }
}

// Open approval modal
function openApprovalModal(action: 'approve' | 'reject') {
  approvalAction.value = action
  approvalComment.value = ''
  isApprovalModalOpen.value = true
}
</script>

<template>
  <div>
    <!-- Loading State -->
    <div v-if="isLoading && !currentGoal" class="flex items-center justify-center py-12">
      <div class="flex items-center gap-3 text-gray-400">
        <UIcon name="i-heroicons-arrow-path" class="w-5 h-5 animate-spin" />
        <span>Loading goal...</span>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-500/10 border border-red-500/20 rounded-lg p-6 text-center">
      <UIcon name="i-heroicons-exclamation-triangle" class="w-12 h-12 text-red-400 mx-auto mb-4" />
      <h3 class="text-lg font-medium text-white mb-2">Failed to load goal</h3>
      <p class="text-gray-400 mb-4">{{ error }}</p>
      <div class="flex items-center justify-center gap-3">
        <UButton variant="outline" color="neutral" @click="router.push('/goals')">
          Back to Goals
        </UButton>
        <UButton color="primary" @click="fetchGoal(goalId)">
          Retry
        </UButton>
      </div>
    </div>

    <!-- Goal Content -->
    <div v-else-if="currentGoal">
      <!-- Breadcrumb -->
      <div class="mb-6">
        <NuxtLink to="/goals" class="text-gray-400 hover:text-white transition-colors flex items-center gap-1">
          <UIcon name="i-heroicons-arrow-left" class="w-4 h-4" />
          Back to Goals
        </NuxtLink>
      </div>

      <!-- Header -->
      <div class="bg-gray-900 border border-gray-800 rounded-lg p-6 mb-6">
        <div class="flex items-start justify-between gap-4">
          <div class="flex-1">
            <!-- Badges -->
            <div class="flex items-center gap-2 mb-3">
              <GoalsGoalTypeBadge :type="currentGoal.type" />
              <GoalsGoalStatusBadge :status="currentGoal.status" />
              <GoalsGoalPriorityBadge v-if="currentGoal.priority" :priority="currentGoal.priority" />
            </div>

            <!-- Title -->
            <h1 class="text-2xl font-bold text-white mb-2">{{ currentGoal.title }}</h1>

            <!-- Description -->
            <p v-if="currentGoal.description" class="text-gray-400 mb-4">
              {{ currentGoal.description }}
            </p>

            <!-- Meta -->
            <div class="flex flex-wrap items-center gap-4 text-sm text-gray-400">
              <!-- Owner -->
              <div class="flex items-center gap-2">
                <UAvatar :src="currentGoal.owner.avatar_url" :alt="currentGoal.owner.name || `${currentGoal.owner.first_name} ${currentGoal.owner.last_name}`" size="xs" />
                <span>{{ currentGoal.owner.name || `${currentGoal.owner.first_name} ${currentGoal.owner.last_name}` }}</span>
              </div>

              <!-- Due Date -->
              <div class="flex items-center gap-1.5" :class="isOverdue(currentGoal) ? 'text-red-400' : ''">
                <UIcon name="i-heroicons-calendar" class="w-4 h-4" />
                <span>Due {{ formatDueDate(currentGoal.due_date) }}</span>
                <span v-if="currentGoal.status === 'active'" class="text-xs">
                  ({{ getDaysRemaining(currentGoal) }} days left)
                </span>
              </div>

              <!-- Parent Goal -->
              <NuxtLink
                v-if="currentGoal.parent_goal"
                :to="`/goals/${currentGoal.parent_goal.id}`"
                class="flex items-center gap-1.5 hover:text-primary-400 transition-colors"
              >
                <UIcon name="i-heroicons-arrow-up-circle" class="w-4 h-4" />
                <span>{{ currentGoal.parent_goal.title }}</span>
              </NuxtLink>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex items-center gap-2">
            <!-- Submit for approval (draft only) -->
            <UButton
              v-if="currentGoal.status === 'draft' && canEdit"
              variant="outline"
              color="primary"
              @click="handleSubmitForApproval"
            >
              <UIcon name="i-heroicons-paper-airplane" class="w-4 h-4 mr-1" />
              Submit for Approval
            </UButton>

            <!-- Approval actions (pending only) -->
            <template v-if="canApprove">
              <UButton
                color="success"
                @click="openApprovalModal('approve')"
              >
                <UIcon name="i-heroicons-check" class="w-4 h-4 mr-1" />
                Approve
              </UButton>
              <UButton
                variant="outline"
                color="error"
                @click="openApprovalModal('reject')"
              >
                <UIcon name="i-heroicons-x-mark" class="w-4 h-4 mr-1" />
                Reject
              </UButton>
            </template>

            <!-- Edit -->
            <UButton
              v-if="canEdit"
              variant="outline"
              color="neutral"
              @click="isEditModalOpen = true"
            >
              <UIcon name="i-heroicons-pencil" class="w-4 h-4" />
            </UButton>

            <!-- Delete -->
            <UButton
              v-if="canDelete"
              variant="outline"
              color="error"
              :loading="isDeleting"
              @click="handleDeleteGoal"
            >
              <UIcon name="i-heroicons-trash" class="w-4 h-4" />
            </UButton>
          </div>
        </div>

        <!-- Progress Section -->
        <div class="mt-6 pt-6 border-t border-gray-800">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <!-- Overall Progress -->
            <div>
              <h4 class="text-sm font-medium text-gray-400 mb-2">Overall Progress</h4>
              <GoalsGoalProgressBar
                :progress="currentGoal.progress"
                :indicator="currentGoalProgressIndicator"
                size="lg"
              />
            </div>

            <!-- Key Results Summary -->
            <div>
              <h4 class="text-sm font-medium text-gray-400 mb-2">Key Results</h4>
              <div class="flex items-center gap-3">
                <div class="text-3xl font-bold text-white">
                  {{ currentGoalKeyResultsCompleted }}/{{ currentGoalKeyResultsTotal }}
                </div>
                <div class="text-gray-400 text-sm">Completed</div>
              </div>
            </div>

            <!-- Progress Status -->
            <div>
              <h4 class="text-sm font-medium text-gray-400 mb-2">Status</h4>
              <div class="flex items-center gap-2">
                <span
                  class="w-3 h-3 rounded-full"
                  :class="{
                    'bg-emerald-500': currentGoalProgressIndicator === 'on_track',
                    'bg-amber-500': currentGoalProgressIndicator === 'at_risk',
                    'bg-red-500': currentGoalProgressIndicator === 'behind'
                  }"
                />
                <span class="text-white font-medium capitalize">
                  {{ currentGoalProgressIndicator.replace('_', ' ') }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Key Results Section -->
      <div class="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold text-white">Key Results</h2>
          <UButton
            v-if="canProgress"
            size="sm"
            @click="isKeyResultModalOpen = true"
          >
            <UIcon name="i-heroicons-plus" class="w-4 h-4 mr-1" />
            Add Key Result
          </UButton>
        </div>

        <!-- Key Results List -->
        <div v-if="currentGoal.key_results.length > 0" class="space-y-3">
          <GoalsKeyResultItem
            v-for="kr in currentGoal.key_results"
            :key="kr.id"
            :key-result="kr"
            :editable="canProgress"
            @edit="handleEditKeyResult(kr)"
            @delete="handleDeleteKeyResult(kr.id)"
          />
        </div>

        <!-- Empty State -->
        <div v-else class="text-center py-8 text-gray-400">
          <UIcon name="i-heroicons-flag" class="w-8 h-8 mx-auto mb-2" />
          <p>No key results yet.</p>
          <p v-if="canProgress" class="text-sm mt-1">Add key results to track progress.</p>
        </div>
      </div>
    </div>

    <!-- Edit Modal -->
    <UModal v-model:open="isEditModalOpen">
      <template #content>
        <div class="p-6">
          <h2 class="text-xl font-semibold text-white mb-6">Edit Goal</h2>
          <GoalsGoalForm
            v-if="currentGoal"
            mode="edit"
            :goal="currentGoal"
            @submit="handleUpdateGoal"
            @cancel="isEditModalOpen = false"
          />
        </div>
      </template>
    </UModal>

    <!-- Approval Modal -->
    <UModal v-model:open="isApprovalModalOpen">
      <template #content>
        <div class="p-6">
          <h2 class="text-xl font-semibold text-white mb-4">
            {{ approvalAction === 'approve' ? 'Approve Goal' : 'Reject Goal' }}
          </h2>
          <p class="text-gray-400 mb-4">
            {{ approvalAction === 'approve' 
              ? 'This goal will become active and the owner can start tracking progress.'
              : 'This goal will be returned to draft status for revisions.'
            }}
          </p>
          <UFormField :label="approvalAction === 'reject' ? 'Reason (required)' : 'Comment (optional)'">
            <UTextarea
              v-model="approvalComment"
              :placeholder="approvalAction === 'reject' ? 'Please provide a reason...' : 'Add a comment...'"
              :rows="3"
            />
          </UFormField>
          <div class="flex justify-end gap-3 mt-6">
            <UButton variant="ghost" @click="isApprovalModalOpen = false">
              Cancel
            </UButton>
            <UButton
              :color="approvalAction === 'approve' ? 'success' : 'error'"
              :disabled="approvalAction === 'reject' && !approvalComment.trim()"
              @click="handleApproval"
            >
              {{ approvalAction === 'approve' ? 'Approve' : 'Reject' }}
            </UButton>
          </div>
        </div>
      </template>
    </UModal>

    <!-- Add Key Result Modal -->
    <UModal v-model:open="isKeyResultModalOpen">
      <template #content>
        <div class="p-6">
          <h2 class="text-xl font-semibold text-white mb-6">Add Key Result</h2>
          <GoalsKeyResultForm
            @submit="handleAddKeyResult"
            @cancel="isKeyResultModalOpen = false"
          />
        </div>
      </template>
    </UModal>

    <!-- Edit Key Result Modal -->
    <UModal v-model:open="isEditingKeyResult">
      <template #content>
        <div class="p-6">
          <h2 class="text-xl font-semibold text-white mb-6">Edit Key Result</h2>
          <GoalsKeyResultForm
            v-if="editingKeyResult"
            :key-result="editingKeyResult"
            mode="edit"
            @submit="handleUpdateKeyResult"
            @cancel="editingKeyResult = null"
          />
        </div>
      </template>
    </UModal>
  </div>
</template>
