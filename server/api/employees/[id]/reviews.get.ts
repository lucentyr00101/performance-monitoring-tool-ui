/**
 * GET /api/employees/:id/reviews
 * Get reviews for an employee
 */
import { defineEventHandler, getRouterParam, getQuery, createError } from 'h3'
import { findEmployeeById, getManagerInfo } from '../../../mocks/employees'
import { successResponse, errorResponse } from '../../../mocks/responses'
import type { EmployeeReviewSummary } from '../../../../app/types/employee'

// Mock reviews data
const mockReviews: Record<string, EmployeeReviewSummary[]> = {
  'emp_006': [ // Michael Chen
    {
      id: 'review_001',
      cycle: { id: 'cycle_001', name: 'Q4 2025 Review' },
      type: 'manager',
      reviewer: getManagerInfo('emp_001'),
      status: 'submitted',
      rating: 4.5,
      submitted_at: '2025-12-20T15:00:00Z'
    },
    {
      id: 'review_002',
      cycle: { id: 'cycle_001', name: 'Q4 2025 Review' },
      type: 'self',
      status: 'submitted',
      rating: 4.0,
      submitted_at: '2025-12-18T10:00:00Z'
    },
    {
      id: 'review_003',
      cycle: { id: 'cycle_002', name: 'Q3 2025 Review' },
      type: 'manager',
      reviewer: getManagerInfo('emp_001'),
      status: 'acknowledged',
      rating: 4.2,
      submitted_at: '2025-09-25T14:00:00Z'
    }
  ],
  'emp_007': [ // Emily Davis
    {
      id: 'review_004',
      cycle: { id: 'cycle_001', name: 'Q4 2025 Review' },
      type: 'manager',
      reviewer: getManagerInfo('emp_006'),
      status: 'submitted',
      rating: 4.3,
      submitted_at: '2025-12-22T11:00:00Z'
    },
    {
      id: 'review_005',
      cycle: { id: 'cycle_001', name: 'Q4 2025 Review' },
      type: 'self',
      status: 'submitted',
      rating: 4.0,
      submitted_at: '2025-12-19T09:00:00Z'
    }
  ]
}

// Default reviews for employees without specific mock data
const defaultReviews: EmployeeReviewSummary[] = [
  {
    id: 'review_default_001',
    cycle: { id: 'cycle_001', name: 'Q4 2025 Review' },
    type: 'self',
    status: 'pending',
    submitted_at: undefined
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

  // Get reviews for this employee
  let reviews = mockReviews[id] || defaultReviews

  // Filter by cycle
  if (query.cycle_id) {
    reviews = reviews.filter(r => r.cycle.id === query.cycle_id)
  }

  // Filter by type
  if (query.type) {
    reviews = reviews.filter(r => r.type === query.type)
  }

  // Filter by status
  if (query.status) {
    reviews = reviews.filter(r => r.status === query.status)
  }

  return successResponse(reviews)
})
