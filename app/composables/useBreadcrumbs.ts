// Breadcrumb composable — generates breadcrumbs from route path
// Supports custom labels via route meta or a label map

interface BreadcrumbItem {
  label: string
  to?: string
}

const ROUTE_LABELS: Record<string, string> = {
  'reviews': 'Reviews',
  'adhoc': 'Ad-Hoc Reviews',
  'performance': 'Performance',
  'goals': 'Goals',
  'employees': 'Employees',
  'notifications': 'Notifications',
  'profile': 'Profile',
  'settings': 'Settings',
  'self-review': 'Self Review',
  'manager-review': 'Manager Review',
  'results': 'Results',
  'create': 'Create',
  'edit': 'Edit',
  'cycles': 'Review Cycles',
  'templates': 'Templates',
  'analytics': 'Analytics & Reports',
  'me': 'My Analytics',
  'audit': 'Audit Logs',
  'history': 'Review History',
  'hierarchy': 'Hierarchy',
  'forms': 'Review Forms',
}

export function useBreadcrumbs() {
  const route = useRoute()

  const breadcrumbs = computed<BreadcrumbItem[]>(() => {
    const path = route.path
    if (path === '/' || path === '') return []

    const segments = path.split('/').filter(Boolean)
    const items: BreadcrumbItem[] = [{ label: 'Home', to: '/' }]

    let currentPath = ''
    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i]
      currentPath += `/${segment}`
      const isLast = i === segments.length - 1

      // Skip UUID-like segments in label, show as "Details"
      const isId = /^[0-9a-f]{8}-/.test(segment) || /^\d+$/.test(segment)
      const label = isId
        ? 'Details'
        : (ROUTE_LABELS[segment] || segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' '))

      items.push({
        label,
        to: isLast ? undefined : currentPath,
      })
    }

    return items
  })

  return { breadcrumbs }
}
