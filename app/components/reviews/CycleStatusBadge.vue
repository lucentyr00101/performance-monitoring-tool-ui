<script setup lang="ts">
import type { ReviewCycleStatus } from '~/types/review'

interface Props {
  status: ReviewCycleStatus
  size?: 'xs' | 'sm' | 'md'
}

const props = withDefaults(defineProps<Props>(), {
  size: 'sm'
})

const { getCycleStatusColor } = useReviews()

const color = computed(() => getCycleStatusColor(props.status))

const label = computed(() => {
  const labels: Record<ReviewCycleStatus, string> = {
    draft: 'Draft',
    active: 'Active',
    completed: 'Completed',
    cancelled: 'Cancelled'
  }
  return labels[props.status] || props.status
})

const sizeClasses = computed(() => {
  switch (props.size) {
    case 'xs': return 'text-xs px-1.5 py-0.5'
    case 'sm': return 'text-xs px-2 py-1'
    case 'md': return 'text-sm px-2.5 py-1'
    default: return 'text-xs px-2 py-1'
  }
})
</script>

<template>
  <UBadge
    :color="color"
    variant="subtle"
    :class="sizeClasses"
  >
    {{ label }}
  </UBadge>
</template>
