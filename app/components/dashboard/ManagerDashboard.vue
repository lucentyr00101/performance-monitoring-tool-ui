<script setup lang="ts">
import type { ManagerDashboardData } from '~/types/dashboard'

defineProps<{
  data: ManagerDashboardData
  loading?: boolean
}>()

defineEmits<{
  refresh: []
  action: [actionId: string, action: string]
}>()
</script>

<template>
  <div class="space-y-6 animate-in fade-in duration-300">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-white">Team Dashboard</h1>
        <p class="text-gray-400 mt-1">
          Monitor your team's performance and pending actions.
        </p>
      </div>
      <DashboardQuickActions
        :actions="data?.quickActions || []"
        :loading="loading"
        variant="buttons"
      />
    </div>

    <!-- KPI Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <DashboardKpiCard
        v-for="kpi in data?.kpis || []"
        :key="kpi.id"
        :kpi="kpi"
        :loading="loading"
      />
      <template v-if="loading && !data?.kpis?.length">
        <DashboardKpiCard
          v-for="i in 4"
          :key="i"
          :kpi="{ id: String(i), label: '', value: '' }"
          loading
        />
      </template>
    </div>

    <!-- Pending Actions (full width) -->
    <DashboardActionListWidget
      title="Pending Actions"
      :actions="data?.pendingActions || []"
      :loading="loading"
      view-all-link="/reviews/pending"
      :max-items="5"
      @action="(id, action) => $emit('action', id, action)"
    />

    <!-- Team Members and Goals Alignment -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Team Members -->
      <DashboardTeamMemberWidget
        title="Team Members"
        :members="data?.teamMembers || []"
        :loading="loading"
        view-all-link="/employees"
        :max-items="8"
      />

      <!-- Team Goals Alignment -->
      <DashboardChartWidget
        title="Team Goals Alignment"
        :data="data?.teamGoalsAlignment || { labels: [], datasets: [] }"
        :loading="loading"
        type="bar"
        height="280px"
      />
    </div>

    <!-- Review Deadlines -->
    <UCard class="bg-gray-900 ring-gray-800">
      <template #header>
        <div class="flex items-center justify-between">
          <h3 class="font-semibold text-white">Upcoming Review Deadlines</h3>
          <NuxtLink
            to="/reviews"
            class="text-sm text-primary-500 hover:text-primary-400 transition-colors"
          >
            View All →
          </NuxtLink>
        </div>
      </template>

      <!-- Loading -->
      <template v-if="loading">
        <div class="flex gap-4">
          <USkeleton v-for="i in 3" :key="i" class="h-20 flex-1 rounded-lg" />
        </div>
      </template>

      <!-- Empty state -->
      <template v-else-if="!data?.reviewDeadlines?.length">
        <div class="text-center py-6 text-gray-500">
          <UIcon name="i-heroicons-calendar" class="w-10 h-10 mx-auto mb-2 opacity-50" />
          <p>No upcoming review deadlines</p>
        </div>
      </template>

      <!-- Content -->
      <template v-else>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <NuxtLink
            v-for="deadline in data.reviewDeadlines"
            :key="deadline.id"
            :to="deadline.link || '#'"
            class="p-4 rounded-lg bg-gray-800/50 hover:bg-gray-800 transition-colors"
          >
            <div class="flex items-center gap-3 mb-2">
              <UIcon name="i-heroicons-document-text" class="w-5 h-5 text-gray-400" />
              <p class="text-sm font-medium text-white truncate">
                {{ deadline.title }}
              </p>
            </div>
            <div class="flex items-center justify-between">
              <p class="text-xs text-gray-500">Due {{ deadline.dueDate }}</p>
              <UBadge
                :color="deadline.daysRemaining <= 7 ? 'error' : deadline.daysRemaining <= 14 ? 'warning' : 'neutral'"
                variant="subtle"
                size="xs"
              >
                {{ deadline.daysRemaining }} days
              </UBadge>
            </div>
          </NuxtLink>
        </div>
      </template>
    </UCard>
  </div>
</template>
