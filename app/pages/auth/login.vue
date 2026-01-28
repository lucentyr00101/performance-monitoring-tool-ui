<script setup lang="ts">
definePageMeta({
  layout: 'auth',
  middleware: 'guest'
})

const route = useRoute()

// Show message if redirected with reason
const reasonMessages: Record<string, string> = {
  session_expired: 'Your session has expired. Please sign in again.',
  unauthorized: 'Please sign in to access that page.'
}

const message = computed(() => {
  const reason = route.query.reason as string
  return reason ? reasonMessages[reason] : null
})
</script>

<template>
  <div>
    <!-- Session expired or other message -->
    <UAlert
      v-if="message"
      color="warning"
      icon="i-heroicons-information-circle"
      :title="message"
      class="mb-6"
    />

    <AuthLoginForm />

    <!-- Demo credentials hint -->
    <div class="mt-6 pt-6 border-t border-gray-800">
      <p class="text-xs text-gray-500 text-center mb-3">Demo Credentials</p>
      <div class="grid grid-cols-2 gap-2 text-xs">
        <div class="text-gray-400">admin@company.com</div>
        <div class="text-gray-500">Admin123</div>
        <div class="text-gray-400">manager@company.com</div>
        <div class="text-gray-500">Manager1</div>
        <div class="text-gray-400">employee@company.com</div>
        <div class="text-gray-500">Employee1</div>
      </div>
    </div>
  </div>
</template>
