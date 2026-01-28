/**
 * PUT /api/goals/:id/key-results/:krId
 * Update a key result
 */
import { defineEventHandler, getRouterParam, readBody, createError } from 'h3'
import { 
  findGoalById, 
  mockKeyResults,
  mockProgressHistory,
  generateProgressHistoryId,
  toKeyResult,
  type MockKeyResult
} from '../../../../mocks/goals'
import { successResponse } from '../../../../mocks/responses'
import type { KeyResultUpdateRequest } from '../../../../../app/types/goal'

export default defineEventHandler(async (event) => {
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

  const body = await readBody<KeyResultUpdateRequest>(event)
  const keyResult = mockKeyResults[keyResultIndex]!
  const now = new Date().toISOString()

  // Track progress change for history
  if (body.current_value !== undefined && body.current_value !== keyResult.current_value) {
    mockProgressHistory.push({
      id: generateProgressHistoryId(),
      goal_id: goalId,
      key_result_id: krId,
      old_value: keyResult.current_value,
      new_value: body.current_value,
      comment: undefined,
      updated_by_id: goal.owner_id, // In real app, this would be authenticated user
      created_at: now
    })
  }

  // Determine if status should be updated based on progress
  let newStatus = body.status ?? keyResult.status
  if (body.current_value !== undefined && body.target_value !== undefined) {
    if (body.current_value >= body.target_value) {
      newStatus = 'completed'
    }
  } else if (body.current_value !== undefined) {
    if (body.current_value >= keyResult.target_value) {
      newStatus = 'completed'
    }
  }

  // Update key result
  const updatedKeyResult = {
    ...keyResult,
    title: body.title?.trim() ?? keyResult.title,
    description: body.description !== undefined ? body.description?.trim() : keyResult.description,
    target_value: body.target_value ?? keyResult.target_value,
    current_value: body.current_value ?? keyResult.current_value,
    unit: body.unit ?? keyResult.unit,
    status: newStatus,
    updated_at: now
  }

  mockKeyResults[keyResultIndex] = updatedKeyResult

  return successResponse(toKeyResult(updatedKeyResult))
})
