/**
 * PUT /api/departments/:id
 * Update a department
 */
import { defineEventHandler, getRouterParam, readBody, createError } from 'h3'
import { mockDepartments, findDepartmentById, toDepartment, findChildDepartments } from '../../../mocks/departments'
import { successResponse, errorResponse } from '../../../mocks/responses'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)

  if (!id) {
    throw createError({
      statusCode: 400,
      data: errorResponse('Department ID is required', 'VALIDATION_ERROR', 400)
    })
  }

  const departmentIndex = mockDepartments.findIndex(d => d.id === id)

  if (departmentIndex === -1) {
    throw createError({
      statusCode: 404,
      data: errorResponse('Department not found', 'NOT_FOUND', 404)
    })
  }

  // Check name uniqueness if changing
  const existingDepartment = mockDepartments[departmentIndex]!
  if (body.name && body.name !== existingDepartment.name) {
    const existingName = mockDepartments.find(
      d => d.name.toLowerCase() === body.name.toLowerCase() && d.id !== id
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
  }

  // Validate parent exists if changing and check for circular reference
  if (body.parent_id && body.parent_id !== existingDepartment.parent_id) {
    // Can't be own parent
    if (body.parent_id === id) {
      throw createError({
        statusCode: 422,
        data: errorResponse(
          'Cannot set parent department: this would create a circular reference',
          'VALIDATION_ERROR',
          422
        )
      })
    }

    // Can't be a child of itself
    const checkCircular = (parentId: string): boolean => {
      const children = findChildDepartments(id)
      if (children.some(c => c.id === parentId)) return true
      return children.some(c => checkCircular(c.id))
    }

    if (checkCircular(body.parent_id)) {
      throw createError({
        statusCode: 422,
        data: errorResponse(
          'Cannot set parent department: this would create a circular reference',
          'VALIDATION_ERROR',
          422
        )
      })
    }

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

  // Update department
  const updated = {
    ...existingDepartment,
    ...body,
    updated_at: new Date().toISOString()
  }

  mockDepartments[departmentIndex] = updated

  return successResponse(toDepartment(updated))
})
