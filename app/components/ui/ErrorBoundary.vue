<template>
  <div v-if="error" class="rounded-lg border border-red-500/20 bg-red-500/5 p-6">
    <div class="flex items-center gap-3 mb-3">
      <UIcon name="i-heroicons-exclamation-triangle" class="w-5 h-5 text-red-400" />
      <h3 class="text-sm font-medium text-red-400">{{ title || 'Something went wrong' }}</h3>
    </div>
    <p v-if="error.message" class="text-xs text-gray-400 mb-4">{{ error.message }}</p>
    <UButton
      v-if="showRetry"
      size="xs"
      variant="outline"
      color="error"
      icon="i-heroicons-arrow-path"
      @click="retry"
    >
      Retry
    </UButton>
  </div>
  <slot v-else />
</template>

<script setup lang="ts">
defineProps<{
  title?: string
  showRetry?: boolean
}>()

const emit = defineEmits<{
  retry: []
}>()

const error = ref<Error | null>(null)

function retry() {
  error.value = null
  emit('retry')
}

onErrorCaptured((err: Error) => {
  error.value = err
  return false // prevent propagation
})

defineExpose({ error, retry })
</script>
