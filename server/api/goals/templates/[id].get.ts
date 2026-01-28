/**
 * GET /api/goals/templates/:id
 * Get a single template by ID
 */
import { defineEventHandler, getRouterParam, createError } from 'h3'
import { mockTemplates } from '../../../mocks/goals'
import { successResponse } from '../../../mocks/responses'

export default defineEventHandler((event) => {
  const id = getRouterParam(event, 'id')
  
  if (!id) {
    throw createError({
      statusCode: 400,
      data: {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Template ID is required'
        },
        meta: { timestamp: new Date().toISOString() }
      }
    })
  }

  const template = mockTemplates.find(t => t.id === id)
  
  if (!template) {
    throw createError({
      statusCode: 404,
      data: {
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Template not found'
        },
        meta: { timestamp: new Date().toISOString() }
      }
    })
  }

  return successResponse(template)
})
