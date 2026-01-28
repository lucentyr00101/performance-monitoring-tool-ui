// GET /api/review-cycles - List review cycles with filtering
import { mockReviewCycleListItems } from '../../mocks/reviews'
import type { ReviewCycleStatus, ReviewCycleType } from '~/types/review'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  
  // Parse query params
  const page = parseInt(query.page as string) || 1
  const perPage = parseInt(query.per_page as string) || 20
  const search = query.search as string | undefined
  const status = query.status as ReviewCycleStatus | undefined
  const type = query.type as ReviewCycleType | undefined
  const year = query.year ? parseInt(query.year as string) : undefined

  // Filter cycles
  let filteredCycles = [...mockReviewCycleListItems]

  if (search) {
    const searchLower = search.toLowerCase()
    filteredCycles = filteredCycles.filter(c => 
      c.name.toLowerCase().includes(searchLower) ||
      c.description?.toLowerCase().includes(searchLower)
    )
  }

  if (status) {
    filteredCycles = filteredCycles.filter(c => c.status === status)
  }

  if (type) {
    filteredCycles = filteredCycles.filter(c => c.type === type)
  }

  if (year) {
    filteredCycles = filteredCycles.filter(c => {
      const cycleYear = new Date(c.start_date).getFullYear()
      return cycleYear === year
    })
  }

  // Sort by created_at descending (newest first)
  filteredCycles.sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )

  // Paginate
  const totalItems = filteredCycles.length
  const totalPages = Math.ceil(totalItems / perPage)
  const startIndex = (page - 1) * perPage
  const paginatedCycles = filteredCycles.slice(startIndex, startIndex + perPage)

  return {
    success: true,
    data: paginatedCycles,
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
