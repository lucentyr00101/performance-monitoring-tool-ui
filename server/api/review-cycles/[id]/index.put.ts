// PUT /api/review-cycles/:id - Update a review cycle
import { mockReviewCycles, mockReviewCycleListItems } from '../../../mocks/reviews'
import type { ReviewCycleUpdateRequest, ReviewCycle, ReviewCycleListItem } from '~/types/review'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const body = await readBody<ReviewCycleUpdateRequest>(event)

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

  // Only draft cycles can be edited
  if (cycle.status !== 'draft') {
    throw createError({
      statusCode: 409,
      data: {
        success: false,
        error: {
          code: 'CONFLICT',
          message: 'Cannot modify an active or completed review cycle'
        },
        meta: { timestamp: new Date().toISOString() }
      }
    })
  }

  // Update cycle
  const updatedCycle = {
    ...cycle,
    name: body.name ?? cycle.name,
    description: body.description ?? cycle.description,
    type: body.type ?? cycle.type,
    start_date: body.start_date ?? cycle.start_date,
    end_date: body.end_date ?? cycle.end_date,
    settings: body.settings ? { ...cycle.settings, ...body.settings } : cycle.settings,
    departments: body.departments ?? cycle.departments,
    updated_at: new Date().toISOString()
  }

  mockReviewCycles[cycleIndex] = updatedCycle

  // Update list item
  const listIndex = mockReviewCycleListItems.findIndex((c: ReviewCycleListItem) => c.id === id)
  if (listIndex !== -1) {
    mockReviewCycleListItems[listIndex] = {
      id: updatedCycle.id,
      name: updatedCycle.name,
      description: updatedCycle.description,
      type: updatedCycle.type,
      start_date: updatedCycle.start_date,
      end_date: updatedCycle.end_date,
      status: updatedCycle.status,
      created_by: updatedCycle.created_by,
      stats: updatedCycle.stats,
      created_at: updatedCycle.created_at
    }
  }

  return {
    success: true,
    data: updatedCycle,
    meta: {
      timestamp: new Date().toISOString()
    }
  }
})
