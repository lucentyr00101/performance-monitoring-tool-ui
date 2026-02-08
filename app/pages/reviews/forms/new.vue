<script setup lang="ts">
import type { ReviewForm } from '~/types/review-form'

definePageMeta({
  middleware: ['auth'],
  layout: 'default'
})

const router = useRouter()
const reviewFormsStore = useReviewFormsStore()
const authStore = useAuthStore()

// Permission check
const canManageForms = computed(() => {
  const role = authStore.user?.role
  return role === 'hr' || role === 'admin'
})

// View mode
const showPreview = ref(false)
const previewForm = ref<Partial<ReviewForm> | null>(null)

// Check permissions on mount (keep access denied as info message)
onMounted(() => {
  if (!canManageForms.value) {
    router.push('/')
  }
})

// Handlers
async function handleSave(formData: Partial<ReviewForm>) {
  try {
    const newFormId = await reviewFormsStore.createForm({
      name: formData.name!,
      description: formData.description,
      instructions: formData.instructions,
      sections: formData.sections!,
      settings: {
        ratingScale: {
          min: 1,
          max: 5,
          labels: {
            '1': 'Needs Improvement',
            '2': 'Below Expectations',
            '3': 'Meets Expectations',
            '4': 'Exceeds Expectations',
            '5': 'Outstanding'
          }
        }
      }
    })

    router.push(`/reviews/forms/${newFormId}`)
  } catch {
    // Notification handled by store
  }
}

function handleCancel() {
  router.push('/reviews/forms')
}

function handlePreview() {
  showPreview.value = true
}

function closePreview() {
  showPreview.value = false
}
</script>

<template>
  <div class="min-h-screen bg-gray-950 py-8">
    <div class="px-4">
      <!-- Header -->
      <div class="mb-8">
        <div class="flex items-center gap-2 text-gray-400 mb-2">
          <NuxtLink to="/reviews/forms" class="hover:text-white transition-colors">
            Review Forms
          </NuxtLink>
          <UIcon name="i-heroicons-chevron-right" class="w-4 h-4" />
          <span class="text-white">Create New Form</span>
        </div>
        <h1 class="text-2xl font-bold text-white">Create Review Form</h1>
        <p class="text-gray-400 mt-1">Build a new performance review template</p>
      </div>

      <!-- Form Builder -->
      <ReviewFormsFormBuilder
        @save="handleSave"
        @cancel="handleCancel"
        @preview="handlePreview"
      />
    </div>

    <!-- Preview Modal -->
    <UModal v-model:open="showPreview">
      <template #header>
        <h3 class="text-lg font-semibold text-white">Form Preview</h3>
      </template>
      <template #body>
        <ReviewFormsFormPreview
          v-if="previewForm"
          :form="(previewForm as ReviewForm)"
          :show-header="true"
        />
        <div v-else class="text-center py-8 text-gray-400">
          Save the form to preview it
        </div>
      </template>
      <template #footer>
        <UButton color="neutral" @click="closePreview">Close</UButton>
      </template>
    </UModal>
  </div>
</template>
