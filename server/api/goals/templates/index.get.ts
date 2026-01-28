/**
 * GET /api/goals/templates
 * List goal templates
 */
import { defineEventHandler, getQuery } from 'h3'
import { mockTemplates } from '../../../mocks/goals'
import { successResponse } from '../../../mocks/responses'
import type { GoalType } from '../../../../app/types/goal'

export default defineEventHandler((event) => {
  const query = getQuery(event)
  
  const type = query.type as GoalType
  const category = query.category as string
  const activeOnly = query.active_only !== 'false' // Default to true

  let filtered = [...mockTemplates]

  // Filter by type
  if (type) {
    filtered = filtered.filter(t => t.type === type)
  }

  // Filter by category
  if (category) {
    filtered = filtered.filter(t => t.category.toLowerCase() === category.toLowerCase())
  }

  // Filter by active status
  if (activeOnly) {
    filtered = filtered.filter(t => t.is_active)
  }

  return successResponse(filtered)
})
