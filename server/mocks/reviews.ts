// Mock Reviews Data
// Sample review cycles and reviews for development/testing

import type {
  ReviewCycle,
  ReviewCycleListItem,
  Review,
  ReviewListItem,
  CycleSettings,
  CycleStats,
  ReviewEmployeeSummary
} from '~/types/review'

// Default cycle settings
const defaultSettings: CycleSettings = {
  include_self_assessment: true,
  include_manager_review: true,
  include_peer_review: false,
  rating_scale: {
    min: 1,
    max: 5,
    labels: {
      '1': 'Unsatisfactory',
      '2': 'Needs Improvement',
      '3': 'Meets Expectations',
      '4': 'Exceeds Expectations',
      '5': 'Exceptional'
    }
  }
}

// Sample employees for reviews
export const mockEmployees: ReviewEmployeeSummary[] = [
  {
    id: 'emp-001',
    first_name: 'Alice',
    last_name: 'Johnson',
    email: 'alice.johnson@company.com',
    job_title: 'Senior Developer',
    avatar_url: undefined,
    department: { id: 'dept-001', name: 'Engineering' },
    hire_date: '2023-01-10'
  },
  {
    id: 'emp-002',
    first_name: 'Bob',
    last_name: 'Smith',
    email: 'bob.smith@company.com',
    job_title: 'Product Manager',
    avatar_url: undefined,
    department: { id: 'dept-002', name: 'Product' },
    hire_date: '2022-06-15'
  },
  {
    id: 'emp-003',
    first_name: 'Carol',
    last_name: 'Williams',
    email: 'carol.williams@company.com',
    job_title: 'UX Designer',
    avatar_url: undefined,
    department: { id: 'dept-003', name: 'Design' },
    hire_date: '2023-03-20'
  },
  {
    id: 'emp-004',
    first_name: 'David',
    last_name: 'Brown',
    email: 'david.brown@company.com',
    job_title: 'Engineering Manager',
    avatar_url: undefined,
    department: { id: 'dept-001', name: 'Engineering' },
    hire_date: '2021-08-01'
  },
  {
    id: 'emp-005',
    first_name: 'Eva',
    last_name: 'Martinez',
    email: 'eva.martinez@company.com',
    job_title: 'Frontend Developer',
    avatar_url: undefined,
    department: { id: 'dept-001', name: 'Engineering' },
    hire_date: '2024-01-15'
  },
  {
    id: 'emp-006',
    first_name: 'Frank',
    last_name: 'Chen',
    email: 'frank.chen@company.com',
    job_title: 'Backend Developer',
    avatar_url: undefined,
    department: { id: 'dept-001', name: 'Engineering' },
    hire_date: '2023-09-10'
  }
]

// HR user who creates cycles
const hrCreator = {
  id: 'user-hr-001',
  first_name: 'Lisa',
  last_name: 'HR',
  email: 'lisa.hr@company.com'
}

// Mock Review Cycles
export const mockReviewCycles: ReviewCycle[] = [
  {
    id: 'cycle-001',
    name: 'Q4 2025 Performance Review',
    description: 'Quarterly performance evaluation for Q4 2025. All employees should complete self-assessments and managers should provide feedback.',
    type: 'quarterly',
    start_date: '2025-12-01',
    end_date: '2025-12-31',
    status: 'completed',
    settings: defaultSettings,
    created_by: hrCreator,
    stats: {
      total_reviews: 24,
      completed: 22,
      pending: 0,
      in_progress: 2,
      completion_rate: 91.67,
      average_rating: 3.8,
      by_type: {
        self: { total: 12, completed: 12 },
        manager: { total: 12, completed: 10 }
      }
    },
    created_at: '2025-11-15T09:00:00Z',
    updated_at: '2026-01-05T14:30:00Z'
  },
  {
    id: 'cycle-002',
    name: 'Q1 2026 Performance Review',
    description: 'Quarterly performance evaluation for Q1 2026.',
    type: 'quarterly',
    start_date: '2026-01-15',
    end_date: '2026-02-15',
    status: 'active',
    settings: defaultSettings,
    created_by: hrCreator,
    stats: {
      total_reviews: 24,
      completed: 8,
      pending: 10,
      in_progress: 6,
      completion_rate: 33.33,
      average_rating: 3.5,
      by_type: {
        self: { total: 12, completed: 6 },
        manager: { total: 12, completed: 2 }
      }
    },
    created_at: '2026-01-10T10:00:00Z',
    updated_at: '2026-01-28T08:00:00Z'
  },
  {
    id: 'cycle-003',
    name: 'Q2 2026 Performance Review',
    description: 'Upcoming quarterly performance evaluation for Q2 2026.',
    type: 'quarterly',
    start_date: '2026-04-01',
    end_date: '2026-04-30',
    status: 'draft',
    settings: defaultSettings,
    created_by: hrCreator,
    stats: {
      total_reviews: 0,
      completed: 0,
      pending: 0,
      completion_rate: 0
    },
    created_at: '2026-01-20T11:00:00Z',
    updated_at: '2026-01-20T11:00:00Z'
  },
  {
    id: 'cycle-004',
    name: '2025 Annual Review',
    description: 'Comprehensive annual performance review for all employees.',
    type: 'annual',
    start_date: '2025-11-01',
    end_date: '2025-12-15',
    status: 'completed',
    settings: defaultSettings,
    created_by: hrCreator,
    stats: {
      total_reviews: 48,
      completed: 48,
      pending: 0,
      completion_rate: 100,
      average_rating: 3.7,
      by_type: {
        self: { total: 24, completed: 24 },
        manager: { total: 24, completed: 24 }
      }
    },
    created_at: '2025-10-15T09:00:00Z',
    updated_at: '2025-12-20T16:00:00Z'
  }
]

// Convert to list items (lighter version)
export const mockReviewCycleListItems: ReviewCycleListItem[] = mockReviewCycles.map(cycle => ({
  id: cycle.id,
  name: cycle.name,
  description: cycle.description,
  type: cycle.type,
  start_date: cycle.start_date,
  end_date: cycle.end_date,
  status: cycle.status,
  created_by: cycle.created_by,
  stats: cycle.stats,
  created_at: cycle.created_at
}))

// Mock Reviews
export const mockReviews: Review[] = [
  // Q1 2026 - Self Assessments
  {
    id: 'review-001',
    cycle_id: 'cycle-002',
    cycle: { id: 'cycle-002', name: 'Q1 2026 Performance Review', type: 'quarterly' },
    employee_id: 'emp-001',
    employee: mockEmployees[0]!,
    reviewer_id: 'emp-001',
    reviewer: mockEmployees[0]!,
    type: 'self',
    status: 'submitted',
    rating: 4.0,
    ratings_breakdown: {
      technical_skills: 4,
      communication: 4,
      teamwork: 4,
      problem_solving: 5,
      initiative: 3
    },
    strengths: 'Strong technical skills and problem-solving abilities. Consistently delivers high-quality code.',
    improvements: 'Could improve on documentation and taking more initiative in cross-team projects.',
    comments: 'Overall a productive quarter with several key achievements including the migration project.',
    submitted_at: '2026-01-20T14:00:00Z',
    created_at: '2026-01-15T00:00:00Z',
    updated_at: '2026-01-20T14:00:00Z'
  },
  {
    id: 'review-002',
    cycle_id: 'cycle-002',
    cycle: { id: 'cycle-002', name: 'Q1 2026 Performance Review', type: 'quarterly' },
    employee_id: 'emp-002',
    employee: mockEmployees[1]!,
    reviewer_id: 'emp-002',
    reviewer: mockEmployees[1]!,
    type: 'self',
    status: 'in_progress',
    ratings_breakdown: {
      technical_skills: 3,
      communication: 5
    },
    strengths: 'Excellent communication and stakeholder management.',
    created_at: '2026-01-15T00:00:00Z',
    updated_at: '2026-01-25T10:00:00Z'
  },
  {
    id: 'review-003',
    cycle_id: 'cycle-002',
    cycle: { id: 'cycle-002', name: 'Q1 2026 Performance Review', type: 'quarterly' },
    employee_id: 'emp-003',
    employee: mockEmployees[2]!,
    reviewer_id: 'emp-003',
    reviewer: mockEmployees[2]!,
    type: 'self',
    status: 'pending',
    created_at: '2026-01-15T00:00:00Z',
    updated_at: '2026-01-15T00:00:00Z'
  },
  {
    id: 'review-004',
    cycle_id: 'cycle-002',
    cycle: { id: 'cycle-002', name: 'Q1 2026 Performance Review', type: 'quarterly' },
    employee_id: 'emp-005',
    employee: mockEmployees[4]!,
    reviewer_id: 'emp-005',
    reviewer: mockEmployees[4]!,
    type: 'self',
    status: 'submitted',
    rating: 3.5,
    ratings_breakdown: {
      technical_skills: 3,
      communication: 4,
      teamwork: 4,
      problem_solving: 3,
      initiative: 4
    },
    strengths: 'Quick learner and enthusiastic about new technologies. Great team collaboration.',
    improvements: 'Need to deepen technical knowledge in backend systems.',
    comments: 'First quarter at the company has been a great learning experience.',
    submitted_at: '2026-01-22T09:00:00Z',
    created_at: '2026-01-15T00:00:00Z',
    updated_at: '2026-01-22T09:00:00Z'
  },
  {
    id: 'review-005',
    cycle_id: 'cycle-002',
    cycle: { id: 'cycle-002', name: 'Q1 2026 Performance Review', type: 'quarterly' },
    employee_id: 'emp-006',
    employee: mockEmployees[5]!,
    reviewer_id: 'emp-006',
    reviewer: mockEmployees[5]!,
    type: 'self',
    status: 'submitted',
    rating: 4.2,
    ratings_breakdown: {
      technical_skills: 5,
      communication: 3,
      teamwork: 4,
      problem_solving: 5,
      initiative: 4
    },
    strengths: 'Exceptional backend development skills. Improved API performance by 40%.',
    improvements: 'Working on improving communication in team meetings.',
    comments: 'Focused on infrastructure improvements this quarter.',
    submitted_at: '2026-01-21T16:00:00Z',
    created_at: '2026-01-15T00:00:00Z',
    updated_at: '2026-01-21T16:00:00Z'
  },

  // Q1 2026 - Manager Reviews
  {
    id: 'review-006',
    cycle_id: 'cycle-002',
    cycle: { id: 'cycle-002', name: 'Q1 2026 Performance Review', type: 'quarterly' },
    employee_id: 'emp-001',
    employee: mockEmployees[0]!,
    reviewer_id: 'emp-004',
    reviewer: mockEmployees[3]!,
    type: 'manager',
    status: 'in_progress',
    ratings_breakdown: {
      technical_skills: 5,
      communication: 4
    },
    strengths: 'Alice continues to be a top performer on the team.',
    created_at: '2026-01-15T00:00:00Z',
    updated_at: '2026-01-27T11:00:00Z'
  },
  {
    id: 'review-007',
    cycle_id: 'cycle-002',
    cycle: { id: 'cycle-002', name: 'Q1 2026 Performance Review', type: 'quarterly' },
    employee_id: 'emp-005',
    employee: mockEmployees[4]!,
    reviewer_id: 'emp-004',
    reviewer: mockEmployees[3]!,
    type: 'manager',
    status: 'pending',
    created_at: '2026-01-15T00:00:00Z',
    updated_at: '2026-01-15T00:00:00Z'
  },
  {
    id: 'review-008',
    cycle_id: 'cycle-002',
    cycle: { id: 'cycle-002', name: 'Q1 2026 Performance Review', type: 'quarterly' },
    employee_id: 'emp-006',
    employee: mockEmployees[5]!,
    reviewer_id: 'emp-004',
    reviewer: mockEmployees[3]!,
    type: 'manager',
    status: 'pending',
    created_at: '2026-01-15T00:00:00Z',
    updated_at: '2026-01-15T00:00:00Z'
  },

  // Q4 2025 - Completed Reviews
  {
    id: 'review-009',
    cycle_id: 'cycle-001',
    cycle: { id: 'cycle-001', name: 'Q4 2025 Performance Review', type: 'quarterly' },
    employee_id: 'emp-001',
    employee: mockEmployees[0]!,
    reviewer_id: 'emp-001',
    reviewer: mockEmployees[0]!,
    type: 'self',
    status: 'acknowledged',
    rating: 4.0,
    ratings_breakdown: {
      technical_skills: 4,
      communication: 4,
      teamwork: 4,
      problem_solving: 4,
      initiative: 4
    },
    strengths: 'Consistent performance across all areas.',
    improvements: 'Taking on more leadership responsibilities.',
    comments: 'Solid quarter with good project deliveries.',
    employee_comments: 'Thank you for the feedback. I will work on the suggested areas.',
    submitted_at: '2025-12-15T10:00:00Z',
    acknowledged_at: '2025-12-20T14:00:00Z',
    created_at: '2025-12-01T00:00:00Z',
    updated_at: '2025-12-20T14:00:00Z'
  },
  {
    id: 'review-010',
    cycle_id: 'cycle-001',
    cycle: { id: 'cycle-001', name: 'Q4 2025 Performance Review', type: 'quarterly' },
    employee_id: 'emp-001',
    employee: mockEmployees[0]!,
    reviewer_id: 'emp-004',
    reviewer: mockEmployees[3]!,
    type: 'manager',
    status: 'acknowledged',
    rating: 4.5,
    ratings_breakdown: {
      technical_skills: 5,
      communication: 4,
      teamwork: 4,
      problem_solving: 5,
      initiative: 4
    },
    strengths: 'Alice demonstrates exceptional technical skills and problem-solving abilities. She consistently delivers high-quality code and has been instrumental in improving our testing coverage.',
    improvements: 'Could improve on documentation and knowledge sharing with the team. Would benefit from taking more initiative in cross-team collaboration.',
    comments: 'Overall, Alice has had an excellent quarter. She exceeded expectations on her technical deliverables and has shown strong growth potential.',
    employee_comments: 'Thank you for the detailed feedback. I agree with the areas for improvement and will work on better documentation.',
    submitted_at: '2025-12-20T15:00:00Z',
    acknowledged_at: '2025-12-22T09:00:00Z',
    created_at: '2025-12-01T00:00:00Z',
    updated_at: '2025-12-22T09:00:00Z'
  }
]

// Convert to list items
export const mockReviewListItems: ReviewListItem[] = mockReviews.map(review => ({
  id: review.id,
  cycle: review.cycle,
  employee: review.employee,
  reviewer: review.reviewer,
  type: review.type,
  status: review.status,
  rating: review.rating,
  submitted_at: review.submitted_at
}))

// Helper functions
export function getReviewCycleById(id: string): ReviewCycle | undefined {
  return mockReviewCycles.find(c => c.id === id)
}

export function getReviewById(id: string): Review | undefined {
  return mockReviews.find(r => r.id === id)
}

export function getReviewsByCycleId(cycleId: string): Review[] {
  return mockReviews.filter(r => r.cycle_id === cycleId)
}

export function getReviewsByEmployeeId(employeeId: string): Review[] {
  return mockReviews.filter(r => r.employee_id === employeeId)
}

export function getReviewsByReviewerId(reviewerId: string): Review[] {
  return mockReviews.filter(r => r.reviewer_id === reviewerId)
}
