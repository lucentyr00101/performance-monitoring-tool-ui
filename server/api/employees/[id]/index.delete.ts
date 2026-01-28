/**
 * DELETE /api/employees/:id
 * Delete an employee (soft delete - sets status to terminated)
 */
import { defineEventHandler, getRouterParam, createError, setResponseStatus } from 'h3'
import { mockEmployees, findEmployeeById, findDirectReports } from '../../../mocks/employees'
import { errorResponse } from '../../../mocks/responses'

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

  // Check if employee has direct reports
  const directReports = findDirectReports(id)
  if (directReports.length > 0) {
    throw createError({
      statusCode: 409,
      data: errorResponse(
        `Cannot delete employee with direct reports. Reassign ${directReports.length} employees first.`,
        'CONFLICT',
        409
      )
    })
  }

  // Soft delete - set status to terminated
  const employeeIndex = mockEmployees.findIndex(e => e.id === id)
  if (employeeIndex !== -1) {
    const employee = mockEmployees[employeeIndex]!
    employee.employment_status = 'terminated'
    employee.updated_at = new Date().toISOString()
  }

  setResponseStatus(event, 204)
  return null
})
