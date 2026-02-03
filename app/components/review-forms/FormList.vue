<script setup lang="ts">
import type { ReviewFormListItem } from '~/types/review-form'

const props = withDefaults(defineProps<{
  forms: ReviewFormListItem[]
  loading?: boolean
  showEmpty?: boolean
}>(), {
  loading: false,
  showEmpty: true
})

const emit = defineEmits<{
  view: [id: string]
  edit: [id: string]
  clone: [id: string]
  delete: [id: string]
  publish: [id: string]
  archive: [id: string]
  create: []
}>()
</script>

<template>
  <div>
    <!-- Loading state -->
    <div v-if="loading" class="space-y-4">
      <USkeleton v-for="i in 3" :key="i" class="h-32 rounded-lg" />
    </div>

    <!-- Empty state -->
    <div
      v-else-if="!forms.length && showEmpty"
      class="text-center py-12 bg-gray-900 rounded-lg"
    >
      <UIcon name="i-heroicons-document-text" class="w-12 h-12 text-gray-600 mx-auto mb-4" />
      <h3 class="text-lg font-medium text-white mb-2">No Review Forms</h3>
      <p class="text-gray-400 mb-4">Create your first review form to get started</p>
      <UButton color="primary" icon="i-heroicons-plus" @click="emit('create')">
        Create Form
      </UButton>
    </div>

    <!-- Form list -->
    <div v-else class="grid gap-4">
      <ReviewFormsFormCard
        v-for="form in forms"
        :key="form.id"
        :form="form"
        @view="emit('view', $event)"
        @edit="emit('edit', $event)"
        @clone="emit('clone', $event)"
        @delete="emit('delete', $event)"
        @publish="emit('publish', $event)"
        @archive="emit('archive', $event)"
      />
    </div>
  </div>
</template>
