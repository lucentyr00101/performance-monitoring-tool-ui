<script setup lang="ts">
import type { ApiError } from '~/types/auth'
import { authService } from '~/services/auth'

const route = useRoute()
const token = computed(() => route.query.token as string)

const form = reactive({
  password: '',
  passwordConfirmation: ''
})

const isLoading = ref(false)
const isSuccess = ref(false)
const error = ref<string | null>(null)
const fieldErrors = ref<Record<string, string>>({})

// Password strength indicators
const passwordStrength = computed(() => {
  const password = form.password
  if (!password) return { score: 0, label: '', color: '' }

  let score = 0
  if (password.length >= 8) score++
  if (/[A-Z]/.test(password)) score++
  if (/[a-z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++

  const labels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong']
  const colors = ['error', 'warning', 'warning', 'success', 'success']

  return {
    score,
    label: labels[Math.min(score - 1, 4)] || '',
    color: colors[Math.min(score - 1, 4)] || ''
  }
})

function validatePassword(): boolean {
  fieldErrors.value = {}

  if (!form.password) {
    fieldErrors.value.password = 'Password is required'
    return false
  }

  if (form.password.length < 8) {
    fieldErrors.value.password = 'Password must be at least 8 characters'
    return false
  }

  if (!/[A-Z]/.test(form.password)) {
    fieldErrors.value.password = 'Password must contain at least one uppercase letter'
    return false
  }

  if (!/[a-z]/.test(form.password)) {
    fieldErrors.value.password = 'Password must contain at least one lowercase letter'
    return false
  }

  if (!/[0-9]/.test(form.password)) {
    fieldErrors.value.password = 'Password must contain at least one number'
    return false
  }

  if (!form.passwordConfirmation) {
    fieldErrors.value.passwordConfirmation = 'Please confirm your password'
    return false
  }

  if (form.password !== form.passwordConfirmation) {
    fieldErrors.value.passwordConfirmation = 'Passwords do not match'
    return false
  }

  return true
}

async function handleSubmit() {
  error.value = null

  if (!validatePassword()) {
    return
  }

  if (!token.value) {
    error.value = 'Invalid reset link. Please request a new password reset.'
    return
  }

  isLoading.value = true

  try {
    await authService.resetPassword({
      token: token.value,
      password: form.password,
      password_confirmation: form.passwordConfirmation
    })
    isSuccess.value = true
  }
  catch (err) {
    const apiError = err as ApiError
    if (apiError?.error?.details) {
      apiError.error.details.forEach(detail => {
        if (detail.field === 'password_confirmation') {
          fieldErrors.value.passwordConfirmation = detail.message
        }
        else {
          fieldErrors.value[detail.field] = detail.message
        }
      })
    }
    else {
      error.value = apiError?.error?.message || 'An error occurred. Please try again.'
    }
  }
  finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="space-y-5">
    <!-- No token warning -->
    <template v-if="!token">
      <div class="text-center py-4">
        <div class="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-4">
          <UIcon name="i-heroicons-exclamation-triangle" class="w-8 h-8 text-amber-500" />
        </div>
        <h3 class="text-lg font-semibold text-white mb-2">Invalid reset link</h3>
        <p class="text-gray-400 text-sm">
          This password reset link is invalid or has expired.
          Please request a new one.
        </p>
      </div>

      <NuxtLink to="/auth/forgot-password">
        <UButton color="primary" block>
          Request new reset link
        </UButton>
      </NuxtLink>
    </template>

    <!-- Success state -->
    <template v-else-if="isSuccess">
      <div class="text-center py-4">
        <div class="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
          <UIcon name="i-heroicons-check-circle" class="w-8 h-8 text-green-500" />
        </div>
        <h3 class="text-lg font-semibold text-white mb-2">Password reset successful</h3>
        <p class="text-gray-400 text-sm">
          Your password has been changed. You can now sign in with your new password.
        </p>
      </div>

      <NuxtLink to="/auth/login">
        <UButton color="primary" block>
          Sign in
        </UButton>
      </NuxtLink>
    </template>

    <!-- Form state -->
    <template v-else>
      <div class="text-center mb-6">
        <h2 class="text-xl font-semibold text-white mb-2">Reset your password</h2>
        <p class="text-gray-400 text-sm">
          Enter a new password for your account.
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

        <!-- Password field -->
        <UFormField label="New Password" name="password" :error="fieldErrors.password">
          <UInput
            v-model="form.password"
            type="password"
            placeholder="Enter new password"
            icon="i-heroicons-lock-closed"
            size="lg"
            :disabled="isLoading"
            class="w-full"
          />
          <!-- Password strength indicator -->
          <div v-if="form.password" class="mt-2">
            <div class="flex gap-1 mb-1">
              <div
                v-for="i in 5"
                :key="i"
                class="h-1 flex-1 rounded-full transition-colors"
                :class="i <= passwordStrength.score ? `bg-${passwordStrength.color}-500` : 'bg-gray-700'"
              />
            </div>
            <p class="text-xs" :class="`text-${passwordStrength.color}-500`">
              {{ passwordStrength.label }}
            </p>
          </div>
        </UFormField>

        <!-- Confirm password field -->
        <UFormField label="Confirm Password" name="passwordConfirmation" :error="fieldErrors.passwordConfirmation">
          <UInput
            v-model="form.passwordConfirmation"
            type="password"
            placeholder="Confirm new password"
            icon="i-heroicons-lock-closed"
            size="lg"
            :disabled="isLoading"
            class="w-full"
          />
        </UFormField>

        <!-- Password requirements -->
        <div class="text-xs text-gray-500 space-y-1">
          <p class="font-medium text-gray-400">Password must contain:</p>
          <ul class="list-disc list-inside space-y-0.5">
            <li :class="form.password.length >= 8 ? 'text-green-500' : ''">At least 8 characters</li>
            <li :class="/[A-Z]/.test(form.password) ? 'text-green-500' : ''">One uppercase letter</li>
            <li :class="/[a-z]/.test(form.password) ? 'text-green-500' : ''">One lowercase letter</li>
            <li :class="/[0-9]/.test(form.password) ? 'text-green-500' : ''">One number</li>
          </ul>
        </div>

        <!-- Submit button -->
        <UButton
          type="submit"
          color="primary"
          size="lg"
          block
          :loading="isLoading"
          :disabled="isLoading"
        >
          Reset password
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
