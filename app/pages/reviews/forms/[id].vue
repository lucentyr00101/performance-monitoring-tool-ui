<script setup lang="ts">
import type { ReviewForm, ReviewFormSection } from '~/types/review-form'

definePageMeta({
  middleware: ['auth'],
  layout: 'default'
})

const route = useRoute()
const router = useRouter()
const reviewFormsStore = useReviewFormsStore()
const authStore = useAuthStore()

// Get form ID from route
const formId = computed(() => route.params.id as string)
const isEditMode = computed(() => route.query.edit === 'true')

// Permission check
const canManageForms = computed(() => {
  const role = authStore.user?.role
  return role === 'hr' || role === 'admin'
})

// Form data
const form = ref<ReviewForm | null>(null)
const isLoading = ref(true)

// View mode
const showPreview = ref(false)
const isEditing = ref(false)

// Load form on mount (keep access denied as info message)
onMounted(async () => {
  if (!canManageForms.value) {
    router.push('/')
    return
  }

  await loadForm()

  // Start in edit mode if query param is set
  if (isEditMode.value && form.value?.status === 'draft') {
    isEditing.value = true
  }
})

async function loadForm() {
  isLoading.value = true
  try {
    form.value = await reviewFormsStore.fetchForm(formId.value)
  } catch {
    router.push('/reviews/forms')
  } finally {
    isLoading.value = false
  }
}

// Status badge config
type BadgeColor = 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error' | 'neutral'
const defaultStatusConfig = { label: 'Draft', color: 'neutral' as BadgeColor }
const statusConfig = computed(() => {
  const configs: Record<string, { label: string; color: BadgeColor }> = {
    draft: { label: 'Draft', color: 'neutral' },
    published: { label: 'Published', color: 'success' },
    archived: { label: 'Archived', color: 'warning' }
  }
  return configs[form.value?.status || 'draft'] ?? defaultStatusConfig
})

// Handlers
function handleEdit() {
  isEditing.value = true
}

function handleCancelEdit() {
  isEditing.value = false
  loadForm() // Reload to discard changes
}

async function handleSave(formData: Partial<ReviewForm>) {
  if (!form.value) return

  try {
    await reviewFormsStore.updateForm(form.value.id, {
      name: formData.name,
      description: formData.description,
      instructions: formData.instructions,
      sections: formData.sections as ReviewFormSection[]
    })

    isEditing.value = false
    await loadForm()
  } catch {
    // Notification handled by store
  }
}

async function handlePublish() {
  if (!form.value) return

  try {
    await reviewFormsStore.publishForm(form.value.id)
    await loadForm()
  } catch {
    // Notification handled by store
  }
}

async function handleArchive() {
  if (!form.value) return

  try {
    await reviewFormsStore.archiveForm(form.value.id)
    await loadForm()
  } catch {
    // Notification handled by store
  }
}

async function handleClone() {
  if (!form.value) return

  try {
    const newFormId = await reviewFormsStore.cloneForm(form.value.id, { name: `${form.value.name} (Copy)` })
    router.push(`/reviews/forms/${newFormId}`)
  } catch {
    // Notification handled by store
  }
}

async function handleDelete() {
  if (!form.value) return

  const confirmed = confirm(`Are you sure you want to delete "${form.value.name}"? This cannot be undone.`)
  if (!confirmed) return

  try {
    await reviewFormsStore.deleteForm(form.value.id)
    router.push('/reviews/forms')
  } catch {
    // Notification handled by store
  }
}

function goBack() {
  router.push('/reviews/forms')
}
</script>

<template>
  <div class="min-h-screen bg-gray-950 py-8">
    <div class="container mx-auto px-4 max-w-6xl">
      <!-- Loading -->
      <div v-if="isLoading" class="space-y-4">
        <USkeleton class="h-12 w-64" />
        <USkeleton class="h-64 rounded-lg" />
      </div>

      <template v-else-if="form">
        <!-- Editing Mode -->
        <template v-if="isEditing">
          <div class="mb-8">
            <div class="flex items-center gap-2 text-gray-400 mb-2">
              <NuxtLink to="/reviews/forms" class="hover:text-white transition-colors">
                Review Forms
              </NuxtLink>
              <UIcon name="i-heroicons-chevron-right" class="w-4 h-4" />
              <span class="text-white">Edit Form</span>
            </div>
            <h1 class="text-2xl font-bold text-white">Edit: {{ form.name }}</h1>
          </div>

          <ReviewFormsFormBuilder
            :initial-form="form"
            :is-editing="true"
            @save="handleSave"
            @cancel="handleCancelEdit"
            @preview="showPreview = true"
          />
        </template>

        <!-- View Mode -->
        <template v-else>
          <!-- Header -->
          <div class="flex items-center justify-between mb-8">
            <div>
              <div class="flex items-center gap-2 text-gray-400 mb-2">
                <UButton
                  variant="ghost"
                  color="neutral"
                  icon="i-heroicons-arrow-left"
                  size="sm"
                  @click="goBack"
                >
                  Back to Forms
                </UButton>
              </div>
              <div class="flex items-center gap-3">
                <h1 class="text-2xl font-bold text-white">{{ form.name }}</h1>
                <UBadge v-if="form.isDefault" color="primary" variant="subtle">
                  Default
                </UBadge>
                <UBadge :color="statusConfig?.color ?? 'neutral'" variant="subtle">
                  {{ statusConfig?.label ?? 'Draft' }}
                </UBadge>
              </div>
              <p v-if="form.description" class="text-gray-400 mt-1">{{ form.description }}</p>
            </div>

            <!-- Actions -->
            <div class="flex items-center gap-2">
              <UButton
                variant="outline"
                color="neutral"
                icon="i-heroicons-document-duplicate"
                @click="handleClone"
              >
                Clone
              </UButton>
              
              <template v-if="form.status === 'draft'">
                <UButton
                  variant="outline"
                  color="neutral"
                  icon="i-heroicons-pencil"
                  @click="handleEdit"
                >
                  Edit
                </UButton>
                <UButton
                  color="primary"
                  icon="i-heroicons-check-circle"
                  @click="handlePublish"
                >
                  Publish
                </UButton>
                <UButton
                  variant="ghost"
                  color="error"
                  icon="i-heroicons-trash"
                  @click="handleDelete"
                />
              </template>
              
              <template v-else-if="form.status === 'published'">
                <UButton
                  variant="outline"
                  color="warning"
                  icon="i-heroicons-archive-box"
                  @click="handleArchive"
                >
                  Archive
                </UButton>
              </template>
            </div>
          </div>

          <!-- Form Info -->
          <div class="grid grid-cols-3 gap-4 mb-8">
            <UCard class="bg-gray-900">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-primary-500/20 rounded-lg flex items-center justify-center">
                  <UIcon name="i-heroicons-rectangle-stack" class="w-5 h-5 text-primary-400" />
                </div>
                <div>
                  <p class="text-2xl font-bold text-white">{{ form.sections.length }}</p>
                  <p class="text-sm text-gray-400">Sections</p>
                </div>
              </div>
            </UCard>
            <UCard class="bg-gray-900">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <UIcon name="i-heroicons-question-mark-circle" class="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p class="text-2xl font-bold text-white">
                    {{ form.sections.reduce((sum, s) => sum + s.questions.length, 0) }}
                  </p>
                  <p class="text-sm text-gray-400">Questions</p>
                </div>
              </div>
            </UCard>
            <UCard class="bg-gray-900">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <UIcon name="i-heroicons-building-office" class="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <p class="text-2xl font-bold text-white">{{ form.assignedDepartments?.length || 0 }}</p>
                  <p class="text-sm text-gray-400">Departments</p>
                </div>
              </div>
            </UCard>
          </div>

          <!-- Version & metadata -->
          <div class="flex items-center gap-4 text-sm text-gray-500 mb-8">
            <span>Version {{ form.version }}</span>
            <span>•</span>
            <span>Created by {{ form.createdBy.firstName }} {{ form.createdBy.lastName }}</span>
            <span>•</span>
            <span>Updated {{ new Date(form.updatedAt).toLocaleDateString() }}</span>
          </div>

          <!-- Form Preview -->
          <div class="mb-8">
            <h2 class="text-lg font-semibold text-white mb-4">Form Preview</h2>
            <ReviewFormsFormPreview :form="form" :show-header="false" />
          </div>
        </template>
      </template>
    </div>
  </div>
</template>
