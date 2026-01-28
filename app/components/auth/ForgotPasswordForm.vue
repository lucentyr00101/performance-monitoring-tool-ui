<script setup lang="ts">
import type { ApiError } from '~/types/auth'
import { authService } from '~/services/auth'

const email = ref('')
const isLoading = ref(false)
const isSuccess = ref(false)
const error = ref<string | null>(null)
const fieldError = ref<string | null>(null)

async function handleSubmit() {
  error.value = null
  fieldError.value = null

  if (!email.value) {
    fieldError.value = 'Email is required'
    return
  }

  isLoading.value = true

  try {
    await authService.forgotPassword(email.value)
    isSuccess.value = true
  }
  catch (err) {
    const apiError = err as ApiError
    error.value = apiError?.error?.message || 'An error occurred. Please try again.'
  }
  finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="space-y-5">
    <!-- Success state -->
    <template v-if="isSuccess">
      <div class="text-center py-4">
        <div class="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
          <UIcon name="i-heroicons-envelope-open" class="w-8 h-8 text-green-500" />
        </div>
        <h3 class="text-lg font-semibold text-white mb-2">Check your email</h3>
        <p class="text-gray-400 text-sm">
          If an account exists with <strong class="text-white">{{ email }}</strong>,
          you will receive a password reset link shortly.
        </p>
      </div>

      <NuxtLink to="/auth/login">
        <UButton color="primary" variant="ghost" block>
          <UIcon name="i-heroicons-arrow-left" class="w-4 h-4 mr-2" />
          Back to login
        </UButton>
      </NuxtLink>
    </template>

    <!-- Form state -->
    <template v-else>
      <div class="text-center mb-6">
        <h2 class="text-xl font-semibold text-white mb-2">Forgot your password?</h2>
        <p class="text-gray-400 text-sm">
          Enter your email address and we'll send you a link to reset your password.
        </p>
      </div>

      <form class="space-y-5" @submit.prevent="handleSubmit">
        <!-- Error -->
        <UAlert
          v-if="error"
          color="error"
          icon="i-heroicons-exclamation-circle"
          :title="error"
          :close-button="{ onClick: () => error = null }"
        />

        <!-- Email field -->
        <UFormField label="Email" name="email" :error="fieldError">
          <UInput
            v-model="email"
            type="email"
            placeholder="Enter your email"
            icon="i-heroicons-envelope"
            size="lg"
            :disabled="isLoading"
            class="w-full"
          />
        </UFormField>

        <!-- Submit button -->
        <UButton
          type="submit"
          color="primary"
          size="lg"
          block
          :loading="isLoading"
          :disabled="isLoading"
        >
          Send reset link
        </UButton>

        <NuxtLink to="/auth/login">
          <UButton color="neutral" variant="ghost" block class="mt-2">
            <UIcon name="i-heroicons-arrow-left" class="w-4 h-4 mr-2" />
            Back to login
          </UButton>
        </NuxtLink>
      </form>
    </template>
  </div>
</template>
