/**
 * POST /api/departments
 * Create a new department
 */
import { defineEventHandler, readBody, createError } from 'h3'
import { mockDepartments, toDepartment, generateDepartmentId, findDepartmentById } from '../../mocks/departments'
import { successResponse, errorResponse } from '../../mocks/responses'
import type { MockDepartment } from '../../mocks/departments'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  // Validation
  if (!body.name) {
    throw createError({
      statusCode: 422,
      data: errorResponse(
        'Validation failed',
        'VALIDATION_ERROR',
        422,
        { fields: [{ field: 'name', message: 'Department name is required' }] }
      )
    })
  }

  // Check name uniqueness
  const existingName = mockDepartments.find(
    d => d.name.toLowerCase() === body.name.toLowerCase()
  )
  if (existingName) {
    throw createError({
      statusCode: 409,
      data: errorResponse(
        'A department with this name already exists',
        'CONFLICT',
        409
      )
    })
  }

  // Validate parent exists if provided
  if (body.parent_id) {
    const parent = findDepartmentById(body.parent_id)
    if (!parent) {
      throw createError({
        statusCode: 422,
        data: errorResponse(
          'Parent department not found',
          'VALIDATION_ERROR',
          422,
          { field: 'parent_id', message: 'Parent department not found' }
        )
      })
    }
  }

  // Create new department
  const now = new Date().toISOString()
  const newDepartment: MockDepartment = {
    id: generateDepartmentId(),
    name: body.name,
    description: body.description,
    parent_id: body.parent_id,
    manager_id: body.manager_id,
    employee_count: 0,
    status: 'active',
    created_at: now,
    updated_at: now
  }

  // Add to mock data
  mockDepartments.push(newDepartment)

  return successResponse(toDepartment(newDepartment))
})
