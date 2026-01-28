// POST /api/review-cycles - Create a new review cycle
import { mockReviewCycles, mockReviewCycleListItems } from '../../mocks/reviews'
import type { ReviewCycleCreateRequest, ReviewCycle, CycleSettings } from '~/types/review'

export default defineEventHandler(async (event) => {
  const body = await readBody<ReviewCycleCreateRequest>(event)

  // Validate required fields
  if (!body.name || !body.type || !body.start_date || !body.end_date) {
    throw createError({
      statusCode: 400,
      data: {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Name, type, start_date, and end_date are required'
        },
        meta: { timestamp: new Date().toISOString() }
      }
    })
  }

  // Validate dates
  const startDate = new Date(body.start_date)
  const endDate = new Date(body.end_date)
  
  if (endDate <= startDate) {
    throw createError({
      statusCode: 400,
      data: {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'End date must be after start date'
        },
        meta: { timestamp: new Date().toISOString() }
      }
    })
  }

  // Default settings
  const defaultSettings: CycleSettings = {
    include_self_assessment: true,
    include_manager_review: true,
    include_peer_review: false,
    rating_scale: {
      min: 1,
      max: 5
    }
  }

  // Create new cycle
  const newCycle: ReviewCycle = {
    id: `cycle-${Date.now()}`,
    name: body.name,
    description: body.description,
    type: body.type,
    start_date: body.start_date,
    end_date: body.end_date,
    status: 'draft',
    settings: { ...defaultSettings, ...body.settings },
    departments: body.departments,
    created_by: {
      id: 'user-hr-001',
      first_name: 'Lisa',
      last_name: 'HR',
      email: 'lisa.hr@company.com'
    },
    stats: {
      total_reviews: 0,
      completed: 0,
      pending: 0,
      completion_rate: 0
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }

  // Add to mock data (in real app, this would be persisted)
  mockReviewCycles.unshift(newCycle)
  mockReviewCycleListItems.unshift({
    id: newCycle.id,
    name: newCycle.name,
    description: newCycle.description,
    type: newCycle.type,
    start_date: newCycle.start_date,
    end_date: newCycle.end_date,
    status: newCycle.status,
    created_by: newCycle.created_by,
    stats: newCycle.stats,
    created_at: newCycle.created_at
  })

  return {
    success: true,
    data: newCycle,
    meta: {
      timestamp: new Date().toISOString()
    }
  }
})
