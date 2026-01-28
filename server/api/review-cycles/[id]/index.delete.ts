// DELETE /api/review-cycles/:id - Delete a review cycle
import { mockReviewCycles, mockReviewCycleListItems } from '../../../mocks/reviews'
import type { ReviewCycle, ReviewCycleListItem } from '~/types/review'

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

  // Only draft cycles can be deleted
  if (cycle.status !== 'draft') {
    throw createError({
      statusCode: 409,
      data: {
        success: false,
        error: {
          code: 'CONFLICT',
          message: 'Cannot delete an active or completed review cycle'
        },
        meta: { timestamp: new Date().toISOString() }
      }
    })
  }

  // Remove from arrays
  mockReviewCycles.splice(cycleIndex, 1)
  
  const listIndex = mockReviewCycleListItems.findIndex((c: ReviewCycleListItem) => c.id === id)
  if (listIndex !== -1) {
    mockReviewCycleListItems.splice(listIndex, 1)
  }

  // Return 204 No Content
  setResponseStatus(event, 204)
  return null
})
