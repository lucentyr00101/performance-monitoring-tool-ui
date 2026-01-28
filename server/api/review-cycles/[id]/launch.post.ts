// POST /api/review-cycles/:id/launch - Launch a review cycle
import { mockReviewCycles, mockReviewCycleListItems, mockReviews, mockReviewListItems, mockEmployees } from '../../../mocks/reviews'
import type { ReviewCycleStatus, Review, ReviewListItem, ReviewCycle, ReviewCycleListItem, ReviewEmployeeSummary } from '~/types/review'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({
      statusCode: 400,
      data: {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Review cycle ID is required'
        },
        meta: { timestamp: new Date().toISOString() }
      }
    })
  }

  const cycleIndex = mockReviewCycles.findIndex((c: ReviewCycle) => c.id === id)

  if (cycleIndex === -1) {
    throw createError({
      statusCode: 404,
      data: {
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Review cycle not found'
        },
        meta: { timestamp: new Date().toISOString() }
      }
    })
  }

  const cycle = mockReviewCycles[cycleIndex]!

  // Only draft cycles can be launched
  if (cycle.status !== 'draft') {
    throw createError({
      statusCode: 409,
      data: {
        success: false,
        error: {
          code: 'CONFLICT',
          message: 'Only draft review cycles can be launched'
        },
        meta: { timestamp: new Date().toISOString() }
      }
    })
  }

  // Simulate creating reviews for all employees
  const employees = mockEmployees.filter((e: ReviewEmployeeSummary) => e.job_title !== 'Engineering Manager')
  const manager = mockEmployees.find((e: ReviewEmployeeSummary) => e.job_title === 'Engineering Manager')!
  
  let selfCount = 0
  let managerCount = 0

  employees.forEach((employee: ReviewEmployeeSummary) => {
    const timestamp = new Date().toISOString()
    
    // Create self-assessment
    if (cycle.settings.include_self_assessment) {
      const selfReview: Review = {
        id: `review-${Date.now()}-self-${employee.id}`,
        cycle_id: cycle.id,
        cycle: { id: cycle.id, name: cycle.name, type: cycle.type },
        employee_id: employee.id,
        employee: employee,
        reviewer_id: employee.id,
        reviewer: employee,
        type: 'self',
        status: 'pending',
        created_at: timestamp,
        updated_at: timestamp
      }
      mockReviews.push(selfReview)
      mockReviewListItems.push({
        id: selfReview.id,
        cycle: selfReview.cycle,
        employee: selfReview.employee,
        reviewer: selfReview.reviewer,
        type: selfReview.type,
        status: selfReview.status,
        rating: selfReview.rating,
        submitted_at: selfReview.submitted_at
      })
      selfCount++
    }

    // Create manager review
    if (cycle.settings.include_manager_review && manager) {
      const managerReview: Review = {
        id: `review-${Date.now()}-mgr-${employee.id}`,
        cycle_id: cycle.id,
        cycle: { id: cycle.id, name: cycle.name, type: cycle.type },
        employee_id: employee.id,
        employee: employee,
        reviewer_id: manager.id,
        reviewer: manager,
        type: 'manager',
        status: 'pending',
        created_at: timestamp,
        updated_at: timestamp
      }
      mockReviews.push(managerReview)
      mockReviewListItems.push({
        id: managerReview.id,
        cycle: managerReview.cycle,
        employee: managerReview.employee,
        reviewer: managerReview.reviewer,
        type: managerReview.type,
        status: managerReview.status,
        rating: managerReview.rating,
        submitted_at: managerReview.submitted_at
      })
      managerCount++
    }
  })

  // Update cycle status
  const totalReviews = selfCount + managerCount
  mockReviewCycles[cycleIndex] = {
    ...cycle,
    status: 'active' as ReviewCycleStatus,
    stats: {
      total_reviews: totalReviews,
      completed: 0,
      pending: totalReviews,
      in_progress: 0,
      completion_rate: 0,
      by_type: {
        self: { total: selfCount, completed: 0 },
        manager: { total: managerCount, completed: 0 }
      }
    },
    updated_at: new Date().toISOString()
  }

  // Update list item
  const listIndex = mockReviewCycleListItems.findIndex((c: ReviewCycleListItem) => c.id === id)
  if (listIndex !== -1) {
    mockReviewCycleListItems[listIndex] = {
      ...mockReviewCycleListItems[listIndex]!,
      status: 'active' as ReviewCycleStatus,
      stats: mockReviewCycles[cycleIndex]!.stats
    }
  }

  return {
    success: true,
    data: {
      id: cycle.id,
      name: cycle.name,
      status: 'active' as ReviewCycleStatus,
      reviews_created: {
        self: selfCount,
        manager: managerCount,
        total: totalReviews
      },
      notifications_sent: totalReviews,
      launched_at: new Date().toISOString()
    },
    meta: {
      timestamp: new Date().toISOString()
    }
  }
})
