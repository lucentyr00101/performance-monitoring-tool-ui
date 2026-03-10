// Notifications composable — wraps the notification store with polling
const POLL_INTERVAL = 60 * 1000 // 60 seconds

export function useNotifications() {
  const store = useNotificationsStore()
  const authStore = useAuthStore()
  let pollTimer: ReturnType<typeof setInterval> | null = null

  const unreadCount = computed(() => store.unreadCount)
  const notifications = computed(() => store.notifications)
  const isLoading = computed(() => store.isLoading)

  async function fetchNotifications() {
    await store.fetchNotifications()
  }

  async function fetchCounts() {
    await store.fetchCounts()
  }

  async function markAsRead(id: string) {
    await store.markAsRead(id)
  }

  async function markAllAsRead() {
    await store.markAllAsRead()
  }

  function startPolling() {
    stopPolling()
    pollTimer = setInterval(() => {
      store.fetchCounts()
    }, POLL_INTERVAL)
  }

  function stopPolling() {
    if (pollTimer) {
      clearInterval(pollTimer)
      pollTimer = null
    }
  }

  // Auto-start/stop polling with component lifecycle
  if (import.meta.client) {
    onMounted(() => {
      if (authStore.isAuthenticated) {
        fetchCounts()
        startPolling()
      }
    })

    onUnmounted(() => {
      stopPolling()
    })

    watch(() => authStore.isAuthenticated, (authenticated) => {
      if (authenticated) {
        fetchCounts()
        startPolling()
      }
      else {
        stopPolling()
      }
    })
  }

  return {
    unreadCount,
    notifications,
    isLoading,
    fetchNotifications,
    fetchCounts,
    markAsRead,
    markAllAsRead,
    startPolling,
    stopPolling
  }
}
