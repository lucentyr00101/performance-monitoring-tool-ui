/**
 * GET /api/employees/:id
 * Get a single employee by ID
 */
import { defineEventHandler, getRouterParam, createError } from 'h3'
import { findEmployeeById, toEmployee } from '../../../mocks/employees'
import { successResponse, errorResponse } from '../../../mocks/responses'

export default defineEventHandler((event) => {
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({
      statusCode: 400,
      data: errorResponse('Employee ID is required', 'VALIDATION_ERROR', 400)
    })
  }

  const employee = findEmployeeById(id)

  if (!employee) {
    throw createError({
      statusCode: 404,
      data: errorResponse('Employee not found', 'NOT_FOUND', 404)
    })
  }

  return successResponse(toEmployee(employee))
})
