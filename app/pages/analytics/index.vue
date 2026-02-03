<script setup lang="ts">
import type { AnalyticsType } from '~/types/analytics'

definePageMeta({
  layout: 'default',
  middleware: ['auth']
})

const { canViewAnalytics, getAvailableAnalyticsTypes } = useAnalytics()
const { user } = useAuth()

// Get available analytics for user
const availableTypes = computed(() => getAvailableAnalyticsTypes())

// Analytics type cards configuration
const analyticsCards: {
  type: AnalyticsType
  title: string
  description: string
  icon: string
  route: string
  color: string
}[] = [
  {
    type: 'goals',
    title: 'Goal Analytics',
    description: 'Track goal completion rates, trends, and department performance',
    icon: 'heroicons:flag',
    route: '/analytics/goals',
    color: 'primary'
  },
  {
    type: 'performance',
    title: 'Performance Analytics',
    description: 'Analyze rating distributions, trends, and top performers',
    icon: 'heroicons:chart-bar',
    route: '/analytics/performance',
    color: 'success'
  },
  {
    type: 'reviews',
    title: 'Review Cycle Analytics',
    description: 'Monitor review cycle progress and completion by department',
    icon: 'heroicons:clipboard-document-check',
    route: '/analytics/reviews',
    color: 'warning'
  },
  {
    type: 'team',
    title: 'Team Analytics',
    description: 'View team performance metrics and goal progress',
    icon: 'heroicons:user-group',
    route: '/analytics/team',
    color: 'info'
  },
  {
    type: 'employee',
    title: 'My Analytics',
    description: 'View your personal performance metrics and goal progress',
    icon: 'heroicons:user',
    route: '/analytics/me',
    color: 'neutral'
  }
]

// Filter cards based on permissions
const visibleCards = computed(() =>
  analyticsCards.filter(card => canViewAnalytics(card.type))
)

// Get card color classes
function getColorClasses(color: string) {
  const colors: Record<string, { bg: string; border: string; icon: string }> = {
    primary: { bg: 'bg-primary-500/10', border: 'border-primary-500/30 hover:border-primary-500/50', icon: 'text-primary-400' },
    success: { bg: 'bg-green-500/10', border: 'border-green-500/30 hover:border-green-500/50', icon: 'text-green-400' },
    warning: { bg: 'bg-amber-500/10', border: 'border-amber-500/30 hover:border-amber-500/50', icon: 'text-amber-400' },
    info: { bg: 'bg-blue-500/10', border: 'border-blue-500/30 hover:border-blue-500/50', icon: 'text-blue-400' },
    neutral: { bg: 'bg-gray-500/10', border: 'border-gray-500/30 hover:border-gray-500/50', icon: 'text-gray-400' }
  }
  return colors[color] ?? colors.neutral!
}
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 py-8">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-white">Analytics & Reports</h1>
      <p class="text-gray-400 mt-1">View insights and performance metrics</p>
    </div>

    <!-- No access message -->
    <div v-if="!visibleCards.length" class="text-center py-16">
      <UIcon name="heroicons:chart-bar" class="w-16 h-16 mx-auto mb-4 text-gray-600" />
      <h2 class="text-xl font-semibold text-white mb-2">No Analytics Available</h2>
      <p class="text-gray-400">You don't have permission to view any analytics dashboards.</p>
    </div>

    <!-- Analytics Cards Grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <NuxtLink
        v-for="card in visibleCards"
        :key="card.type"
        :to="card.route"
        class="block group"
      >
        <div
          class="bg-gray-900 border rounded-lg p-6 transition-all duration-200"
          :class="getColorClasses(card.color).border"
        >
          <div class="flex items-start gap-4">
            <div
              class="p-3 rounded-lg"
              :class="getColorClasses(card.color).bg"
            >
              <UIcon
                :name="card.icon"
                class="w-6 h-6"
                :class="getColorClasses(card.color).icon"
              />
            </div>
            <div class="flex-1">
              <h3 class="font-semibold text-white group-hover:text-primary-400 transition-colors">
                {{ card.title }}
              </h3>
              <p class="text-sm text-gray-400 mt-1">{{ card.description }}</p>
            </div>
            <UIcon
              name="heroicons:chevron-right"
              class="w-5 h-5 text-gray-600 group-hover:text-gray-400 transition-colors"
            />
          </div>
        </div>
      </NuxtLink>
    </div>

    <!-- Quick Stats (for HR/Admin) -->
    <div v-if="canViewAnalytics('goals') && canViewAnalytics('performance')" class="mt-12">
      <h2 class="text-lg font-semibold text-white mb-4">Quick Overview</h2>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="bg-gray-900 border border-gray-800 rounded-lg p-4 text-center">
          <p class="text-3xl font-bold text-primary-400">156</p>
          <p class="text-sm text-gray-400 mt-1">Total Goals</p>
        </div>
        <div class="bg-gray-900 border border-gray-800 rounded-lg p-4 text-center">
          <p class="text-3xl font-bold text-green-400">68%</p>
          <p class="text-sm text-gray-400 mt-1">Completion Rate</p>
        </div>
        <div class="bg-gray-900 border border-gray-800 rounded-lg p-4 text-center">
          <p class="text-3xl font-bold text-amber-400">3.8</p>
          <p class="text-sm text-gray-400 mt-1">Avg Rating</p>
        </div>
        <div class="bg-gray-900 border border-gray-800 rounded-lg p-4 text-center">
          <p class="text-3xl font-bold text-blue-400">245</p>
          <p class="text-sm text-gray-400 mt-1">Reviews</p>
        </div>
      </div>
    </div>
  </div>
</template>
