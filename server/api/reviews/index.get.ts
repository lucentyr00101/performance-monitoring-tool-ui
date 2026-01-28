// GET /api/reviews - List reviews with filtering
import { mockReviewListItems } from '../../mocks/reviews'
import type { ReviewType, ReviewStatus } from '~/types/review'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  
  // Parse query params
  const page = parseInt(query.page as string) || 1
  const perPage = parseInt(query.per_page as string) || 20
  const search = query.search as string | undefined
  const cycleId = query.cycle_id as string | undefined
  const employeeId = query.employee_id as string | undefined
  const reviewerId = query.reviewer_id as string | undefined
  const type = query.type as ReviewType | undefined
  const status = query.status as ReviewStatus | undefined
  const sortBy = query.sort_by as string || 'created_at'
  const sortOrder = query.sort_order as string || 'desc'

  // Filter reviews
  let filteredReviews = [...mockReviewListItems]

  if (search) {
    const searchLower = search.toLowerCase()
    filteredReviews = filteredReviews.filter(r => 
      r.employee.first_name.toLowerCase().includes(searchLower) ||
      r.employee.last_name.toLowerCase().includes(searchLower) ||
      r.reviewer.first_name.toLowerCase().includes(searchLower) ||
      r.reviewer.last_name.toLowerCase().includes(searchLower) ||
      r.cycle.name.toLowerCase().includes(searchLower)
    )
  }

  if (cycleId) {
    filteredReviews = filteredReviews.filter(r => r.cycle.id === cycleId)
  }

  if (employeeId) {
    filteredReviews = filteredReviews.filter(r => r.employee.id === employeeId)
  }

  if (reviewerId) {
    filteredReviews = filteredReviews.filter(r => r.reviewer.id === reviewerId)
  }

  if (type) {
    filteredReviews = filteredReviews.filter(r => r.type === type)
  }

  if (status) {
    filteredReviews = filteredReviews.filter(r => r.status === status)
  }

  // Sort
  filteredReviews.sort((a, b) => {
    let comparison = 0
    
    switch (sortBy) {
      case 'rating':
        comparison = (a.rating || 0) - (b.rating || 0)
        break
      case 'submitted_at':
        const aTime = a.submitted_at ? new Date(a.submitted_at).getTime() : 0
        const bTime = b.submitted_at ? new Date(b.submitted_at).getTime() : 0
        comparison = aTime - bTime
        break
      case 'status':
        comparison = a.status.localeCompare(b.status)
        break
      default:
        comparison = 0
    }
    
    return sortOrder === 'asc' ? comparison : -comparison
  })

  // Paginate
  const totalItems = filteredReviews.length
  const totalPages = Math.ceil(totalItems / perPage)
  const startIndex = (page - 1) * perPage
  const paginatedReviews = filteredReviews.slice(startIndex, startIndex + perPage)

  return {
    success: true,
    data: paginatedReviews,
    meta: {
      pagination: {
        page,
        per_page: perPage,
        total_items: totalItems,
        total_pages: totalPages
      },
      timestamp: new Date().toISOString()
    }
  }
})
