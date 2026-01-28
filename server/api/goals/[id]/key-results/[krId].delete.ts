/**
 * DELETE /api/goals/:id/key-results/:krId
 * Delete a key result
 */
import { defineEventHandler, getRouterParam, createError, setResponseStatus } from 'h3'
import { 
  findGoalById, 
  mockKeyResults,
  getKeyResultsForGoal,
  type MockKeyResult
} from '../../../../mocks/goals'

export default defineEventHandler((event) => {
  const goalId = getRouterParam(event, 'id')
  const krId = getRouterParam(event, 'krId')
  
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

  if (!krId) {
    throw createError({
      statusCode: 400,
      data: {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Key Result ID is required'
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

  const keyResultIndex = mockKeyResults.findIndex((kr: MockKeyResult) => kr.id === krId && kr.goal_id === goalId)
  
  if (keyResultIndex === -1) {
    throw createError({
      statusCode: 404,
      data: {
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Key result not found'
        },
        meta: { timestamp: new Date().toISOString() }
      }
    })
  }

  // Check if this is the last key result
  const existingKeyResults = getKeyResultsForGoal(goalId)
  if (existingKeyResults.length <= 1 && goal.status === 'active') {
    throw createError({
      statusCode: 422,
      data: {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Active goals must have at least one key result'
        },
        meta: { timestamp: new Date().toISOString() }
      }
    })
  }

  // Remove the key result
  mockKeyResults.splice(keyResultIndex, 1)

  setResponseStatus(event, 204)
  return null
})
