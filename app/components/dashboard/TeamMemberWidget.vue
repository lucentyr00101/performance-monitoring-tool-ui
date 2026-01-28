<script setup lang="ts">
import type { TeamMember } from '~/types/dashboard'

defineProps<{
  title: string
  members: TeamMember[]
  loading?: boolean
  viewAllLink?: string
  maxItems?: number
}>()

function getStatusColor(status: TeamMember['status']): 'success' | 'primary' | 'warning' | 'error' {
  const colors: Record<TeamMember['status'], 'success' | 'primary' | 'warning' | 'error'> = {
    exceeding: 'success',
    on_track: 'primary',
    needs_attention: 'warning',
    at_risk: 'error'
  }
  return colors[status]
}

function getStatusLabel(status: TeamMember['status']): string {
  const labels: Record<TeamMember['status'], string> = {
    exceeding: 'Exceeding',
    on_track: 'On Track',
    needs_attention: 'Needs Attention',
    at_risk: 'At Risk'
  }
  return labels[status]
}

function getProgressBarColor(status: TeamMember['status']): string {
  const colors: Record<TeamMember['status'], string> = {
    exceeding: 'bg-emerald-500',
    on_track: 'bg-primary-500',
    needs_attention: 'bg-amber-500',
    at_risk: 'bg-red-500'
  }
  return colors[status]
}
</script>

<template>
  <UCard class="bg-gray-900 ring-gray-800">
    <template #header>
      <div class="flex items-center justify-between">
        <h3 class="font-semibold text-white">{{ title }}</h3>
        <NuxtLink
          v-if="viewAllLink"
          :to="viewAllLink"
          class="text-sm text-primary-500 hover:text-primary-400 transition-colors"
        >
          View All →
        </NuxtLink>
      </div>
    </template>

    <!-- Loading skeleton -->
    <template v-if="loading">
      <div class="space-y-3">
        <div v-for="i in 4" :key="i" class="flex items-center gap-3">
          <USkeleton class="w-10 h-10 rounded-full shrink-0" />
          <div class="flex-1 space-y-2">
            <USkeleton class="h-4 w-32" />
            <USkeleton class="h-2 w-full rounded-full" />
          </div>
          <USkeleton class="h-5 w-16" />
        </div>
      </div>
    </template>

    <!-- Empty state -->
    <template v-else-if="!members?.length">
      <div class="text-center py-8 text-gray-500">
        <UIcon name="i-heroicons-users" class="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p>No team members</p>
      </div>
    </template>

    <!-- Content -->
    <template v-else>
      <div class="space-y-3 max-h-80 overflow-y-auto">
        <NuxtLink
          v-for="member in members.slice(0, maxItems || 8)"
          :key="member.id"
          :to="member.link || '#'"
          class="flex items-center gap-3 p-2 -mx-2 rounded-lg hover:bg-gray-800/50 transition-colors group"
        >
          <!-- Avatar -->
          <UAvatar
            :src="member.avatarUrl"
            :alt="member.name"
            size="sm"
          />

          <!-- Info -->
          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between gap-2">
              <p class="text-sm font-medium text-gray-200 group-hover:text-white transition-colors truncate">
                {{ member.name }}
              </p>
              <span class="text-sm font-medium text-white shrink-0">{{ member.progress }}%</span>
            </div>
            <div class="flex items-center gap-2 mt-1">
              <div class="flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                <div
                  class="h-full rounded-full transition-all duration-500"
                  :class="getProgressBarColor(member.status)"
                  :style="{ width: `${member.progress}%` }"
                />
              </div>
              <UBadge :color="getStatusColor(member.status)" size="xs" variant="subtle" class="shrink-0">
                {{ getStatusLabel(member.status) }}
              </UBadge>
            </div>
          </div>
        </NuxtLink>
      </div>
    </template>
  </UCard>
</template>
