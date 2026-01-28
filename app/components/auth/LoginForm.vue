<script setup lang="ts">
import type { ApiError } from '~/types/auth'

const emit = defineEmits<{
  success: []
}>()

const { login, isLoading, isLockedOut, lockoutTimeRemaining } = useAuth()
const route = useRoute()

const form = reactive({
  email: '',
  password: '',
  rememberMe: false
})

const error = ref<string | null>(null)
const fieldErrors = ref<Record<string, string>>({})

const lockoutMinutes = computed(() => {
  return Math.ceil(lockoutTimeRemaining.value / 60000)
})

async function handleSubmit() {
  error.value = null
  fieldErrors.value = {}

  // Basic validation
  if (!form.email) {
    fieldErrors.value.email = 'Email is required'
    return
  }
  if (!form.password) {
    fieldErrors.value.password = 'Password is required'
    return
  }

  try {
    await login({ email: form.email, password: form.password })
    emit('success')

    // Redirect to intended destination or dashboard
    const redirect = route.query.redirect as string
    navigateTo(redirect || '/')
  }
  catch (err) {
    const apiError = err as ApiError
    if (apiError?.error?.code === 'VALIDATION_ERROR' && apiError.error.details) {
      (apiError.error.details as Array<{ field: string; message: string }>).forEach(detail => {
        fieldErrors.value[detail.field] = detail.message
      })
    }
    else {
      error.value = apiError?.error?.message || 'An error occurred. Please try again.'
    }
  }
}
</script>

<template>
  <form class="space-y-5" @submit.prevent="handleSubmit">
    <!-- Lockout warning -->
    <UAlert
      v-if="isLockedOut"
      color="error"
      icon="i-heroicons-lock-closed"
      title="Account Locked"
      :description="`Too many failed attempts. Try again in ${lockoutMinutes} minute${lockoutMinutes !== 1 ? 's' : ''}.`"
    />

    <!-- General error -->
    <UAlert
      v-else-if="error"
      color="error"
      icon="i-heroicons-exclamation-circle"
      :title="error"
      :close-button="{ onClick: () => error = null }"
    />

    <!-- Email field -->
    <UFormField label="Email" name="email" :error="fieldErrors.email">
      <UInput
        v-model="form.email"
        type="email"
        placeholder="Enter your email"
        icon="i-heroicons-envelope"
        size="lg"
        :disabled="isLoading || isLockedOut"
        class="w-full"
      />
    </UFormField>

    <!-- Password field -->
    <UFormField label="Password" name="password" :error="fieldErrors.password">
      <UInput
        v-model="form.password"
        type="password"
        placeholder="Enter your password"
        icon="i-heroicons-lock-closed"
        size="lg"
        :disabled="isLoading || isLockedOut"
        class="w-full"
      />
    </UFormField>

    <!-- Remember me & Forgot password -->
    <div class="flex items-center justify-between">
      <UCheckbox v-model="form.rememberMe" label="Remember me" :disabled="isLoading || isLockedOut" />
      <NuxtLink to="/auth/forgot-password" class="text-sm text-primary-500 hover:text-primary-400">
        Forgot password?
      </NuxtLink>
    </div>

    <!-- Submit button -->
    <UButton
      type="submit"
      color="primary"
      size="lg"
      block
      :loading="isLoading"
      :disabled="isLoading || isLockedOut"
    >
      Sign in
    </UButton>
  </form>
</template>
