/**
 * POST /api/goals
 * Create a new goal
 */
import { defineEventHandler, readBody, createError } from 'h3'
import { 
  mockGoals, 
  mockKeyResults,
  generateGoalId, 
  generateKeyResultId,
  getOwnerById,
  toGoal
} from '../../mocks/goals'
import { successResponse } from '../../mocks/responses'
import type { GoalCreateRequest } from '../../../app/types/goal'

export default defineEventHandler(async (event) => {
  const body = await readBody<GoalCreateRequest>(event)
  
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

  if (body.title.length > 255) {
    throw createError({
      statusCode: 422,
      data: {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Title must be 255 characters or less',
          details: [{ field: 'title', message: 'Title must be 255 characters or less' }]
        },
        meta: { timestamp: new Date().toISOString() }
      }
    })
  }

  if (!body.type) {
    throw createError({
      statusCode: 422,
      data: {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Goal type is required',
          details: [{ field: 'type', message: 'Goal type is required' }]
        },
        meta: { timestamp: new Date().toISOString() }
      }
    })
  }

  if (!body.due_date) {
    throw createError({
      statusCode: 422,
      data: {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Due date is required',
          details: [{ field: 'due_date', message: 'Due date is required' }]
        },
        meta: { timestamp: new Date().toISOString() }
      }
    })
  }

  if (!body.owner_id) {
    throw createError({
      statusCode: 422,
      data: {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Owner is required',
          details: [{ field: 'owner_id', message: 'Owner is required' }]
        },
        meta: { timestamp: new Date().toISOString() }
      }
    })
  }

  // Validate owner exists
  const owner = getOwnerById(body.owner_id)
  if (!owner) {
    throw createError({
      statusCode: 404,
      data: {
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Owner not found'
        },
        meta: { timestamp: new Date().toISOString() }
      }
    })
  }

  // Validate parent goal if provided
  if (body.parent_goal_id) {
    const parentGoal = mockGoals.find(g => g.id === body.parent_goal_id)
    if (!parentGoal) {
      throw createError({
        statusCode: 404,
        data: {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Parent goal not found'
          },
          meta: { timestamp: new Date().toISOString() }
        }
      })
    }
  }

  // Validate key results (min 0, max 5)
  if (body.key_results && body.key_results.length > 5) {
    throw createError({
      statusCode: 422,
      data: {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Maximum 5 key results allowed',
          details: [{ field: 'key_results', message: 'Maximum 5 key results allowed' }]
        },
        meta: { timestamp: new Date().toISOString() }
      }
    })
  }

  const now = new Date().toISOString()
  const goalId = generateGoalId()

  // Create the goal
  const newGoal = {
    id: goalId,
    title: body.title.trim(),
    description: body.description?.trim(),
    type: body.type,
    status: 'draft' as const,
    priority: body.priority || 'medium' as const,
    visibility: body.visibility || 'team' as const,
    owner_id: body.owner_id,
    parent_goal_id: body.parent_goal_id,
    tags: body.tags || [],
    start_date: body.start_date,
    due_date: body.due_date,
    created_at: now,
    updated_at: now
  }

  // Add to mock storage
  mockGoals.push(newGoal)

  // Create key results if provided
  if (body.key_results && body.key_results.length > 0) {
    for (const kr of body.key_results) {
      const newKeyResult = {
        id: generateKeyResultId(),
        goal_id: goalId,
        title: kr.title.trim(),
        description: kr.description?.trim(),
        target_value: kr.target_value,
        current_value: 0,
        unit: kr.unit,
        status: 'in_progress' as const,
        created_at: now,
        updated_at: now
      }
      mockKeyResults.push(newKeyResult)
    }
  }

  // Return the created goal
  const createdGoal = toGoal(newGoal)

  return successResponse(createdGoal)
})
