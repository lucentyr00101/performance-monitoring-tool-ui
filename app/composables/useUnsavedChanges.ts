// Unsaved changes guard composable
// Warns users before navigating away from forms with unsaved data

export function useUnsavedChanges(isDirty: Ref<boolean> | (() => boolean)) {
  const dirty = computed(() => {
    return typeof isDirty === 'function' ? isDirty() : isDirty.value
  })

  // Browser beforeunload event
  function handleBeforeUnload(e: BeforeUnloadEvent) {
    if (dirty.value) {
      e.preventDefault()
    }
  }

  if (import.meta.client) {
    onMounted(() => {
      window.addEventListener('beforeunload', handleBeforeUnload)
    })

    onUnmounted(() => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    })
  }

  // Vue Router navigation guard
  onBeforeRouteLeave((_to, _from, next) => {
    if (dirty.value) {
      const confirmed = window.confirm(
        'You have unsaved changes. Are you sure you want to leave?'
      )
      next(confirmed)
    }
    else {
      next()
    }
  })

  return { isDirty: dirty }
}
