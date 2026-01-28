/**
 * PATCH /api/goals/:id/progress
 * Update goal progress
 */
import { defineEventHandler, getRouterParam, readBody, createError } from 'h3'
import { 
  mockGoals, 
  mockProgressHistory,
  calculateGoalProgress,
  generateProgressHistoryId
} from '../../../mocks/goals'
import { successResponse } from '../../../mocks/responses'
import type { GoalProgressRequest } from '../../../../app/types/goal'

export default defineEventHandler(async (event) => {
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

  const body = await readBody<GoalProgressRequest>(event)
  const goal = mockGoals[goalIndex]!

  // Validate progress value
  if (body.progress === undefined || body.progress === null) {
    throw createError({
      statusCode: 422,
      data: {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Progress value is required',
          details: [{ field: 'progress', message: 'Progress value is required' }]
        },
        meta: { timestamp: new Date().toISOString() }
      }
    })
  }

  if (body.progress < 0 || body.progress > 100) {
    throw createError({
      statusCode: 422,
      data: {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Progress must be between 0 and 100',
          details: [{ field: 'progress', message: 'Progress must be between 0 and 100' }]
        },
        meta: { timestamp: new Date().toISOString() }
      }
    })
  }

  // Only active goals can have progress updated
  if (goal.status !== 'active') {
    throw createError({
      statusCode: 422,
      data: {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Can only update progress on active goals'
        },
        meta: { timestamp: new Date().toISOString() }
      }
    })
  }

  const oldProgress = calculateGoalProgress(id)
  const now = new Date().toISOString()

  // Record progress history
  mockProgressHistory.push({
    id: generateProgressHistoryId(),
    goal_id: id,
    old_value: oldProgress,
    new_value: body.progress,
    comment: body.note,
    updated_by_id: goal.owner_id, // In real app, this would be the authenticated user
    created_at: now
  })

  // Update goal
  const newStatus = body.progress >= 100 ? 'completed' : goal.status
  
  mockGoals[goalIndex] = {
    ...goal,
    status: newStatus,
    completed_at: newStatus === 'completed' ? now : goal.completed_at,
    updated_at: now
  }

  return successResponse({
    id: goal.id,
    progress: body.progress,
    status: newStatus,
    updated_at: now
  })
})
