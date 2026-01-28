// GET /api/reviews/:id - Get review by ID
import { getReviewById } from '../../../mocks/reviews'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

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

  const review = getReviewById(id)

  if (!review) {
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

  return {
    success: true,
    data: review,
    meta: {
      timestamp: new Date().toISOString()
    }
  }
})
