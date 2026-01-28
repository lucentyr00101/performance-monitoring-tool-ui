<script setup lang="ts">
import type { QuickAction } from '~/types/dashboard'

const props = defineProps<{
  actions: QuickAction[]
  loading?: boolean
  variant?: 'dropdown' | 'inline' | 'buttons'
}>()

const emit = defineEmits<{
  action: [action: string]
}>()

function handleAction(action: QuickAction) {
  if (action.link) {
    navigateTo(action.link)
  }
  else {
    emit('action', action.action)
  }
}

function getButtonColor(color?: QuickAction['color']): 'primary' | 'success' | 'warning' | 'error' | 'neutral' {
  return color || 'primary'
}

function getButtonVariant(variant?: QuickAction['variant']): 'solid' | 'outline' | 'ghost' {
  return variant || 'solid'
}

// For dropdown variant
const dropdownItems = computed(() => {
  return props.actions?.map(action => ({
    label: action.label,
    icon: action.icon,
    click: () => handleAction(action)
  })) || []
})
</script>

<template>
  <!-- Loading -->
  <template v-if="loading">
    <USkeleton class="h-9 w-32" />
  </template>

  <!-- Dropdown variant -->
  <template v-else-if="variant === 'dropdown'">
    <UDropdownMenu :items="[dropdownItems]">
      <UButton trailing-icon="i-heroicons-chevron-down" color="primary">
        Quick Actions
      </UButton>
    </UDropdownMenu>
  </template>

  <!-- Buttons variant (default) -->
  <template v-else-if="variant === 'buttons' || !variant">
    <div class="flex flex-wrap items-center gap-2">
      <UButton
        v-for="action in actions"
        :key="action.id"
        :icon="action.icon"
        :color="getButtonColor(action.color)"
        :variant="getButtonVariant(action.variant)"
        size="sm"
        @click="handleAction(action)"
      >
        {{ action.label }}
      </UButton>
    </div>
  </template>

  <!-- Inline variant (icon buttons) -->
  <template v-else-if="variant === 'inline'">
    <div class="flex items-center gap-1">
      <UTooltip
        v-for="action in actions"
        :key="action.id"
        :text="action.label"
      >
        <UButton
          :icon="action.icon"
          :color="getButtonColor(action.color)"
          variant="ghost"
          size="sm"
          square
          @click="handleAction(action)"
        />
      </UTooltip>
    </div>
  </template>
</template>
