// POST /api/reviews/:id/acknowledge - Acknowledge a review
import { mockReviews, mockReviewListItems, mockReviewCycles, mockReviewCycleListItems } from '../../../mocks/reviews'
import type { ReviewAcknowledgeRequest, ReviewStatus, Review, ReviewListItem } from '~/types/review'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const body = await readBody<ReviewAcknowledgeRequest>(event)

  if (!id) {
    throw createError({
      statusCode: 400,
      data: {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Review ID is required'
        },
        meta: { timestamp: new Date().toISOString() }
      }
    })
  }

  const reviewIndex = mockReviews.findIndex((r: Review) => r.id === id)

  if (reviewIndex === -1) {
    throw createError({
      statusCode: 404,
      data: {
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Review not found'
        },
        meta: { timestamp: new Date().toISOString() }
      }
    })
  }

  const review = mockReviews[reviewIndex]!

  // Only submitted reviews can be acknowledged
  if (review.status !== 'submitted') {
    throw createError({
      statusCode: 409,
      data: {
        success: false,
        error: {
          code: 'CONFLICT',
          message: 'Only submitted reviews can be acknowledged'
        },
        meta: { timestamp: new Date().toISOString() }
      }
    })
  }

  const now = new Date().toISOString()

  // Update review
  const updatedReview = {
    ...review,
    status: 'acknowledged' as ReviewStatus,
    employee_comments: body.employee_comments ?? review.employee_comments,
    acknowledged_at: now,
    updated_at: now
  }

  mockReviews[reviewIndex] = updatedReview

  // Update list item
  const listIndex = mockReviewListItems.findIndex((r: ReviewListItem) => r.id === id)
  if (listIndex !== -1) {
    mockReviewListItems[listIndex] = {
      ...mockReviewListItems[listIndex]!,
      status: 'acknowledged' as ReviewStatus
    }
  }

  return {
    success: true,
    data: updatedReview,
    meta: {
      timestamp: new Date().toISOString()
    }
  }
})
