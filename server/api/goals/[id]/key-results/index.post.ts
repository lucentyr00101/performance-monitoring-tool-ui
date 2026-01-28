/**
 * POST /api/goals/:id/key-results
 * Add a key result to a goal
 */
import { defineEventHandler, getRouterParam, readBody, createError } from 'h3'
import { 
  findGoalById, 
  mockKeyResults,
  getKeyResultsForGoal,
  generateKeyResultId,
  toKeyResult
} from '../../../../mocks/goals'
import { successResponse } from '../../../../mocks/responses'
import type { KeyResultCreateRequest } from '../../../../../app/types/goal'

export default defineEventHandler(async (event) => {
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

  // Check max key results limit
  const existingKeyResults = getKeyResultsForGoal(goalId)
  if (existingKeyResults.length >= 5) {
    throw createError({
      statusCode: 422,
      data: {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Maximum 5 key results per goal allowed'
        },
        meta: { timestamp: new Date().toISOString() }
      }
    })
  }

  const body = await readBody<KeyResultCreateRequest>(event)

  // Validate required fields
  if (!body.title || body.title.trim().length === 0) {
    throw createError({
      statusCode: 422,
      data: {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Title is required',
          details: [{ field: 'title', message: 'Title is required' }]
        },
        meta: { timestamp: new Date().toISOString() }
      }
    })
  }

  if (body.target_value === undefined || body.target_value === null) {
    throw createError({
      statusCode: 422,
      data: {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Target value is required',
          details: [{ field: 'target_value', message: 'Target value is required' }]
        },
        meta: { timestamp: new Date().toISOString() }
      }
    })
  }

  const now = new Date().toISOString()

  const newKeyResult = {
    id: generateKeyResultId(),
    goal_id: goalId,
    title: body.title.trim(),
    description: body.description?.trim(),
    target_value: body.target_value,
    current_value: 0,
    unit: body.unit,
    status: 'in_progress' as const,
    created_at: now,
    updated_at: now
  }

  mockKeyResults.push(newKeyResult)

  return successResponse(toKeyResult(newKeyResult))
})
