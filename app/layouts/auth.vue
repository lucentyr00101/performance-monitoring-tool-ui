<script setup lang="ts">
// Auth layout - centered card for login/forgot password pages
</script>

<template>
  <div class="min-h-screen bg-gray-950 flex flex-col justify-center items-center p-4">
    <div class="w-full max-w-md">
      <!-- Logo placeholder -->
      <div class="text-center mb-8">
        <div class="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-primary-500/10 mb-4">
          <UIcon name="i-heroicons-chart-bar" class="w-8 h-8 text-primary-500" />
        </div>
        <h1 class="text-2xl font-bold text-white">Performance Monitor</h1>
        <p class="text-gray-400 text-sm mt-1">Employee Performance Monitoring Tool</p>
      </div>

      <!-- Main content slot -->
      <UCard class="bg-gray-900 ring-gray-800">
        <slot />
      </UCard>

      <!-- Footer -->
      <p class="text-center text-gray-500 text-xs mt-8">
        &copy; {{ new Date().getFullYear() }} Company Name. All rights reserved.
      </p>
    </div>
  </div>
</template>
