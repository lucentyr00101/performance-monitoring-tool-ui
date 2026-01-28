/**
 * DELETE /api/departments/:id
 * Delete a department
 */
import { defineEventHandler, getRouterParam, createError, setResponseStatus } from 'h3'
import { mockDepartments, findDepartmentById, findChildDepartments } from '../../../mocks/departments'
import { findEmployeesByDepartment } from '../../../mocks/employees'
import { errorResponse } from '../../../mocks/responses'

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

  // Check if department has employees
  const employees = findEmployeesByDepartment(id)
  if (employees.length > 0) {
    throw createError({
      statusCode: 409,
      data: errorResponse(
        `Cannot delete department with employees. Reassign ${employees.length} employees first.`,
        'CONFLICT',
        409
      )
    })
  }

  // Check if department has sub-departments
  const children = findChildDepartments(id)
  if (children.length > 0) {
    throw createError({
      statusCode: 409,
      data: errorResponse(
        `Cannot delete department with sub-departments. Delete or reassign ${children.length} sub-departments first.`,
        'CONFLICT',
        409
      )
    })
  }

  // Remove from mock data
  const departmentIndex = mockDepartments.findIndex(d => d.id === id)
  if (departmentIndex !== -1) {
    mockDepartments.splice(departmentIndex, 1)
  }

  setResponseStatus(event, 204)
  return null
})
