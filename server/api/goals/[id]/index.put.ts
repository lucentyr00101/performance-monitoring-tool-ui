/**
 * PUT /api/goals/:id
 * Update an existing goal
 */
import { defineEventHandler, getRouterParam, readBody, createError } from 'h3'
import { mockGoals, toGoal } from '../../../mocks/goals'
import { successResponse } from '../../../mocks/responses'
import type { GoalUpdateRequest } from '../../../../app/types/goal'

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

  const body = await readBody<GoalUpdateRequest>(event)
  const goal = mockGoals[goalIndex]!  // Non-null assertion - we checked index above

  // Validate title if provided
  if (body.title !== undefined) {
    if (body.title.trim().length === 0) {
      throw createError({
        statusCode: 422,
        data: {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Title cannot be empty',
            details: [{ field: 'title', message: 'Title cannot be empty' }]
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
  }

  // Validate parent goal if provided
  if (body.parent_goal_id !== undefined && body.parent_goal_id !== null) {
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
    // Prevent circular reference
    if (body.parent_goal_id === id) {
      throw createError({
        statusCode: 422,
        data: {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Goal cannot be its own parent',
            details: [{ field: 'parent_goal_id', message: 'Goal cannot be its own parent' }]
          },
          meta: { timestamp: new Date().toISOString() }
        }
      })
    }
  }

  // Update goal fields
  const updatedGoal = {
    ...goal,
    title: body.title?.trim() ?? goal.title,
    description: body.description !== undefined ? body.description?.trim() : goal.description,
    type: body.type ?? goal.type,
    status: body.status ?? goal.status,
    priority: body.priority ?? goal.priority,
    visibility: body.visibility ?? goal.visibility,
    owner_id: body.owner_id ?? goal.owner_id,
    parent_goal_id: body.parent_goal_id === null ? undefined : (body.parent_goal_id ?? goal.parent_goal_id),
    start_date: body.start_date ?? goal.start_date,
    due_date: body.due_date ?? goal.due_date,
    tags: body.tags ?? goal.tags,
    updated_at: new Date().toISOString(),
    // If status changed to completed, set completed_at
    completed_at: body.status === 'completed' ? new Date().toISOString() : goal.completed_at
  }

  mockGoals[goalIndex] = updatedGoal

  return successResponse(toGoal(updatedGoal))
})
