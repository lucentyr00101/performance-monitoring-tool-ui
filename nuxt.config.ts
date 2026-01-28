// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: [
    '@nuxt/eslint',
    '@nuxt/scripts',
    '@nuxt/test-utils',
    '@nuxt/ui',
    '@nuxt/image',
    '@pinia/nuxt'
  ],

  css: ['~/assets/css/main.css'],

  runtimeConfig: {
    public: {
      // API Gateway URL (if using single gateway for all services)
      apiGatewayUrl: process.env.NUXT_PUBLIC_API_GATEWAY_URL || '',

      // Individual microservice URLs (used if apiGatewayUrl is not set)
      // Leave empty to use internal Nuxt mock endpoints
      authServiceUrl: process.env.NUXT_PUBLIC_AUTH_SERVICE_URL || '',
      employeeServiceUrl: process.env.NUXT_PUBLIC_EMPLOYEE_SERVICE_URL || '',
      goalsServiceUrl: process.env.NUXT_PUBLIC_GOALS_SERVICE_URL || '',
      reviewsServiceUrl: process.env.NUXT_PUBLIC_REVIEWS_SERVICE_URL || '',
      analyticsServiceUrl: process.env.NUXT_PUBLIC_ANALYTICS_SERVICE_URL || ''
    }
  }
})