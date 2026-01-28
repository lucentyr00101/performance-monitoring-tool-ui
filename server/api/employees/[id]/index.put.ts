/**
 * PUT /api/employees/:id
 * Update an employee
 */
import { defineEventHandler, getRouterParam, readBody, createError } from 'h3'
import { mockEmployees, toEmployee } from '../../../mocks/employees'
import { successResponse, errorResponse } from '../../../mocks/responses'
import { findDepartmentById } from '../../../mocks/departments'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)

  if (!id) {
    throw createError({
      statusCode: 400,
      data: errorResponse('Employee ID is required', 'VALIDATION_ERROR', 400)
    })
  }

  const employeeIndex = mockEmployees.findIndex(e => e.id === id)

  if (employeeIndex === -1) {
    throw createError({
      statusCode: 404,
      data: errorResponse('Employee not found', 'NOT_FOUND', 404)
    })
  }

  // Check email uniqueness if changing
  const existingEmployee = mockEmployees[employeeIndex]!
  if (body.email && body.email !== existingEmployee.email) {
    const existingEmail = mockEmployees.find(
      e => e.email.toLowerCase() === body.email.toLowerCase() && e.id !== id
    )
    if (existingEmail) {
      throw createError({
        statusCode: 422,
        data: errorResponse(
          'Email already exists',
          'VALIDATION_ERROR',
          422,
          { field: 'email', message: 'Email already exists' }
        )
      })
    }
  }

  // Get department name if changing department
  let departmentName = existingEmployee.department_name
  if (body.department_id && body.department_id !== existingEmployee.department_id) {
    const dept = findDepartmentById(body.department_id)
    if (dept) {
      departmentName = dept.name
    }
  }

  // Update employee
  const updated = {
    ...existingEmployee,
    ...body,
    department_name: body.department_id ? departmentName : existingEmployee.department_name,
    updated_at: new Date().toISOString()
  }

  mockEmployees[employeeIndex] = updated

  return successResponse(toEmployee(updated))
})
