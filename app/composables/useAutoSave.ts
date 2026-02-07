// Auto-save composable for review forms
// Debounces save-draft calls at a configurable interval

const DEFAULT_INTERVAL = 30000 // 30 seconds

interface UseAutoSaveOptions {
  interval?: number
  onSave: () => Promise<void>
  enabled?: Ref<boolean> | boolean
}

export function useAutoSave(options: UseAutoSaveOptions) {
  const { interval = DEFAULT_INTERVAL, onSave } = options

  const isDirty = ref(false)
  const isSaving = ref(false)
  const lastSavedAt = ref<Date | null>(null)
  let timer: ReturnType<typeof setInterval> | null = null

  const enabled = computed(() => {
    if (typeof options.enabled === 'boolean') return options.enabled
    return options.enabled?.value ?? true
  })

  const statusText = computed(() => {
    if (isSaving.value) return 'Saving...'
    if (lastSavedAt.value) {
      const seconds = Math.floor((Date.now() - lastSavedAt.value.getTime()) / 1000)
      if (seconds < 10) return 'Saved'
      return 'Unsaved changes'
    }
    return isDirty.value ? 'Unsaved changes' : ''
  })

  function markDirty() {
    isDirty.value = true
  }

  async function save() {
    if (!isDirty.value || isSaving.value || !enabled.value) return

    isSaving.value = true
    try {
      await onSave()
      isDirty.value = false
      lastSavedAt.value = new Date()
    }
    catch {
      // Silently fail — auto-save should not interrupt user
    }
    finally {
      isSaving.value = false
    }
  }

  function start() {
    stop()
    timer = setInterval(() => {
      if (isDirty.value && enabled.value) {
        save()
      }
    }, interval)
  }

  function stop() {
    if (timer) {
      clearInterval(timer)
      timer = null
    }
  }

  if (import.meta.client) {
    onMounted(() => start())
    onUnmounted(() => stop())
  }

  return {
    isDirty,
    isSaving,
    lastSavedAt,
    statusText,
    markDirty,
    save,
    start,
    stop
  }
}
