// PUT /api/reviews/:id - Update/submit a review
import { mockReviews, mockReviewListItems, mockReviewCycles, mockReviewCycleListItems } from '../../../mocks/reviews'
import type { ReviewUpdateRequest, ReviewStatus, Review, ReviewListItem, ReviewCycle, ReviewCycleListItem } from '~/types/review'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const body = await readBody<ReviewUpdateRequest>(event)

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

  // Only pending or in_progress reviews can be edited
  if (!['pending', 'in_progress'].includes(review.status)) {
    throw createError({
      statusCode: 409,
      data: {
        success: false,
        error: {
          code: 'CONFLICT',
          message: 'Cannot modify a submitted or acknowledged review'
        },
        meta: { timestamp: new Date().toISOString() }
      }
    })
  }

  // If submitting, validate required fields
  if (body.status === 'submitted') {
    if (!body.rating && !review.rating) {
      throw createError({
        statusCode: 400,
        data: {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Rating is required to submit a review'
          },
          meta: { timestamp: new Date().toISOString() }
        }
      })
    }
  }

  const now = new Date().toISOString()

  // Update review
  const updatedReview = {
    ...review,
    rating: body.rating ?? review.rating,
    ratings_breakdown: body.ratings_breakdown ?? review.ratings_breakdown,
    strengths: body.strengths ?? review.strengths,
    improvements: body.improvements ?? review.improvements,
    comments: body.comments ?? review.comments,
    status: (body.status ?? review.status) as ReviewStatus,
    submitted_at: body.status === 'submitted' ? now : review.submitted_at,
    updated_at: now
  }

  mockReviews[reviewIndex] = updatedReview

  // Update list item
  const listIndex = mockReviewListItems.findIndex((r: ReviewListItem) => r.id === id)
  if (listIndex !== -1) {
    mockReviewListItems[listIndex] = {
      id: updatedReview.id,
      cycle: updatedReview.cycle,
      employee: updatedReview.employee,
      reviewer: updatedReview.reviewer,
      type: updatedReview.type,
      status: updatedReview.status,
      rating: updatedReview.rating,
      submitted_at: updatedReview.submitted_at
    }
  }

  // Update cycle stats if status changed to submitted
  if (body.status === 'submitted' && review.status !== 'submitted') {
    const cycleIndex = mockReviewCycles.findIndex((c: ReviewCycle) => c.id === review.cycle_id)
    if (cycleIndex !== -1) {
      const cycle = mockReviewCycles[cycleIndex]!
      const newCompleted = cycle.stats.completed + 1
      const newPending = Math.max(0, cycle.stats.pending - 1)
      const newInProgress = review.status === 'in_progress' ? Math.max(0, (cycle.stats.in_progress || 0) - 1) : cycle.stats.in_progress

      mockReviewCycles[cycleIndex] = {
        ...cycle,
        stats: {
          ...cycle.stats,
          completed: newCompleted,
          pending: newPending,
          in_progress: newInProgress,
          completion_rate: Math.round((newCompleted / cycle.stats.total_reviews) * 100 * 100) / 100
        }
      }

      // Update cycle list item
      const cycleListIndex = mockReviewCycleListItems.findIndex((c: ReviewCycleListItem) => c.id === review.cycle_id)
      if (cycleListIndex !== -1) {
        mockReviewCycleListItems[cycleListIndex] = {
          ...mockReviewCycleListItems[cycleListIndex]!,
          stats: mockReviewCycles[cycleIndex]!.stats
        }
      }
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
