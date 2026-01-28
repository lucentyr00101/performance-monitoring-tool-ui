/**
 * GET /api/goals/:id/history
 * Get progress history for a goal
 */
import { defineEventHandler, getRouterParam, getQuery, createError } from 'h3'
import { findGoalById, getProgressHistoryForGoal } from '../../../mocks/goals'
import { successResponse } from '../../../mocks/responses'

export default defineEventHandler((event) => {
  const goalId = getRouterParam(event, 'id')
  const query = getQuery(event)
  
  const page = parseInt(query.page as string) || 1
  const perPage = Math.min(parseInt(query.per_page as string) || 20, 100)
  
  if (!goalId) {
    throw createError({
      statusCode: 400,
      data: {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Goal ID is required'
        },
        meta: { timestamp: new Date().toISOString() }
      }
    })
  }

  const goal = findGoalById(goalId)
  
  if (!goal) {
    throw createError({
      statusCode: 404,
      data: {
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Goal not found'
        },
        meta: { timestamp: new Date().toISOString() }
      }
    })
  }

  const allHistory = getProgressHistoryForGoal(goalId)
  
  // Paginate
  const totalItems = allHistory.length
  const totalPages = Math.ceil(totalItems / perPage)
  const startIndex = (page - 1) * perPage
  const paginated = allHistory.slice(startIndex, startIndex + perPage)

  return successResponse(paginated, {
    pagination: {
      page,
      per_page: perPage,
      total_items: totalItems,
      total_pages: totalPages
    }
  })
})
