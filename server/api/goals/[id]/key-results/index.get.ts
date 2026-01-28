/**
 * GET /api/goals/:id/key-results
 * Get all key results for a goal
 */
import { defineEventHandler, getRouterParam, createError } from 'h3'
import { findGoalById, getKeyResultsForGoal, toKeyResult } from '../../../../mocks/goals'
import { successResponse } from '../../../../mocks/responses'

export default defineEventHandler((event) => {
  const goalId = getRouterParam(event, 'id')
  
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

  const keyResults = getKeyResultsForGoal(goalId).map(toKeyResult)

  return successResponse(keyResults)
})
