/**
 * POST /api/employees
 * Create a new employee
 */
import { defineEventHandler, readBody, createError } from 'h3'
import { mockEmployees, toEmployee, generateEmployeeCode, generateId } from '../../mocks/employees'
import { successResponse, errorResponse } from '../../mocks/responses'
import { findDepartmentById } from '../../mocks/departments'
import type { MockEmployee } from '../../mocks/employees'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  // Validation
  if (!body.first_name || !body.last_name || !body.email) {
    throw createError({
      statusCode: 422,
      data: errorResponse(
        'Validation failed',
        'VALIDATION_ERROR',
        422,
        {
          fields: [
            ...(!body.first_name ? [{ field: 'first_name', message: 'First name is required' }] : []),
            ...(!body.last_name ? [{ field: 'last_name', message: 'Last name is required' }] : []),
            ...(!body.email ? [{ field: 'email', message: 'Email is required' }] : [])
          ]
        }
      )
    })
  }

  // Check email uniqueness
  const existingEmail = mockEmployees.find(e => e.email.toLowerCase() === body.email.toLowerCase())
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

  // Get department info if provided
  let departmentName = 'Unassigned'
  if (body.department_id) {
    const dept = findDepartmentById(body.department_id)
    if (dept) {
      departmentName = dept.name
    }
  }

  // Create new employee
  const now = new Date().toISOString()
  const newEmployee: MockEmployee = {
    id: generateId(),
    user_id: `usr_${Date.now()}`,
    employee_code: generateEmployeeCode(),
    first_name: body.first_name,
    last_name: body.last_name,
    email: body.email,
    phone: body.phone,
    avatar_url: body.avatar_url || null,
    job_title: body.job_title || 'Employee',
    department_id: body.department_id || 'dept_001',
    department_name: departmentName,
    manager_id: body.manager_id,
    hire_date: body.hire_date || now.split('T')[0],
    employment_type: body.employment_type || 'full-time',
    employment_status: 'active',
    work_location: body.work_location || 'office',
    career_level: body.career_level,
    user_role: body.user_role || 'employee',
    created_at: now,
    updated_at: now
  }

  // Add to mock data
  mockEmployees.push(newEmployee)

  return successResponse(toEmployee(newEmployee))
})
