// GET /api/review-cycles/:id - Get review cycle by ID
import { getReviewCycleById } from '../../../mocks/reviews'

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

  const cycle = getReviewCycleById(id)

  if (!cycle) {
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

  return {
    success: true,
    data: cycle,
    meta: {
      timestamp: new Date().toISOString()
    }
  }
})
