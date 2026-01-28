/**
 * DELETE /api/goals/:id
 * Delete or cancel a goal
 */
import { defineEventHandler, getRouterParam, createError, setResponseStatus } from 'h3'
import { mockGoals, getChildGoals } from '../../../mocks/goals'

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

  const goalIndex = mockGoals.findIndex(g => g.id === id)
  
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

  // Check if goal has child goals
  const childGoals = getChildGoals(id)
  if (childGoals.length > 0) {
    throw createError({
      statusCode: 409,
      data: {
        success: false,
        error: {
          code: 'CONFLICT',
          message: 'Cannot delete goal with child goals. Delete child goals first.'
        },
        meta: { timestamp: new Date().toISOString() }
      }
    })
  }

  // Only draft goals can be permanently deleted
  // Other goals should be cancelled instead
  if (goal.status === 'draft') {
    // Remove from storage
    mockGoals.splice(goalIndex, 1)
  } else if (goal.status === 'completed') {
    throw createError({
      statusCode: 422,
      data: {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Cannot delete completed goals'
        },
        meta: { timestamp: new Date().toISOString() }
      }
    })
  } else {
    // Cancel the goal instead of deleting
    mockGoals[goalIndex] = {
      ...goal,
      status: 'cancelled',
      updated_at: new Date().toISOString()
    }
  }

  setResponseStatus(event, 204)
  return null
})
