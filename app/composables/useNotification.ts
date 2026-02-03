/**
 * Centralized notification system using Nuxt UI Toast
 * Provides consistent, standardized messages for all CRUD operations
 */

export type ErrorType = 'validation' | 'network' | 'server' | 'generic'

export interface NotificationOptions {
  title: string
  description?: string
  color?: 'success' | 'error' | 'warning' | 'info'
  duration?: number
}

export const useNotification = () => {
  const toast = useToast()
  const DEFAULT_DURATION = 4000 // 4 seconds auto-dismiss

  /**
   * Show a success notification for create operations
   */
  const created = (entity: string, description?: string) => {
    toast.add({
      title: `${entity} created successfully`,
      description,
      color: 'success',
      duration: DEFAULT_DURATION
    })
  }

  /**
   * Show a success notification for update operations
   */
  const updated = (entity: string, description?: string) => {
    toast.add({
      title: `${entity} updated successfully`,
      description,
      color: 'success',
      duration: DEFAULT_DURATION
    })
  }

  /**
   * Show a success notification for delete operations
   */
  const deleted = (entity: string, description?: string) => {
    toast.add({
      title: `${entity} deleted successfully`,
      description,
      color: 'success',
      duration: DEFAULT_DURATION
    })
  }

  /**
   * Show a success notification for generic operations
   */
  const success = (title: string, description?: string) => {
    toast.add({
      title,
      description,
      color: 'success',
      duration: DEFAULT_DURATION
    })
  }

  /**
   * Show an error notification with categorization
   */
  const error = (message: string, type: ErrorType = 'generic', description?: string) => {
    let title = message
    let errorDescription = description

    // Categorize errors with appropriate messaging
    switch (type) {
      case 'validation':
        title = message || 'Invalid data'
        errorDescription = errorDescription || 'Please check your input and try again.'
        break
      case 'network':
        title = 'Network error'
        errorDescription = errorDescription || 'Please check your connection and try again.'
        break
      case 'server':
        title = 'Server error'
        errorDescription = errorDescription || 'Please try again later.'
        break
      case 'generic':
      default:
        title = message || 'An error occurred'
        break
    }

    toast.add({
      title,
      description: errorDescription,
      color: 'error',
      duration: DEFAULT_DURATION
    })
  }

  /**
   * Show an error notification for failed CRUD operations
   */
  const failed = (action: string, entity: string, errorType: ErrorType = 'generic') => {
    const message = `Failed to ${action} ${entity}`
    error(message, errorType)
  }

  /**
   * Show a warning notification
   */
  const warning = (title: string, description?: string) => {
    toast.add({
      title,
      description,
      color: 'warning',
      duration: DEFAULT_DURATION
    })
  }

  /**
   * Show an info notification
   */
  const info = (title: string, description?: string) => {
    toast.add({
      title,
      description,
      color: 'info',
      duration: DEFAULT_DURATION
    })
  }

  /**
   * Show a custom notification with full control
   */
  const custom = (options: NotificationOptions) => {
    toast.add({
      duration: DEFAULT_DURATION,
      ...options
    })
  }

  return {
    // CRUD operations
    created,
    updated,
    deleted,
    success,
    
    // Error handling
    error,
    failed,
    
    // Other types
    warning,
    info,
    custom
  }
}
