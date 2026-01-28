/**
 * GET /api/departments/:id
 * Get a single department by ID
 */
import { defineEventHandler, getRouterParam, createError } from 'h3'
import { findDepartmentById, toDepartment } from '../../../mocks/departments'
import { successResponse, errorResponse } from '../../../mocks/responses'

export default defineEventHandler((event) => {
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({
      statusCode: 400,
      data: errorResponse('Department ID is required', 'VALIDATION_ERROR', 400)
    })
  }

  const department = findDepartmentById(id)

  if (!department) {
    throw createError({
      statusCode: 404,
      data: errorResponse('Department not found', 'NOT_FOUND', 404)
    })
  }

  return successResponse(toDepartment(department))
})
