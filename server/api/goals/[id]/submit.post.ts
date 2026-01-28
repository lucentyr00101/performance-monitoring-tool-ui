/**
 * POST /api/goals/:id/submit
 * Submit a goal for approval
 */
import { defineEventHandler, getRouterParam, createError } from 'h3'
import { mockGoals, toGoal, getKeyResultsForGoal } from '../../../mocks/goals'
import { successResponse } from '../../../mocks/responses'

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

  const goalIndex = mockGoals.findIndex(g => g.id === goalId)
  
  if (goalIndex === -1) {
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

  const goal = mockGoals[goalIndex]!

  // Only draft goals can be submitted
  if (goal.status !== 'draft') {
    throw createError({
      statusCode: 422,
      data: {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Only draft goals can be submitted for approval'
        },
        meta: { timestamp: new Date().toISOString() }
      }
    })
  }

  // Must have at least one key result
  const keyResults = getKeyResultsForGoal(goalId)
  if (keyResults.length === 0) {
    throw createError({
      statusCode: 422,
      data: {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Goal must have at least one key result before submission'
        },
        meta: { timestamp: new Date().toISOString() }
      }
    })
  }

  const now = new Date().toISOString()

  mockGoals[goalIndex] = {
    ...goal,
    status: 'pending',
    updated_at: now
  }

  return successResponse(toGoal(mockGoals[goalIndex]!))
})
