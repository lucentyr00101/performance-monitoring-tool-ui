/**
 * GET /api/departments/:id/employees
 * Get employees in a department
 */
import { defineEventHandler, getRouterParam, getQuery, createError } from 'h3'
import { findDepartmentById, findChildDepartments } from '../../../mocks/departments'
import { findEmployeesByDepartment, toEmployeeListItem } from '../../../mocks/employees'
import { successResponse, errorResponse } from '../../../mocks/responses'
import type { EmploymentStatus } from '../../../../app/types/employee'

export default defineEventHandler((event) => {
  const id = getRouterParam(event, 'id')
  const query = getQuery(event)

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

  // Get employees
  let employees = findEmployeesByDepartment(id)

  // Include sub-departments if requested
  if (query.include_sub === 'true') {
    const getChildEmployees = (deptId: string): typeof employees => {
      const children = findChildDepartments(deptId)
      let childEmployees: typeof employees = []
      for (const child of children) {
        childEmployees = [...childEmployees, ...findEmployeesByDepartment(child.id)]
        childEmployees = [...childEmployees, ...getChildEmployees(child.id)]
      }
      return childEmployees
    }
    employees = [...employees, ...getChildEmployees(id)]
  }

  // Filter by status
  const status = query.status as EmploymentStatus
  if (status) {
    employees = employees.filter(e => e.employment_status === status)
  }

  // Pagination
  const page = parseInt(query.page as string) || 1
  const perPage = Math.min(parseInt(query.per_page as string) || 20, 100)
  const totalItems = employees.length
  const totalPages = Math.ceil(totalItems / perPage)
  const startIndex = (page - 1) * perPage
  const paginated = employees.slice(startIndex, startIndex + perPage)

  // Convert to list items
  const items = paginated.map(toEmployeeListItem)

  return successResponse(items, {
    pagination: {
      page,
      per_page: perPage,
      total_items: totalItems,
      total_pages: totalPages
    }
  })
})
