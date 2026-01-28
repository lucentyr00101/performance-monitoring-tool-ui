/**
 * GET /api/departments
 * List all departments with optional filtering
 */
import { defineEventHandler, getQuery } from 'h3'
import { mockDepartments, toDepartmentListItem } from '../../mocks/departments'
import { successResponse } from '../../mocks/responses'
import type { DepartmentStatus } from '../../../app/types/department'

export default defineEventHandler((event) => {
  const query = getQuery(event)
  
  // Parse query parameters
  const search = (query.search as string)?.toLowerCase()
  const status = query.status as DepartmentStatus
  const parentId = query.parent_id as string

  // Filter departments
  let filtered = [...mockDepartments]

  // Status filter
  if (status) {
    filtered = filtered.filter(d => d.status === status)
  }

  // Parent filter
  if (parentId) {
    filtered = filtered.filter(d => d.parent_id === parentId)
  }

  // Search filter
  if (search && search.length >= 2) {
    filtered = filtered.filter(d => 
      d.name.toLowerCase().includes(search) ||
      d.description?.toLowerCase().includes(search)
    )
  }

  // Convert to list items
  const items = filtered.map(toDepartmentListItem)

  return successResponse(items, {
    total_departments: filtered.length
  })
})
