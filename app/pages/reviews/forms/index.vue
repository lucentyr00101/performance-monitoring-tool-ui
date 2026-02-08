<script setup lang="ts">
import type { ReviewFormListItem, ReviewFormStatus } from '~/types/review-form'

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

// Filter state
const selectedStatus = ref<ReviewFormStatus | 'all'>('all')
const searchQuery = ref('')

// Load forms on mount (keep access denied toast as it's an info message)
onMounted(async () => {
  if (!canManageForms.value) {
    router.push('/')
    return
  }
  await reviewFormsStore.fetchForms()
})

// Filtered forms
const filteredForms = computed(() => {
  let forms = reviewFormsStore.forms

  // Filter by status
  if (selectedStatus.value !== 'all') {
    forms = forms.filter(f => f.status === selectedStatus.value)
  }

  // Filter by search
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    forms = forms.filter(f =>
      f.name.toLowerCase().includes(query) ||
      f.description?.toLowerCase().includes(query)
    )
  }

  return forms
})

// Status filter options
const statusOptions = [
  { value: 'all', label: 'All Status' },
  { value: 'published', label: 'Published' },
  { value: 'draft', label: 'Draft' },
  { value: 'archived', label: 'Archived' }
]

// Stats
const stats = computed(() => ({
  total: reviewFormsStore.forms.length,
  published: reviewFormsStore.forms.filter(f => f.status === 'published').length,
  draft: reviewFormsStore.forms.filter(f => f.status === 'draft').length,
  archived: reviewFormsStore.forms.filter(f => f.status === 'archived').length
}))

// Handlers
function handleCreate() {
  router.push('/reviews/forms/new')
}

function handleView(id: string) {
  router.push(`/reviews/forms/${id}`)
}

function handleEdit(id: string) {
  router.push(`/reviews/forms/${id}?edit=true`)
}

async function handleClone(id: string) {
  const form = reviewFormsStore.forms.find(f => f.id === id)
  if (!form) return

  try {
    const newFormId = await reviewFormsStore.cloneForm(id, { name: `${form.name} (Copy)` })
    router.push(`/reviews/forms/${newFormId}`)
  } catch {
    // Notification handled by store
  }
}

async function handleDelete(id: string) {
  const form = reviewFormsStore.forms.find(f => f.id === id)
  if (!form) return

  const confirmed = confirm(`Are you sure you want to delete "${form.name}"? This cannot be undone.`)
  if (!confirmed) return

  try {
    await reviewFormsStore.deleteForm(id)
  } catch {
    // Notification handled by store
  }
}

async function handlePublish(id: string) {
  try {
    await reviewFormsStore.publishForm(id)
  } catch {
    // Notification handled by store
  }
}

async function handleArchive(id: string) {
  try {
    await reviewFormsStore.archiveForm(id)
  } catch {
    // Notification handled by store
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-950 py-8">
    <div class="px-4">
      <!-- Header -->
      <div class="flex items-center justify-between mb-8">
        <div>
          <h1 class="text-2xl font-bold text-white">Review Forms</h1>
          <p class="text-gray-400 mt-1">Manage performance review templates</p>
        </div>
        <UButton
          v-if="canManageForms"
          color="primary"
          icon="i-heroicons-plus"
          @click="handleCreate"
        >
          Create Form
        </UButton>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-4 gap-4 mb-6">
        <UCard class="bg-gray-900">
          <div class="text-center">
            <p class="text-2xl font-bold text-white">{{ stats.total }}</p>
            <p class="text-sm text-gray-400">Total Forms</p>
          </div>
        </UCard>
        <UCard class="bg-gray-900">
          <div class="text-center">
            <p class="text-2xl font-bold text-green-400">{{ stats.published }}</p>
            <p class="text-sm text-gray-400">Published</p>
          </div>
        </UCard>
        <UCard class="bg-gray-900">
          <div class="text-center">
            <p class="text-2xl font-bold text-gray-400">{{ stats.draft }}</p>
            <p class="text-sm text-gray-400">Draft</p>
          </div>
        </UCard>
        <UCard class="bg-gray-900">
          <div class="text-center">
            <p class="text-2xl font-bold text-yellow-400">{{ stats.archived }}</p>
            <p class="text-sm text-gray-400">Archived</p>
          </div>
        </UCard>
      </div>

      <!-- Filters -->
      <div class="flex items-center gap-4 mb-6">
        <UInput
          v-model="searchQuery"
          placeholder="Search forms..."
          icon="i-heroicons-magnifying-glass"
          class="w-64"
        />
        <USelectMenu
          v-model="selectedStatus"
          :items="statusOptions"
          value-key="value"
          class="w-40"
        />
      </div>

      <!-- Forms List -->
      <ReviewFormsFormList
        :forms="(filteredForms as ReviewFormListItem[])"
        :loading="reviewFormsStore.isLoading"
        @view="handleView"
        @edit="handleEdit"
        @clone="handleClone"
        @delete="handleDelete"
        @publish="handlePublish"
        @archive="handleArchive"
        @create="handleCreate"
      />
    </div>
  </div>
</template>
