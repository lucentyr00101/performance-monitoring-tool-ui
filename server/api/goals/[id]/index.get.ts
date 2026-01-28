/**
 * GET /api/goals/:id
 * Get a single goal with full details
 */
import { defineEventHandler, getRouterParam, createError } from 'h3'
import { findGoalById, toGoal } from '../../../mocks/goals'
import { successResponse } from '../../../mocks/responses'

export default defineEventHandler((event) => {
  const id = getRouterParam(event, 'id')
  
  if (!id) {
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

  const goal = findGoalById(id)
  
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

  return successResponse(toGoal(goal))
})
