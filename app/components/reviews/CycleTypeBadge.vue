<script setup lang="ts">
import type { ReviewCycleType } from '~/types/review'

interface Props {
  type: ReviewCycleType
  size?: 'xs' | 'sm' | 'md'
}

const props = withDefaults(defineProps<Props>(), {
  size: 'sm'
})

const { getCycleTypeColor, getCycleTypeLabel } = useReviews()

const color = computed(() => getCycleTypeColor(props.type))
const label = computed(() => getCycleTypeLabel(props.type))

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
