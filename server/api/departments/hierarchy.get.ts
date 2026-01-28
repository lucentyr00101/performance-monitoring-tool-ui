/**
 * GET /api/departments/hierarchy
 * Get organizational hierarchy tree
 */
import { defineEventHandler } from 'h3'
import { getHierarchyTree, getMaxDepth, mockDepartments } from '../../mocks/departments'
import { successResponse } from '../../mocks/responses'

export default defineEventHandler(() => {
  const hierarchy = getHierarchyTree()
  const maxDepth = getMaxDepth(hierarchy)
  const activeDepartments = mockDepartments.filter(d => d.status === 'active')

  return successResponse(hierarchy, {
    total_departments: activeDepartments.length,
    max_depth: maxDepth
  })
})
