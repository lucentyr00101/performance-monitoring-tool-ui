/**
 * GET /api/goals
 * List goals with filtering, sorting, and pagination
 */
import { defineEventHandler, getQuery } from 'h3'
import { mockGoals, toGoalListItem } from '../../mocks/goals'
import { successResponse } from '../../mocks/responses'
import type { GoalType, GoalStatus, GoalPriority } from '../../../app/types/goal'

export default defineEventHandler((event) => {
  const query = getQuery(event)
  
  // Parse query parameters
  const page = parseInt(query.page as string) || 1
  const perPage = Math.min(parseInt(query.per_page as string) || 20, 100)
  const search = (query.search as string)?.toLowerCase()
  const type = query.type as GoalType
  const status = query.status as GoalStatus
  const ownerId = query.owner_id as string
  const _departmentId = query.department_id as string
  const parentGoalId = query.parent_goal_id as string
  const dueBefore = query.due_before as string
  const dueAfter = query.due_after as string
  const priority = query.priority as GoalPriority
  const sortBy = (query.sort_by as string) || 'due_date'
  const sortOrder = (query.sort_order as string) || 'asc'

  // Filter goals
  let filtered = [...mockGoals]

  // Type filter
  if (type) {
    filtered = filtered.filter(g => g.type === type)
  }

  // Status filter
  if (status) {
    filtered = filtered.filter(g => g.status === status)
  }

  // Owner filter
  if (ownerId) {
    filtered = filtered.filter(g => g.owner_id === ownerId)
  }

  // Priority filter
  if (priority) {
    filtered = filtered.filter(g => g.priority === priority)
  }

  // Parent goal filter
  if (parentGoalId) {
    filtered = filtered.filter(g => g.parent_goal_id === parentGoalId)
  }

  // Due date filters
  if (dueBefore) {
    const beforeDate = new Date(dueBefore)
    filtered = filtered.filter(g => new Date(g.due_date) <= beforeDate)
  }

  if (dueAfter) {
    const afterDate = new Date(dueAfter)
    filtered = filtered.filter(g => new Date(g.due_date) >= afterDate)
  }

  // Search filter
  if (search && search.length >= 2) {
    filtered = filtered.filter(g => 
      g.title.toLowerCase().includes(search) ||
      g.description?.toLowerCase().includes(search) ||
      g.tags.some(tag => tag.toLowerCase().includes(search))
    )
  }

  // Department filter (would require department lookup in real app)
  // For now, skip this filter as it requires employee->department mapping

  // Sort
  filtered.sort((a, b) => {
    let aVal: string | number | undefined
    let bVal: string | number | undefined
    
    switch (sortBy) {
      case 'title':
        aVal = a.title
        bVal = b.title
        break
      case 'due_date':
        aVal = a.due_date
        bVal = b.due_date
        break
      case 'created_at':
        aVal = a.created_at
        bVal = b.created_at
        break
      case 'updated_at':
        aVal = a.updated_at
        bVal = b.updated_at
        break
      case 'progress':
        // Progress requires calculation, default to due_date for now
        aVal = a.due_date
        bVal = b.due_date
        break
      default:
        aVal = a.due_date
        bVal = b.due_date
    }
    
    if (typeof aVal === 'string' && typeof bVal === 'string') {
      const comparison = aVal.localeCompare(bVal)
      return sortOrder === 'desc' ? -comparison : comparison
    }
    return 0
  })

  // Paginate
  const totalItems = filtered.length
  const totalPages = Math.ceil(totalItems / perPage)
  const startIndex = (page - 1) * perPage
  const paginated = filtered.slice(startIndex, startIndex + perPage)

  // Convert to list items
  const items = paginated.map(toGoalListItem)

  return successResponse(items, {
    pagination: {
      page,
      per_page: perPage,
      total_items: totalItems,
      total_pages: totalPages
    }
  })
})
