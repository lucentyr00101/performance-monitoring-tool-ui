/**
 * GET /api/employees/:id/team
 * Get direct reports for a manager
 */
import { defineEventHandler, getRouterParam, createError } from 'h3'
import { findEmployeeById, findDirectReports } from '../../../mocks/employees'
import { successResponse, errorResponse } from '../../../mocks/responses'
import type { EmployeeTeamMember } from '../../../../app/types/employee'

// Mock active goals/reviews count per employee
const mockTeamStats: Record<string, { goals: number; reviews: number }> = {
  'emp_007': { goals: 2, reviews: 1 },
  'emp_008': { goals: 3, reviews: 0 },
  'emp_009': { goals: 1, reviews: 1 },
  'emp_010': { goals: 2, reviews: 0 },
  'emp_017': { goals: 0, reviews: 0 }
}

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

  // Get direct reports
  const directReports = findDirectReports(id)

  // Map to team member format
  const teamMembers: EmployeeTeamMember[] = directReports.map(dr => {
    const stats = mockTeamStats[dr.id] || { goals: 1, reviews: 0 }
    return {
      id: dr.id,
      first_name: dr.first_name,
      last_name: dr.last_name,
      email: dr.email,
      job_title: dr.job_title,
      employment_status: dr.employment_status,
      avatar_url: dr.avatar_url,
      active_goals_count: stats.goals,
      pending_reviews_count: stats.reviews
    }
  })

  return successResponse(teamMembers, {
    total_direct_reports: teamMembers.length
  })
})
