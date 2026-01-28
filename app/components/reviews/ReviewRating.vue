<script setup lang="ts">
interface Props {
  rating: number
  maxRating?: number
  size?: 'sm' | 'md' | 'lg'
  showValue?: boolean
  readonly?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  maxRating: 5,
  size: 'md',
  showValue: true,
  readonly: false
})

const emit = defineEmits<{
  'update:rating': [value: number]
}>()

const { getRatingColor, getRatingLabel } = useReviews()

const hoverRating = ref(0)

const displayRating = computed(() => 
  hoverRating.value > 0 ? hoverRating.value : props.rating
)

const stars = computed(() => {
  const result = []
  for (let i = 1; i <= props.maxRating; i++) {
    result.push({
      index: i,
      filled: i <= Math.floor(displayRating.value),
      half: i === Math.ceil(displayRating.value) && displayRating.value % 1 !== 0
    })
  }
  return result
})

const sizeClasses = computed(() => {
  switch (props.size) {
    case 'sm': return 'w-4 h-4'
    case 'md': return 'w-5 h-5'
    case 'lg': return 'w-6 h-6'
    default: return 'w-5 h-5'
  }
})

const textSizeClasses = computed(() => {
  switch (props.size) {
    case 'sm': return 'text-sm'
    case 'md': return 'text-base'
    case 'lg': return 'text-lg'
    default: return 'text-base'
  }
})

function handleClick(index: number) {
  if (!props.readonly) {
    emit('update:rating', index)
  }
}

function handleMouseEnter(index: number) {
  if (!props.readonly) {
    hoverRating.value = index
  }
}

function handleMouseLeave() {
  hoverRating.value = 0
}
</script>

<template>
  <div class="flex items-center gap-2">
    <div 
      class="flex items-center gap-0.5"
      @mouseleave="handleMouseLeave"
    >
      <button
        v-for="star in stars"
        :key="star.index"
        type="button"
        :disabled="readonly"
        class="focus:outline-none transition-transform"
        :class="[
          readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110',
        ]"
        @click="handleClick(star.index)"
        @mouseenter="handleMouseEnter(star.index)"
      >
        <UIcon
          v-if="star.filled"
          name="i-heroicons-star-solid"
          :class="[sizeClasses, 'text-yellow-400']"
        />
        <UIcon
          v-else-if="star.half"
          name="i-heroicons-star"
          :class="[sizeClasses, 'text-yellow-400']"
        />
        <UIcon
          v-else
          name="i-heroicons-star"
          :class="[sizeClasses, 'text-gray-600']"
        />
      </button>
    </div>
    
    <template v-if="showValue && rating > 0">
      <span :class="[textSizeClasses, 'font-medium text-white']">
        {{ rating.toFixed(1) }}
      </span>
      <span :class="[textSizeClasses, 'text-gray-400']">
        / {{ maxRating }}
      </span>
    </template>
  </div>
</template>
