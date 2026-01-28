/**
 * POST /api/goals/:id/approve
 * Approve a goal (manager action)
 */
import { defineEventHandler, getRouterParam, readBody, createError } from 'h3'
import { mockGoals } from '../../../mocks/goals'
import { successResponse } from '../../../mocks/responses'

interface ApprovalRequest {
  action: 'approve' | 'reject'
  comment?: string
}

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

  // Only pending goals can be approved/rejected
  if (goal.status !== 'pending') {
    throw createError({
      statusCode: 422,
      data: {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Only pending goals can be approved or rejected'
        },
        meta: { timestamp: new Date().toISOString() }
      }
    })
  }

  const body = await readBody<ApprovalRequest>(event)

  if (!body.action || !['approve', 'reject'].includes(body.action)) {
    throw createError({
      statusCode: 422,
      data: {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Action must be either "approve" or "reject"',
          details: [{ field: 'action', message: 'Action must be either "approve" or "reject"' }]
        },
        meta: { timestamp: new Date().toISOString() }
      }
    })
  }

  // Rejection requires a comment
  if (body.action === 'reject' && (!body.comment || body.comment.trim().length < 10)) {
    throw createError({
      statusCode: 422,
      data: {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Rejection requires a comment of at least 10 characters',
          details: [{ field: 'comment', message: 'Rejection requires a comment of at least 10 characters' }]
        },
        meta: { timestamp: new Date().toISOString() }
      }
    })
  }

  const now = new Date().toISOString()
  const newStatus = body.action === 'approve' ? 'active' : 'draft'

  mockGoals[goalIndex] = {
    ...goal,
    status: newStatus,
    updated_at: now
  }

  return successResponse({
    id: goalId,
    status: newStatus,
    action: body.action,
    comment: body.comment,
    updated_at: now
  })
})
