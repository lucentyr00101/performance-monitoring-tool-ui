/**
 * GET /api/employees
 * List employees with filtering, sorting, and pagination
 */
import { defineEventHandler, getQuery } from 'h3'
import { mockEmployees, toEmployeeListItem } from '../../mocks/employees'
import { successResponse } from '../../mocks/responses'
import type { EmploymentStatus, EmploymentType, WorkLocation } from '../../../app/types/employee'

export default defineEventHandler((event) => {
  const query = getQuery(event)
  
  // Parse query parameters
  const page = parseInt(query.page as string) || 1
  const perPage = Math.min(parseInt(query.per_page as string) || 25, 100)
  const search = (query.search as string)?.toLowerCase()
  const departmentId = query.department_id as string
  const managerId = query.manager_id as string
  const status = query.status as EmploymentStatus
  const employmentType = query.employment_type as EmploymentType
  const workLocation = query.work_location as WorkLocation
  const sortBy = (query.sort_by as string) || 'last_name'
  const sortOrder = (query.sort_order as string) || 'asc'

  // Filter employees
  let filtered = [...mockEmployees]

  // Status filter (default to active if not specified)
  if (status) {
    filtered = filtered.filter(e => e.employment_status === status)
  }

  // Search filter
  if (search && search.length >= 2) {
    filtered = filtered.filter(e => 
      e.first_name.toLowerCase().includes(search) ||
      e.last_name.toLowerCase().includes(search) ||
      e.email.toLowerCase().includes(search) ||
      e.job_title.toLowerCase().includes(search)
    )
  }

  // Department filter
  if (departmentId) {
    filtered = filtered.filter(e => e.department_id === departmentId)
  }

  // Manager filter
  if (managerId) {
    filtered = filtered.filter(e => e.manager_id === managerId)
  }

  // Employment type filter
  if (employmentType) {
    filtered = filtered.filter(e => e.employment_type === employmentType)
  }

  // Work location filter
  if (workLocation) {
    filtered = filtered.filter(e => e.work_location === workLocation)
  }

  // Sort
  filtered.sort((a, b) => {
    let aVal: string | undefined
    let bVal: string | undefined
    
    switch (sortBy) {
      case 'first_name':
        aVal = a.first_name
        bVal = b.first_name
        break
      case 'last_name':
        aVal = a.last_name
        bVal = b.last_name
        break
      case 'department':
        aVal = a.department_name
        bVal = b.department_name
        break
      case 'hire_date':
        aVal = a.hire_date
        bVal = b.hire_date
        break
      case 'email':
        aVal = a.email
        bVal = b.email
        break
      default:
        aVal = a.last_name
        bVal = b.last_name
    }
    
    const comparison = (aVal || '').localeCompare(bVal || '')
    return sortOrder === 'desc' ? -comparison : comparison
  })

  // Paginate
  const totalItems = filtered.length
  const totalPages = Math.ceil(totalItems / perPage)
  const startIndex = (page - 1) * perPage
  const paginated = filtered.slice(startIndex, startIndex + perPage)

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
