/**
 * GET /api/employees/:id/goals
 * Get goals for an employee
 */
import { defineEventHandler, getRouterParam, getQuery, createError } from 'h3'
import { findEmployeeById } from '../../../mocks/employees'
import { successResponse, errorResponse } from '../../../mocks/responses'
import type { EmployeeGoalSummary } from '../../../../app/types/employee'

// Mock goals data
const mockGoals: Record<string, EmployeeGoalSummary[]> = {
  'emp_006': [ // Michael Chen - Engineering Manager
    {
      id: 'goal_001',
      title: 'Improve team velocity by 20%',
      type: 'team',
      status: 'active',
      progress: 65,
      due_date: '2026-03-31',
      key_results_count: 3,
      key_results_completed: 1
    },
    {
      id: 'goal_002',
      title: 'Reduce bug count by 40%',
      type: 'team',
      status: 'active',
      progress: 45,
      due_date: '2026-06-30',
      key_results_count: 4,
      key_results_completed: 2
    },
    {
      id: 'goal_003',
      title: 'Complete AWS Solutions Architect certification',
      type: 'individual',
      status: 'completed',
      progress: 100,
      due_date: '2025-12-31',
      key_results_count: 2,
      key_results_completed: 2
    }
  ],
  'emp_007': [ // Emily Davis
    {
      id: 'goal_004',
      title: 'Master Vue 3 Composition API',
      type: 'individual',
      status: 'active',
      progress: 80,
      due_date: '2026-02-28',
      key_results_count: 3,
      key_results_completed: 2
    },
    {
      id: 'goal_005',
      title: 'Complete 2 code review sessions per week',
      type: 'individual',
      status: 'active',
      progress: 60,
      due_date: '2026-03-31',
      key_results_count: 1,
      key_results_completed: 0
    }
  ],
  'emp_011': [ // Rachel Green - Product Manager
    {
      id: 'goal_006',
      title: 'Launch v2.0 product release',
      type: 'team',
      status: 'active',
      progress: 35,
      due_date: '2026-04-15',
      key_results_count: 5,
      key_results_completed: 1
    }
  ]
}

// Default goals for employees without specific mock data
const defaultGoals: EmployeeGoalSummary[] = [
  {
    id: 'goal_default_001',
    title: 'Complete quarterly objectives',
    type: 'individual',
    status: 'active',
    progress: 50,
    due_date: '2026-03-31',
    key_results_count: 2,
    key_results_completed: 1
  }
]

export default defineEventHandler((event) => {
  const id = getRouterParam(event, 'id')
  const query = getQuery(event)

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

  // Get goals for this employee
  let goals = mockGoals[id] || defaultGoals

  // Filter by status
  if (query.status) {
    goals = goals.filter(g => g.status === query.status)
  }

  // Filter by type
  if (query.type) {
    goals = goals.filter(g => g.type === query.type)
  }

  // Pagination
  const page = parseInt(query.page as string) || 1
  const perPage = Math.min(parseInt(query.per_page as string) || 20, 100)
  const startIndex = (page - 1) * perPage
  const paginated = goals.slice(startIndex, startIndex + perPage)

  return successResponse(paginated, {
    pagination: {
      page,
      per_page: perPage,
      total_items: goals.length,
      total_pages: Math.ceil(goals.length / perPage)
    }
  })
})
