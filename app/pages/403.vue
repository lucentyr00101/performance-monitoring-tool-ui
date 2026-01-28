<script setup lang="ts">
definePageMeta({
  layout: 'auth'
})
</script>

<template>
  <div class="text-center py-8">
    <div class="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-6">
      <UIcon name="i-heroicons-shield-exclamation" class="w-10 h-10 text-red-500" />
    </div>

    <h1 class="text-2xl font-bold text-white mb-2">Access Denied</h1>
    <p class="text-gray-400 mb-6">
      You don't have permission to access this page.
      Please contact your administrator if you believe this is an error.
    </p>

    <div class="flex flex-col sm:flex-row gap-3 justify-center">
      <NuxtLink to="/">
        <UButton color="primary">
          <UIcon name="i-heroicons-home" class="w-4 h-4 mr-2" />
          Go to Dashboard
        </UButton>
      </NuxtLink>
      <UButton variant="ghost" color="neutral" @click="$router.back()">
        <UIcon name="i-heroicons-arrow-left" class="w-4 h-4 mr-2" />
        Go Back
      </UButton>
    </div>
  </div>
</template>
