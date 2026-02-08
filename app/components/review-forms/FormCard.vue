<script setup lang="ts">
import type { ReviewFormListItem } from '~/types/review-form'

type BadgeColor = 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error' | 'neutral'

const props = defineProps<{
  form: ReviewFormListItem
}>()

const emit = defineEmits<{
  view: [id: string]
  edit: [id: string]
  clone: [id: string]
  delete: [id: string]
  publish: [id: string]
  archive: [id: string]
}>()

// Status badge config
const statusConfig = computed(() => {
  const configs: Record<string, { label: string; color: BadgeColor }> = {
    draft: { label: 'Draft', color: 'neutral' },
    published: { label: 'Published', color: 'success' },
    archived: { label: 'Archived', color: 'warning' }
  }
  return configs[props.form.status] ?? configs.draft
})

// Formatted dates
const updatedAtFormatted = computed(() => {
  const date = new Date(props.form.updatedAt)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
})

// Dropdown actions
const actions = computed(() => {
  const baseItems = [
    { label: 'View Details', icon: 'i-heroicons-eye', click: () => emit('view', props.form.id) },
    { label: 'Clone', icon: 'i-heroicons-document-duplicate', click: () => emit('clone', props.form.id) }
  ]

  if (props.form.status === 'draft') {
    baseItems.push({ label: 'Edit', icon: 'i-heroicons-pencil', click: () => emit('edit', props.form.id) })
  }

  const items = [baseItems]

  if (props.form.status === 'draft') {
    items.push([
      { label: 'Publish', icon: 'i-heroicons-check-circle', click: () => emit('publish', props.form.id) },
      { label: 'Delete', icon: 'i-heroicons-trash', click: () => emit('delete', props.form.id) }
    ])
  }

  if (props.form.status === 'published') {
    items.push([
      { label: 'Archive', icon: 'i-heroicons-archive-box', click: () => emit('archive', props.form.id) }
    ])
  }

  return items
})

// Default status config fallback
const defaultStatusConfig = { label: 'Draft', color: 'neutral' as BadgeColor }
const currentStatusConfig = computed(() => statusConfig.value ?? defaultStatusConfig)

// Calculate counts from sections array if not provided directly
const sectionsCount = computed(() => {
  return props.form.sectionsCount ?? props.form.sections?.length ?? 0
})

const questionsCount = computed(() => {
  // If questionsCount is explicitly provided, use it
  if (props.form.questionsCount !== undefined) return props.form.questionsCount
  
  // Try to calculate from sections if they have questions
  if (props.form.sections && props.form.sections.length > 0) {
    const calculated = props.form.sections.reduce((total, section) => {
      return total + (section.questions?.length ?? 0)
    }, 0)
    // Only return calculated value if it's greater than 0
    // If 0, it means sections don't have questions (list endpoint)
    return calculated
  }
  
  return undefined
})

const showQuestionsCount = computed(() => questionsCount.value !== undefined)

// Handle both departmentAssignments and assignedDepartments
const departments = computed(() => {
  return props.form.assignedDepartments ?? props.form.departmentAssignments ?? []
})
</script>

<template>
  <UCard class="bg-gray-900 hover:bg-gray-800/80 transition-colors cursor-pointer" @click="$emit('view', form.id)">
    <div class="flex items-start justify-between gap-4">
      <div class="flex-1 min-w-0">
        <!-- Header -->
        <div class="flex items-center gap-2 mb-2">
          <h3 class="font-medium text-white truncate">{{ form.name }}</h3>
          <UBadge v-if="form.isDefault" color="primary" variant="subtle" size="xs">
            Default
          </UBadge>
          <UBadge :color="currentStatusConfig.color" variant="subtle" size="xs">
            {{ currentStatusConfig.label }}
          </UBadge>
        </div>

        <!-- Description -->
        <p v-if="form.description" class="text-sm text-gray-400 line-clamp-2 mb-3">
          {{ form.description }}
        </p>

        <!-- Stats -->
        <div class="flex items-center gap-4 text-sm text-gray-500">
          <span class="flex items-center gap-1">
            <UIcon name="i-heroicons-rectangle-stack" class="w-4 h-4" />
            {{ sectionsCount }} {{ sectionsCount === 1 ? 'section' : 'sections' }}
          </span>
          <span v-if="showQuestionsCount" class="flex items-center gap-1">
            <UIcon name="i-heroicons-question-mark-circle" class="w-4 h-4" />
            {{ questionsCount }} {{ questionsCount === 1 ? 'question' : 'questions' }}
          </span>
          <span v-if="departments.length" class="flex items-center gap-1">
            <UIcon name="i-heroicons-building-office" class="w-4 h-4" />
            {{ departments.length }} {{ departments.length === 1 ? 'department' : 'departments' }}
          </span>
        </div>

        <!-- Version & Updated -->
        <div class="flex items-center gap-3 mt-2 text-xs text-gray-500">
          <span>v{{ form.version }}</span>
          <span>•</span>
          <span>Updated {{ updatedAtFormatted }}</span>
        </div>
      </div>

      <!-- Actions -->
      <UDropdownMenu :items="actions" @click.stop>
        <UButton
          variant="ghost"
          color="neutral"
          icon="i-heroicons-ellipsis-vertical"
          size="sm"
          @click.stop
        />
      </UDropdownMenu>
    </div>
  </UCard>
</template>
