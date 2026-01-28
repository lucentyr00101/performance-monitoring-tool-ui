/**
 * Mock goal data for development/testing
 * Remove this file when real API is ready
 */

import type {
  Goal,
  GoalListItem,
  GoalTemplate,
  GoalType,
  GoalStatus,
  GoalPriority,
  GoalVisibility,
  KeyResult,
  KeyResultStatus,
  KeyResultSummary,
  ProgressHistory,
  GoalOwner,
  ParentGoalSummary,
  ChildGoalSummary,
  GoalAlignmentNode,
  ProgressIndicator
} from '../../app/types/goal'

// Mock key results storage (separate for easier manipulation)
export interface MockKeyResult {
  id: string
  goal_id: string
  title: string
  description?: string
  target_value: number
  current_value: number
  unit?: string
  status: KeyResultStatus
  created_at: string
  updated_at: string
}

// Mock goal storage
export interface MockGoal {
  id: string
  title: string
  description?: string
  type: GoalType
  status: GoalStatus
  priority: GoalPriority
  visibility: GoalVisibility
  owner_id: string
  parent_goal_id?: string
  tags: string[]
  start_date?: string
  due_date: string
  completed_at?: string
  created_at: string
  updated_at: string
}

// Mock progress history storage
export interface MockProgressHistory {
  id: string
  goal_id: string
  key_result_id?: string
  old_value: number
  new_value: number
  comment?: string
  updated_by_id: string
  created_at: string
}

// Owner lookup table (maps to employees)
const mockOwners: Record<string, GoalOwner> = {
  'emp_001': {
    id: 'emp_001',
    first_name: 'Robert',
    last_name: 'Williams',
    name: 'Robert Williams',
    email: 'ceo@company.com',
    job_title: 'Chief Executive Officer',
    avatar_url: undefined
  },
  'emp_003': {
    id: 'emp_003',
    first_name: 'System',
    last_name: 'Administrator',
    name: 'System Administrator',
    email: 'admin@company.com',
    job_title: 'IT Administrator',
    avatar_url: undefined
  },
  'emp_004': {
    id: 'emp_004',
    first_name: 'Sarah',
    last_name: 'Johnson',
    name: 'Sarah Johnson',
    email: 'hr@company.com',
    job_title: 'HR Manager',
    avatar_url: undefined
  },
  'emp_006': {
    id: 'emp_006',
    first_name: 'Michael',
    last_name: 'Chen',
    name: 'Michael Chen',
    email: 'manager@company.com',
    job_title: 'Engineering Manager',
    avatar_url: undefined
  },
  'emp_007': {
    id: 'emp_007',
    first_name: 'Emily',
    last_name: 'Davis',
    name: 'Emily Davis',
    email: 'employee@company.com',
    job_title: 'Software Developer',
    avatar_url: undefined
  },
  'emp_008': {
    id: 'emp_008',
    first_name: 'David',
    last_name: 'Brown',
    name: 'David Brown',
    email: 'david.brown@company.com',
    job_title: 'Senior Software Developer',
    avatar_url: undefined
  },
  'emp_009': {
    id: 'emp_009',
    first_name: 'Amanda',
    last_name: 'Wilson',
    name: 'Amanda Wilson',
    email: 'amanda.wilson@company.com',
    job_title: 'Junior Developer',
    avatar_url: undefined
  },
  'emp_010': {
    id: 'emp_010',
    first_name: 'James',
    last_name: 'Taylor',
    name: 'James Taylor',
    email: 'james.taylor@company.com',
    job_title: 'DevOps Engineer',
    avatar_url: undefined
  },
  'emp_011': {
    id: 'emp_011',
    first_name: 'Rachel',
    last_name: 'Green',
    name: 'Rachel Green',
    email: 'rachel.green@company.com',
    job_title: 'Product Manager',
    avatar_url: undefined
  },
  'emp_013': {
    id: 'emp_013',
    first_name: 'Christopher',
    last_name: 'Anderson',
    name: 'Christopher Anderson',
    email: 'chris.anderson@company.com',
    job_title: 'Sales Director',
    avatar_url: undefined
  },
  'emp_015': {
    id: 'emp_015',
    first_name: 'Jessica',
    last_name: 'Clark',
    name: 'Jessica Clark',
    email: 'jessica.clark@company.com',
    job_title: 'Marketing Manager',
    avatar_url: undefined
  }
}

// ============================================
// MOCK GOALS DATA
// ============================================

export const mockGoals: MockGoal[] = [
  // ===== COMPANY GOALS =====
  {
    id: 'goal_001',
    title: 'Increase Annual Revenue by 25%',
    description: 'Grow company revenue through new customer acquisition and existing customer expansion. Focus on enterprise segment and international markets.',
    type: 'company',
    status: 'active',
    priority: 'high',
    visibility: 'company',
    owner_id: 'emp_001',
    tags: ['revenue', 'growth', '2026'],
    start_date: '2026-01-01',
    due_date: '2026-12-31',
    created_at: '2025-12-15T09:00:00Z',
    updated_at: '2026-01-20T14:30:00Z'
  },
  {
    id: 'goal_002',
    title: 'Achieve 90% Customer Satisfaction Score',
    description: 'Improve customer satisfaction through better product quality, faster support response times, and proactive customer success initiatives.',
    type: 'company',
    status: 'active',
    priority: 'high',
    visibility: 'company',
    owner_id: 'emp_001',
    tags: ['customer-success', 'satisfaction', '2026'],
    start_date: '2026-01-01',
    due_date: '2026-12-31',
    created_at: '2025-12-15T09:00:00Z',
    updated_at: '2026-01-15T10:00:00Z'
  },

  // ===== DEPARTMENT GOALS =====
  {
    id: 'goal_003',
    title: 'Improve Engineering Velocity by 30%',
    description: 'Increase team velocity through better tooling, reduced technical debt, and improved development processes.',
    type: 'department',
    status: 'active',
    priority: 'high',
    visibility: 'department',
    owner_id: 'emp_006',
    parent_goal_id: 'goal_001',
    tags: ['engineering', 'velocity', 'productivity'],
    start_date: '2026-01-01',
    due_date: '2026-06-30',
    created_at: '2025-12-20T09:00:00Z',
    updated_at: '2026-01-25T11:00:00Z'
  },
  {
    id: 'goal_004',
    title: 'Launch New Product Analytics Dashboard',
    description: 'Design and ship comprehensive analytics dashboard for enterprise customers with real-time metrics and customizable reports.',
    type: 'department',
    status: 'active',
    priority: 'high',
    visibility: 'department',
    owner_id: 'emp_011',
    parent_goal_id: 'goal_001',
    tags: ['product', 'analytics', 'launch'],
    start_date: '2026-01-15',
    due_date: '2026-04-30',
    created_at: '2026-01-10T09:00:00Z',
    updated_at: '2026-01-22T15:00:00Z'
  },
  {
    id: 'goal_005',
    title: 'Reduce Customer Churn Rate to Under 5%',
    description: 'Implement proactive retention strategies, improve onboarding, and address common pain points to reduce monthly churn.',
    type: 'department',
    status: 'active',
    priority: 'high',
    visibility: 'department',
    owner_id: 'emp_013',
    parent_goal_id: 'goal_002',
    tags: ['sales', 'retention', 'churn'],
    start_date: '2026-01-01',
    due_date: '2026-06-30',
    created_at: '2025-12-20T09:00:00Z',
    updated_at: '2026-01-18T14:00:00Z'
  },
  {
    id: 'goal_006',
    title: 'Improve Employee Engagement Score to 85%',
    description: 'Enhance workplace culture, implement feedback loops, and create development opportunities to boost employee satisfaction.',
    type: 'department',
    status: 'active',
    priority: 'medium',
    visibility: 'department',
    owner_id: 'emp_004',
    tags: ['hr', 'engagement', 'culture'],
    start_date: '2026-01-01',
    due_date: '2026-12-31',
    created_at: '2025-12-18T09:00:00Z',
    updated_at: '2026-01-10T10:00:00Z'
  },

  // ===== TEAM GOALS =====
  {
    id: 'goal_007',
    title: 'Migrate Legacy Services to Kubernetes',
    description: 'Complete migration of all legacy monolith services to containerized microservices on Kubernetes infrastructure.',
    type: 'team',
    status: 'active',
    priority: 'high',
    visibility: 'team',
    owner_id: 'emp_006',
    parent_goal_id: 'goal_003',
    tags: ['engineering', 'kubernetes', 'infrastructure'],
    start_date: '2026-01-01',
    due_date: '2026-03-31',
    created_at: '2026-01-02T09:00:00Z',
    updated_at: '2026-01-26T16:00:00Z'
  },
  {
    id: 'goal_008',
    title: 'Implement Automated Testing Pipeline',
    description: 'Set up comprehensive CI/CD pipeline with automated unit, integration, and e2e tests for all services.',
    type: 'team',
    status: 'active',
    priority: 'high',
    visibility: 'team',
    owner_id: 'emp_006',
    parent_goal_id: 'goal_003',
    tags: ['engineering', 'testing', 'automation'],
    start_date: '2026-01-15',
    due_date: '2026-04-15',
    created_at: '2026-01-10T09:00:00Z',
    updated_at: '2026-01-24T11:00:00Z'
  },
  {
    id: 'goal_009',
    title: 'Q1 Sales Target - $500K New ARR',
    description: 'Achieve $500,000 in new annual recurring revenue from new customer acquisitions in Q1 2026.',
    type: 'team',
    status: 'active',
    priority: 'high',
    visibility: 'team',
    owner_id: 'emp_013',
    parent_goal_id: 'goal_005',
    tags: ['sales', 'revenue', 'q1'],
    start_date: '2026-01-01',
    due_date: '2026-03-31',
    created_at: '2025-12-28T09:00:00Z',
    updated_at: '2026-01-27T09:00:00Z'
  },
  {
    id: 'goal_010',
    title: 'Launch Q1 Marketing Campaign',
    description: 'Execute integrated marketing campaign across digital channels to generate 1000+ qualified leads.',
    type: 'team',
    status: 'active',
    priority: 'medium',
    visibility: 'team',
    owner_id: 'emp_015',
    parent_goal_id: 'goal_001',
    tags: ['marketing', 'campaign', 'leads'],
    start_date: '2026-01-01',
    due_date: '2026-03-31',
    created_at: '2025-12-22T09:00:00Z',
    updated_at: '2026-01-20T14:00:00Z'
  },

  // ===== INDIVIDUAL GOALS =====
  {
    id: 'goal_011',
    title: 'Complete AWS Solutions Architect Certification',
    description: 'Obtain AWS Solutions Architect Professional certification to enhance cloud architecture skills and support infrastructure migration.',
    type: 'individual',
    status: 'active',
    priority: 'medium',
    visibility: 'team',
    owner_id: 'emp_007',
    parent_goal_id: 'goal_007',
    tags: ['certification', 'aws', 'professional-development'],
    start_date: '2026-01-01',
    due_date: '2026-02-28',
    created_at: '2026-01-02T09:00:00Z',
    updated_at: '2026-01-25T10:00:00Z'
  },
  {
    id: 'goal_012',
    title: 'Reduce API Response Time by 40%',
    description: 'Optimize database queries, implement caching, and refactor bottleneck endpoints to improve API performance.',
    type: 'individual',
    status: 'active',
    priority: 'high',
    visibility: 'team',
    owner_id: 'emp_008',
    parent_goal_id: 'goal_003',
    tags: ['engineering', 'performance', 'optimization'],
    start_date: '2026-01-10',
    due_date: '2026-03-15',
    created_at: '2026-01-08T09:00:00Z',
    updated_at: '2026-01-26T14:00:00Z'
  },
  {
    id: 'goal_013',
    title: 'Complete Frontend Testing Training',
    description: 'Complete advanced training in Vitest, Playwright, and testing best practices. Apply learnings to improve test coverage.',
    type: 'individual',
    status: 'active',
    priority: 'medium',
    visibility: 'team',
    owner_id: 'emp_009',
    parent_goal_id: 'goal_008',
    tags: ['training', 'testing', 'professional-development'],
    start_date: '2026-01-15',
    due_date: '2026-03-31',
    created_at: '2026-01-12T09:00:00Z',
    updated_at: '2026-01-20T11:00:00Z'
  },
  {
    id: 'goal_014',
    title: 'Implement Zero-Downtime Deployment Pipeline',
    description: 'Design and implement blue-green deployment strategy for all production services with automatic rollback capabilities.',
    type: 'individual',
    status: 'active',
    priority: 'high',
    visibility: 'team',
    owner_id: 'emp_010',
    parent_goal_id: 'goal_007',
    tags: ['devops', 'deployment', 'infrastructure'],
    start_date: '2026-01-05',
    due_date: '2026-02-28',
    created_at: '2026-01-03T09:00:00Z',
    updated_at: '2026-01-27T15:00:00Z'
  },
  {
    id: 'goal_015',
    title: 'Design User Research Framework',
    description: 'Establish systematic approach to user research including interview templates, usability testing protocols, and feedback analysis.',
    type: 'individual',
    status: 'active',
    priority: 'medium',
    visibility: 'team',
    owner_id: 'emp_011',
    parent_goal_id: 'goal_004',
    tags: ['product', 'research', 'ux'],
    start_date: '2026-01-10',
    due_date: '2026-02-28',
    created_at: '2026-01-08T09:00:00Z',
    updated_at: '2026-01-22T10:00:00Z'
  },

  // ===== VARIOUS STATUS GOALS =====
  {
    id: 'goal_016',
    title: 'Implement New Onboarding Flow',
    description: 'Design and build streamlined employee onboarding workflow with automated checklists and progress tracking.',
    type: 'individual',
    status: 'completed',
    priority: 'high',
    visibility: 'department',
    owner_id: 'emp_004',
    parent_goal_id: 'goal_006',
    tags: ['hr', 'onboarding', 'process'],
    start_date: '2025-11-01',
    due_date: '2026-01-15',
    completed_at: '2026-01-12T16:00:00Z',
    created_at: '2025-10-28T09:00:00Z',
    updated_at: '2026-01-12T16:00:00Z'
  },
  {
    id: 'goal_017',
    title: 'Build Internal Developer Portal',
    description: 'Create self-service portal for developers with documentation, API references, and environment management tools.',
    type: 'individual',
    status: 'pending',
    priority: 'medium',
    visibility: 'team',
    owner_id: 'emp_008',
    tags: ['engineering', 'documentation', 'portal'],
    start_date: '2026-02-01',
    due_date: '2026-04-30',
    created_at: '2026-01-25T09:00:00Z',
    updated_at: '2026-01-25T09:00:00Z'
  },
  {
    id: 'goal_018',
    title: 'Migrate Email System to Cloud',
    description: 'Migrate legacy on-premise email system to Microsoft 365 with minimal disruption.',
    type: 'individual',
    status: 'cancelled',
    priority: 'low',
    visibility: 'department',
    owner_id: 'emp_003',
    tags: ['it', 'migration', 'email'],
    start_date: '2025-10-01',
    due_date: '2026-01-31',
    created_at: '2025-09-15T09:00:00Z',
    updated_at: '2025-12-15T11:00:00Z'
  },
  {
    id: 'goal_019',
    title: 'Q1 Content Calendar Execution',
    description: 'Execute planned content calendar with 20 blog posts, 4 whitepapers, and 12 webinars.',
    type: 'individual',
    status: 'draft',
    priority: 'medium',
    visibility: 'team',
    owner_id: 'emp_015',
    parent_goal_id: 'goal_010',
    tags: ['marketing', 'content', 'q1'],
    start_date: '2026-01-01',
    due_date: '2026-03-31',
    created_at: '2026-01-26T09:00:00Z',
    updated_at: '2026-01-26T09:00:00Z'
  },

  // More individual goals for diversity
  {
    id: 'goal_020',
    title: 'Improve Code Review Process',
    description: 'Establish code review guidelines, implement automated linting, and reduce average review time to under 4 hours.',
    type: 'individual',
    status: 'active',
    priority: 'medium',
    visibility: 'team',
    owner_id: 'emp_006',
    parent_goal_id: 'goal_003',
    tags: ['engineering', 'process', 'quality'],
    start_date: '2026-01-15',
    due_date: '2026-03-15',
    created_at: '2026-01-12T09:00:00Z',
    updated_at: '2026-01-24T10:00:00Z'
  },
  {
    id: 'goal_021',
    title: 'Complete Leadership Training Program',
    description: 'Complete company leadership development program including workshops, mentoring sessions, and capstone project.',
    type: 'individual',
    status: 'active',
    priority: 'medium',
    visibility: 'private',
    owner_id: 'emp_008',
    parent_goal_id: 'goal_006',
    tags: ['professional-development', 'leadership', 'training'],
    start_date: '2026-01-01',
    due_date: '2026-06-30',
    created_at: '2025-12-20T09:00:00Z',
    updated_at: '2026-01-18T11:00:00Z'
  },
  {
    id: 'goal_022',
    title: 'Implement Security Audit Recommendations',
    description: 'Address all high and medium priority findings from Q4 security audit within 90 days.',
    type: 'team',
    status: 'active',
    priority: 'high',
    visibility: 'department',
    owner_id: 'emp_003',
    tags: ['security', 'compliance', 'audit'],
    start_date: '2026-01-10',
    due_date: '2026-04-10',
    created_at: '2026-01-08T09:00:00Z',
    updated_at: '2026-01-26T14:00:00Z'
  },
  {
    id: 'goal_023',
    title: 'Achieve 50 Enterprise Customer Meetings',
    description: 'Schedule and conduct discovery meetings with 50 enterprise prospects in Q1.',
    type: 'individual',
    status: 'active',
    priority: 'high',
    visibility: 'team',
    owner_id: 'emp_013',
    parent_goal_id: 'goal_009',
    tags: ['sales', 'enterprise', 'prospecting'],
    start_date: '2026-01-01',
    due_date: '2026-03-31',
    created_at: '2025-12-28T09:00:00Z',
    updated_at: '2026-01-27T10:00:00Z'
  },
  {
    id: 'goal_024',
    title: 'Redesign Employee Benefits Portal',
    description: 'Create modern, user-friendly benefits enrollment portal with mobile support and SSO integration.',
    type: 'individual',
    status: 'pending',
    priority: 'medium',
    visibility: 'department',
    owner_id: 'emp_004',
    parent_goal_id: 'goal_006',
    tags: ['hr', 'benefits', 'portal'],
    start_date: '2026-02-01',
    due_date: '2026-05-31',
    created_at: '2026-01-24T09:00:00Z',
    updated_at: '2026-01-24T09:00:00Z'
  },
  {
    id: 'goal_025',
    title: 'Build Real-time Notification System',
    description: 'Implement WebSocket-based notification system for real-time updates across all platform features.',
    type: 'individual',
    status: 'active',
    priority: 'high',
    visibility: 'team',
    owner_id: 'emp_007',
    parent_goal_id: 'goal_004',
    tags: ['engineering', 'real-time', 'notifications'],
    start_date: '2026-01-20',
    due_date: '2026-03-20',
    created_at: '2026-01-18T09:00:00Z',
    updated_at: '2026-01-26T15:00:00Z'
  }
]

// ============================================
// MOCK KEY RESULTS DATA
// ============================================

export const mockKeyResults: MockKeyResult[] = [
  // Goal 001 - Increase Annual Revenue by 25%
  { id: 'kr_001', goal_id: 'goal_001', title: 'Achieve $15M in total revenue', target_value: 15000000, current_value: 3200000, unit: 'USD', status: 'in_progress', created_at: '2025-12-15T09:00:00Z', updated_at: '2026-01-27T09:00:00Z' },
  { id: 'kr_002', goal_id: 'goal_001', title: 'Acquire 100 new enterprise customers', target_value: 100, current_value: 18, unit: 'customers', status: 'in_progress', created_at: '2025-12-15T09:00:00Z', updated_at: '2026-01-27T09:00:00Z' },
  { id: 'kr_003', goal_id: 'goal_001', title: 'Expand to 3 new international markets', target_value: 3, current_value: 0, unit: 'markets', status: 'in_progress', created_at: '2025-12-15T09:00:00Z', updated_at: '2026-01-15T09:00:00Z' },

  // Goal 002 - Achieve 90% Customer Satisfaction
  { id: 'kr_004', goal_id: 'goal_002', title: 'NPS score of 70+', target_value: 70, current_value: 58, unit: 'points', status: 'in_progress', created_at: '2025-12-15T09:00:00Z', updated_at: '2026-01-20T09:00:00Z' },
  { id: 'kr_005', goal_id: 'goal_002', title: 'Support response time under 2 hours', target_value: 2, current_value: 2.8, unit: 'hours', status: 'in_progress', created_at: '2025-12-15T09:00:00Z', updated_at: '2026-01-25T09:00:00Z' },
  { id: 'kr_006', goal_id: 'goal_002', title: 'Customer satisfaction survey score 90%+', target_value: 90, current_value: 82, unit: '%', status: 'in_progress', created_at: '2025-12-15T09:00:00Z', updated_at: '2026-01-22T09:00:00Z' },

  // Goal 003 - Improve Engineering Velocity
  { id: 'kr_007', goal_id: 'goal_003', title: 'Increase sprint velocity from 40 to 52 points', target_value: 52, current_value: 46, unit: 'points', status: 'in_progress', created_at: '2025-12-20T09:00:00Z', updated_at: '2026-01-27T09:00:00Z' },
  { id: 'kr_008', goal_id: 'goal_003', title: 'Reduce bug escape rate to under 5%', target_value: 5, current_value: 7, unit: '%', status: 'in_progress', created_at: '2025-12-20T09:00:00Z', updated_at: '2026-01-25T09:00:00Z' },
  { id: 'kr_009', goal_id: 'goal_003', title: 'Achieve 90% sprint completion rate', target_value: 90, current_value: 85, unit: '%', status: 'in_progress', created_at: '2025-12-20T09:00:00Z', updated_at: '2026-01-26T09:00:00Z' },

  // Goal 004 - Launch Analytics Dashboard
  { id: 'kr_010', goal_id: 'goal_004', title: 'Complete MVP features (15 total)', target_value: 15, current_value: 8, unit: 'features', status: 'in_progress', created_at: '2026-01-10T09:00:00Z', updated_at: '2026-01-27T09:00:00Z' },
  { id: 'kr_011', goal_id: 'goal_004', title: 'Achieve beta user satisfaction 80%+', target_value: 80, current_value: 0, unit: '%', status: 'in_progress', created_at: '2026-01-10T09:00:00Z', updated_at: '2026-01-10T09:00:00Z' },
  { id: 'kr_012', goal_id: 'goal_004', title: 'Complete user documentation', target_value: 100, current_value: 30, unit: '%', status: 'in_progress', created_at: '2026-01-10T09:00:00Z', updated_at: '2026-01-25T09:00:00Z' },

  // Goal 005 - Reduce Churn Rate
  { id: 'kr_013', goal_id: 'goal_005', title: 'Monthly churn rate under 5%', target_value: 5, current_value: 6.2, unit: '%', status: 'in_progress', created_at: '2025-12-20T09:00:00Z', updated_at: '2026-01-27T09:00:00Z' },
  { id: 'kr_014', goal_id: 'goal_005', title: 'Customer health score average 80+', target_value: 80, current_value: 74, unit: 'points', status: 'in_progress', created_at: '2025-12-20T09:00:00Z', updated_at: '2026-01-25T09:00:00Z' },

  // Goal 006 - Employee Engagement
  { id: 'kr_015', goal_id: 'goal_006', title: 'Employee engagement survey score 85%+', target_value: 85, current_value: 78, unit: '%', status: 'in_progress', created_at: '2025-12-18T09:00:00Z', updated_at: '2026-01-20T09:00:00Z' },
  { id: 'kr_016', goal_id: 'goal_006', title: 'Reduce voluntary turnover to under 10%', target_value: 10, current_value: 12, unit: '%', status: 'in_progress', created_at: '2025-12-18T09:00:00Z', updated_at: '2026-01-15T09:00:00Z' },
  { id: 'kr_017', goal_id: 'goal_006', title: 'Complete 50 career development plans', target_value: 50, current_value: 15, unit: 'plans', status: 'in_progress', created_at: '2025-12-18T09:00:00Z', updated_at: '2026-01-22T09:00:00Z' },

  // Goal 007 - Kubernetes Migration
  { id: 'kr_018', goal_id: 'goal_007', title: 'Migrate 8 services to Kubernetes', target_value: 8, current_value: 5, unit: 'services', status: 'in_progress', created_at: '2026-01-02T09:00:00Z', updated_at: '2026-01-27T09:00:00Z' },
  { id: 'kr_019', goal_id: 'goal_007', title: 'Achieve 99.9% uptime post-migration', target_value: 99.9, current_value: 99.7, unit: '%', status: 'in_progress', created_at: '2026-01-02T09:00:00Z', updated_at: '2026-01-26T09:00:00Z' },
  { id: 'kr_020', goal_id: 'goal_007', title: 'Complete migration documentation', target_value: 100, current_value: 65, unit: '%', status: 'in_progress', created_at: '2026-01-02T09:00:00Z', updated_at: '2026-01-25T09:00:00Z' },

  // Goal 008 - Automated Testing
  { id: 'kr_021', goal_id: 'goal_008', title: 'Achieve 80% code coverage', target_value: 80, current_value: 52, unit: '%', status: 'in_progress', created_at: '2026-01-10T09:00:00Z', updated_at: '2026-01-27T09:00:00Z' },
  { id: 'kr_022', goal_id: 'goal_008', title: 'Set up E2E tests for 10 critical flows', target_value: 10, current_value: 3, unit: 'flows', status: 'in_progress', created_at: '2026-01-10T09:00:00Z', updated_at: '2026-01-25T09:00:00Z' },

  // Goal 009 - Q1 Sales Target
  { id: 'kr_023', goal_id: 'goal_009', title: 'Close $500K in new ARR', target_value: 500000, current_value: 142000, unit: 'USD', status: 'in_progress', created_at: '2025-12-28T09:00:00Z', updated_at: '2026-01-27T09:00:00Z' },
  { id: 'kr_024', goal_id: 'goal_009', title: 'Close 20 new deals', target_value: 20, current_value: 6, unit: 'deals', status: 'in_progress', created_at: '2025-12-28T09:00:00Z', updated_at: '2026-01-27T09:00:00Z' },
  { id: 'kr_025', goal_id: 'goal_009', title: 'Average deal size of $25K', target_value: 25000, current_value: 23666, unit: 'USD', status: 'in_progress', created_at: '2025-12-28T09:00:00Z', updated_at: '2026-01-27T09:00:00Z' },

  // Goal 010 - Marketing Campaign
  { id: 'kr_026', goal_id: 'goal_010', title: 'Generate 1000 qualified leads', target_value: 1000, current_value: 320, unit: 'leads', status: 'in_progress', created_at: '2025-12-22T09:00:00Z', updated_at: '2026-01-27T09:00:00Z' },
  { id: 'kr_027', goal_id: 'goal_010', title: 'Achieve 3% conversion rate', target_value: 3, current_value: 2.4, unit: '%', status: 'in_progress', created_at: '2025-12-22T09:00:00Z', updated_at: '2026-01-25T09:00:00Z' },

  // Goal 011 - AWS Certification
  { id: 'kr_028', goal_id: 'goal_011', title: 'Complete official training course', target_value: 100, current_value: 85, unit: '%', status: 'in_progress', created_at: '2026-01-02T09:00:00Z', updated_at: '2026-01-26T09:00:00Z' },
  { id: 'kr_029', goal_id: 'goal_011', title: 'Pass 3 practice exams with 80%+', target_value: 3, current_value: 2, unit: 'exams', status: 'in_progress', created_at: '2026-01-02T09:00:00Z', updated_at: '2026-01-25T09:00:00Z' },
  { id: 'kr_030', goal_id: 'goal_011', title: 'Pass certification exam', target_value: 1, current_value: 0, unit: 'exam', status: 'in_progress', created_at: '2026-01-02T09:00:00Z', updated_at: '2026-01-02T09:00:00Z' },

  // Goal 012 - API Performance
  { id: 'kr_031', goal_id: 'goal_012', title: 'Reduce p95 latency from 500ms to 300ms', target_value: 300, current_value: 380, unit: 'ms', status: 'in_progress', created_at: '2026-01-08T09:00:00Z', updated_at: '2026-01-27T09:00:00Z' },
  { id: 'kr_032', goal_id: 'goal_012', title: 'Optimize 10 slow database queries', target_value: 10, current_value: 6, unit: 'queries', status: 'in_progress', created_at: '2026-01-08T09:00:00Z', updated_at: '2026-01-26T09:00:00Z' },
  { id: 'kr_033', goal_id: 'goal_012', title: 'Implement Redis caching for 5 endpoints', target_value: 5, current_value: 3, unit: 'endpoints', status: 'in_progress', created_at: '2026-01-08T09:00:00Z', updated_at: '2026-01-25T09:00:00Z' },

  // Goal 013 - Frontend Testing Training
  { id: 'kr_034', goal_id: 'goal_013', title: 'Complete Vitest certification course', target_value: 100, current_value: 40, unit: '%', status: 'in_progress', created_at: '2026-01-12T09:00:00Z', updated_at: '2026-01-24T09:00:00Z' },
  { id: 'kr_035', goal_id: 'goal_013', title: 'Write tests for 20 components', target_value: 20, current_value: 5, unit: 'components', status: 'in_progress', created_at: '2026-01-12T09:00:00Z', updated_at: '2026-01-27T09:00:00Z' },

  // Goal 014 - Zero-Downtime Deployment
  { id: 'kr_036', goal_id: 'goal_014', title: 'Implement blue-green deployment', target_value: 100, current_value: 70, unit: '%', status: 'in_progress', created_at: '2026-01-03T09:00:00Z', updated_at: '2026-01-27T09:00:00Z' },
  { id: 'kr_037', goal_id: 'goal_014', title: 'Create automated rollback system', target_value: 100, current_value: 45, unit: '%', status: 'in_progress', created_at: '2026-01-03T09:00:00Z', updated_at: '2026-01-26T09:00:00Z' },
  { id: 'kr_038', goal_id: 'goal_014', title: 'Document deployment procedures', target_value: 100, current_value: 60, unit: '%', status: 'in_progress', created_at: '2026-01-03T09:00:00Z', updated_at: '2026-01-24T09:00:00Z' },

  // Goal 015 - User Research Framework
  { id: 'kr_039', goal_id: 'goal_015', title: 'Create interview template library', target_value: 10, current_value: 6, unit: 'templates', status: 'in_progress', created_at: '2026-01-08T09:00:00Z', updated_at: '2026-01-25T09:00:00Z' },
  { id: 'kr_040', goal_id: 'goal_015', title: 'Conduct 15 user interviews', target_value: 15, current_value: 8, unit: 'interviews', status: 'in_progress', created_at: '2026-01-08T09:00:00Z', updated_at: '2026-01-27T09:00:00Z' },

  // Goal 016 - Onboarding Flow (Completed)
  { id: 'kr_041', goal_id: 'goal_016', title: 'Design onboarding checklist system', target_value: 100, current_value: 100, unit: '%', status: 'completed', created_at: '2025-10-28T09:00:00Z', updated_at: '2026-01-05T09:00:00Z' },
  { id: 'kr_042', goal_id: 'goal_016', title: 'Implement progress tracking', target_value: 100, current_value: 100, unit: '%', status: 'completed', created_at: '2025-10-28T09:00:00Z', updated_at: '2026-01-10T09:00:00Z' },
  { id: 'kr_043', goal_id: 'goal_016', title: 'User acceptance testing passed', target_value: 100, current_value: 100, unit: '%', status: 'completed', created_at: '2025-10-28T09:00:00Z', updated_at: '2026-01-12T09:00:00Z' },

  // Goal 017 - Developer Portal (Pending)
  { id: 'kr_044', goal_id: 'goal_017', title: 'API documentation coverage 100%', target_value: 100, current_value: 0, unit: '%', status: 'in_progress', created_at: '2026-01-25T09:00:00Z', updated_at: '2026-01-25T09:00:00Z' },
  { id: 'kr_045', goal_id: 'goal_017', title: 'Self-service environment provisioning', target_value: 100, current_value: 0, unit: '%', status: 'in_progress', created_at: '2026-01-25T09:00:00Z', updated_at: '2026-01-25T09:00:00Z' },

  // Goal 020 - Code Review Process
  { id: 'kr_046', goal_id: 'goal_020', title: 'Reduce average review time to 4 hours', target_value: 4, current_value: 6.5, unit: 'hours', status: 'in_progress', created_at: '2026-01-12T09:00:00Z', updated_at: '2026-01-27T09:00:00Z' },
  { id: 'kr_047', goal_id: 'goal_020', title: 'Create code review guidelines doc', target_value: 100, current_value: 80, unit: '%', status: 'in_progress', created_at: '2026-01-12T09:00:00Z', updated_at: '2026-01-25T09:00:00Z' },

  // Goal 021 - Leadership Training
  { id: 'kr_048', goal_id: 'goal_021', title: 'Complete 8 workshop modules', target_value: 8, current_value: 2, unit: 'modules', status: 'in_progress', created_at: '2025-12-20T09:00:00Z', updated_at: '2026-01-20T09:00:00Z' },
  { id: 'kr_049', goal_id: 'goal_021', title: 'Complete mentoring sessions (12 total)', target_value: 12, current_value: 3, unit: 'sessions', status: 'in_progress', created_at: '2025-12-20T09:00:00Z', updated_at: '2026-01-25T09:00:00Z' },

  // Goal 022 - Security Audit
  { id: 'kr_050', goal_id: 'goal_022', title: 'Resolve 5 high-priority findings', target_value: 5, current_value: 2, unit: 'findings', status: 'in_progress', created_at: '2026-01-08T09:00:00Z', updated_at: '2026-01-27T09:00:00Z' },
  { id: 'kr_051', goal_id: 'goal_022', title: 'Resolve 12 medium-priority findings', target_value: 12, current_value: 4, unit: 'findings', status: 'in_progress', created_at: '2026-01-08T09:00:00Z', updated_at: '2026-01-26T09:00:00Z' },

  // Goal 023 - Enterprise Meetings
  { id: 'kr_052', goal_id: 'goal_023', title: 'Schedule 50 enterprise meetings', target_value: 50, current_value: 22, unit: 'meetings', status: 'in_progress', created_at: '2025-12-28T09:00:00Z', updated_at: '2026-01-27T09:00:00Z' },
  { id: 'kr_053', goal_id: 'goal_023', title: 'Convert 30% to qualified opportunities', target_value: 30, current_value: 36, unit: '%', status: 'completed', created_at: '2025-12-28T09:00:00Z', updated_at: '2026-01-26T09:00:00Z' },

  // Goal 025 - Notification System
  { id: 'kr_054', goal_id: 'goal_025', title: 'Implement WebSocket infrastructure', target_value: 100, current_value: 40, unit: '%', status: 'in_progress', created_at: '2026-01-18T09:00:00Z', updated_at: '2026-01-27T09:00:00Z' },
  { id: 'kr_055', goal_id: 'goal_025', title: 'Build notification UI components', target_value: 100, current_value: 20, unit: '%', status: 'in_progress', created_at: '2026-01-18T09:00:00Z', updated_at: '2026-01-26T09:00:00Z' }
]

// ============================================
// MOCK TEMPLATES DATA
// ============================================

export const mockTemplates: GoalTemplate[] = [
  {
    id: 'tmpl_001',
    title: 'Professional Certification',
    description: 'Template for pursuing professional certifications in your field.',
    type: 'individual',
    category: 'Professional Development',
    suggested_key_results: [
      { title: 'Complete official training/course', target_value: 100, unit: '%' },
      { title: 'Pass practice exams with passing score', target_value: 3, unit: 'exams' },
      { title: 'Obtain certification', target_value: 1, unit: 'certification' }
    ],
    is_active: true,
    created_at: '2025-06-01T09:00:00Z',
    updated_at: '2025-12-15T09:00:00Z'
  },
  {
    id: 'tmpl_002',
    title: 'Quarterly Sales Target',
    description: 'Standard template for quarterly sales team objectives.',
    type: 'team',
    category: 'Sales',
    suggested_key_results: [
      { title: 'Achieve revenue target', target_value: 500000, unit: 'USD' },
      { title: 'Close new deals', target_value: 20, unit: 'deals' },
      { title: 'Maintain average deal size', target_value: 25000, unit: 'USD' }
    ],
    is_active: true,
    created_at: '2025-06-01T09:00:00Z',
    updated_at: '2025-12-01T09:00:00Z'
  },
  {
    id: 'tmpl_003',
    title: 'Product Launch',
    description: 'Template for launching new product features or products.',
    type: 'team',
    category: 'Product',
    suggested_key_results: [
      { title: 'Complete feature development', target_value: 100, unit: '%' },
      { title: 'Achieve beta user satisfaction', target_value: 80, unit: '%' },
      { title: 'Complete documentation', target_value: 100, unit: '%' },
      { title: 'Zero critical bugs at launch', target_value: 0, unit: 'bugs' }
    ],
    is_active: true,
    created_at: '2025-07-01T09:00:00Z',
    updated_at: '2025-11-15T09:00:00Z'
  },
  {
    id: 'tmpl_004',
    title: 'Engineering Performance Improvement',
    description: 'Template for engineering teams focusing on velocity and quality.',
    type: 'department',
    category: 'Engineering',
    suggested_key_results: [
      { title: 'Increase sprint velocity', target_value: 30, unit: '%' },
      { title: 'Reduce bug escape rate', target_value: 5, unit: '%' },
      { title: 'Achieve code coverage target', target_value: 80, unit: '%' },
      { title: 'Reduce deployment failures', target_value: 2, unit: '%' }
    ],
    is_active: true,
    created_at: '2025-08-01T09:00:00Z',
    updated_at: '2025-12-10T09:00:00Z'
  },
  {
    id: 'tmpl_005',
    title: 'Customer Satisfaction Improvement',
    description: 'Template for improving customer satisfaction metrics.',
    type: 'company',
    category: 'Customer Success',
    suggested_key_results: [
      { title: 'Achieve NPS score target', target_value: 70, unit: 'points' },
      { title: 'Reduce support response time', target_value: 2, unit: 'hours' },
      { title: 'Customer satisfaction survey score', target_value: 90, unit: '%' }
    ],
    is_active: true,
    created_at: '2025-09-01T09:00:00Z',
    updated_at: '2025-12-01T09:00:00Z'
  },
  {
    id: 'tmpl_006',
    title: 'Leadership Development',
    description: 'Template for employees pursuing leadership growth.',
    type: 'individual',
    category: 'Professional Development',
    suggested_key_results: [
      { title: 'Complete leadership training modules', target_value: 8, unit: 'modules' },
      { title: 'Complete mentoring sessions', target_value: 12, unit: 'sessions' },
      { title: 'Lead cross-functional project', target_value: 1, unit: 'project' }
    ],
    is_active: true,
    created_at: '2025-10-01T09:00:00Z',
    updated_at: '2025-12-20T09:00:00Z'
  },
  {
    id: 'tmpl_007',
    title: 'Marketing Campaign',
    description: 'Template for marketing campaign objectives.',
    type: 'team',
    category: 'Marketing',
    suggested_key_results: [
      { title: 'Generate qualified leads', target_value: 1000, unit: 'leads' },
      { title: 'Achieve conversion rate', target_value: 3, unit: '%' },
      { title: 'Increase brand awareness', target_value: 25, unit: '%' }
    ],
    is_active: true,
    created_at: '2025-11-01T09:00:00Z',
    updated_at: '2025-12-15T09:00:00Z'
  },
  {
    id: 'tmpl_008',
    title: 'Employee Engagement',
    description: 'Template for HR teams focusing on employee engagement.',
    type: 'department',
    category: 'Human Resources',
    suggested_key_results: [
      { title: 'Employee engagement survey score', target_value: 85, unit: '%' },
      { title: 'Reduce voluntary turnover', target_value: 10, unit: '%' },
      { title: 'Complete career development plans', target_value: 50, unit: 'plans' }
    ],
    is_active: true,
    created_at: '2025-08-15T09:00:00Z',
    updated_at: '2025-12-01T09:00:00Z'
  }
]

// ============================================
// MOCK PROGRESS HISTORY DATA
// ============================================

export const mockProgressHistory: MockProgressHistory[] = [
  // Goal 011 - AWS Certification progress updates
  { id: 'ph_001', goal_id: 'goal_011', key_result_id: 'kr_028', old_value: 60, new_value: 85, comment: 'Completed modules 4-6', updated_by_id: 'emp_007', created_at: '2026-01-26T09:00:00Z' },
  { id: 'ph_002', goal_id: 'goal_011', key_result_id: 'kr_029', old_value: 1, new_value: 2, comment: 'Passed second practice exam with 84%', updated_by_id: 'emp_007', created_at: '2026-01-25T14:00:00Z' },
  { id: 'ph_003', goal_id: 'goal_011', key_result_id: 'kr_028', old_value: 40, new_value: 60, comment: 'Completed modules 1-3', updated_by_id: 'emp_007', created_at: '2026-01-18T09:00:00Z' },
  
  // Goal 007 - Kubernetes Migration updates
  { id: 'ph_004', goal_id: 'goal_007', key_result_id: 'kr_018', old_value: 4, new_value: 5, comment: 'Auth service migrated successfully', updated_by_id: 'emp_010', created_at: '2026-01-27T10:00:00Z' },
  { id: 'ph_005', goal_id: 'goal_007', key_result_id: 'kr_018', old_value: 3, new_value: 4, comment: 'User service migrated', updated_by_id: 'emp_010', created_at: '2026-01-20T15:00:00Z' },
  
  // Goal 009 - Sales updates
  { id: 'ph_006', goal_id: 'goal_009', key_result_id: 'kr_023', old_value: 98000, new_value: 142000, comment: 'Closed Acme Corp deal - $44K', updated_by_id: 'emp_013', created_at: '2026-01-27T11:00:00Z' },
  { id: 'ph_007', goal_id: 'goal_009', key_result_id: 'kr_024', old_value: 5, new_value: 6, comment: 'New deal with TechStart Inc', updated_by_id: 'emp_013', created_at: '2026-01-27T11:00:00Z' }
]

// ============================================
// HELPER FUNCTIONS
// ============================================

// Get owner info by ID
export function getOwnerById(ownerId: string): GoalOwner | undefined {
  return mockOwners[ownerId]
}

// Calculate key result progress
export function calculateKeyResultProgress(kr: MockKeyResult): number {
  if (kr.target_value === 0) return 0
  // For metrics where lower is better (like response time, churn rate)
  // This is a simplification - in real app, would need a "direction" field
  const progress = (kr.current_value / kr.target_value) * 100
  return Math.min(Math.round(progress), 100)
}

// Get key results for a goal
export function getKeyResultsForGoal(goalId: string): MockKeyResult[] {
  return mockKeyResults.filter(kr => kr.goal_id === goalId)
}

// Calculate goal progress from key results
export function calculateGoalProgress(goalId: string): number {
  const keyResults = getKeyResultsForGoal(goalId)
  if (keyResults.length === 0) return 0
  
  const totalProgress = keyResults.reduce((sum, kr) => {
    return sum + calculateKeyResultProgress(kr)
  }, 0)
  
  return Math.round(totalProgress / keyResults.length)
}

// Get key results summary for list view
export function getKeyResultsSummary(goalId: string): KeyResultSummary {
  const keyResults = getKeyResultsForGoal(goalId)
  return {
    total: keyResults.length,
    completed: keyResults.filter(kr => kr.status === 'completed').length
  }
}

// Convert mock key result to API format
export function toKeyResult(mock: MockKeyResult): KeyResult {
  return {
    id: mock.id,
    goal_id: mock.goal_id,
    title: mock.title,
    description: mock.description,
    target_value: mock.target_value,
    current_value: mock.current_value,
    unit: mock.unit,
    progress: calculateKeyResultProgress(mock),
    status: mock.status,
    created_at: mock.created_at,
    updated_at: mock.updated_at
  }
}

// Get parent goal summary
export function getParentGoalSummary(parentGoalId: string | undefined): ParentGoalSummary | undefined {
  if (!parentGoalId) return undefined
  const parent = mockGoals.find(g => g.id === parentGoalId)
  if (!parent) return undefined
  return {
    id: parent.id,
    title: parent.title,
    type: parent.type,
    status: parent.status
  }
}

// Get child goals
export function getChildGoals(goalId: string): ChildGoalSummary[] {
  return mockGoals
    .filter(g => g.parent_goal_id === goalId)
    .map(g => ({
      id: g.id,
      title: g.title,
      type: g.type,
      status: g.status,
      progress: calculateGoalProgress(g.id)
    }))
}

// Convert mock goal to full Goal type
export function toGoal(mock: MockGoal): Goal {
  const owner = getOwnerById(mock.owner_id)
  if (!owner) throw new Error(`Owner not found: ${mock.owner_id}`)
  
  return {
    id: mock.id,
    title: mock.title,
    description: mock.description,
    type: mock.type,
    status: mock.status,
    progress: calculateGoalProgress(mock.id),
    priority: mock.priority,
    visibility: mock.visibility,
    owner,
    owner_id: mock.owner_id,
    parent_goal: getParentGoalSummary(mock.parent_goal_id),
    parent_goal_id: mock.parent_goal_id,
    child_goals: getChildGoals(mock.id),
    key_results: getKeyResultsForGoal(mock.id).map(toKeyResult),
    tags: mock.tags,
    start_date: mock.start_date,
    due_date: mock.due_date,
    completed_at: mock.completed_at,
    created_at: mock.created_at,
    updated_at: mock.updated_at
  }
}

// Convert mock goal to list item
export function toGoalListItem(mock: MockGoal): GoalListItem {
  const owner = getOwnerById(mock.owner_id)
  if (!owner) throw new Error(`Owner not found: ${mock.owner_id}`)
  
  return {
    id: mock.id,
    title: mock.title,
    description: mock.description,
    type: mock.type,
    status: mock.status,
    progress: calculateGoalProgress(mock.id),
    priority: mock.priority,
    owner,
    parent_goal: getParentGoalSummary(mock.parent_goal_id),
    start_date: mock.start_date,
    due_date: mock.due_date,
    key_results: getKeyResultsSummary(mock.id),
    created_at: mock.created_at
  }
}

// Find goal by ID
export function findGoalById(id: string): MockGoal | undefined {
  return mockGoals.find(g => g.id === id)
}

// Find goals by owner
export function findGoalsByOwner(ownerId: string): MockGoal[] {
  return mockGoals.filter(g => g.owner_id === ownerId)
}

// Find goals by type
export function findGoalsByType(type: GoalType): MockGoal[] {
  return mockGoals.filter(g => g.type === type)
}

// Find goals by status
export function findGoalsByStatus(status: GoalStatus): MockGoal[] {
  return mockGoals.filter(g => g.status === status)
}

// Find key result by ID
export function findKeyResultById(id: string): MockKeyResult | undefined {
  return mockKeyResults.find(kr => kr.id === id)
}

// Calculate expected progress based on dates
export function calculateExpectedProgress(startDate: string | undefined, dueDate: string): number {
  const now = new Date()
  const start = startDate ? new Date(startDate) : new Date(dueDate)
  const end = new Date(dueDate)
  
  if (now < start) return 0
  if (now > end) return 100
  
  const totalDays = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
  const elapsedDays = (now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
  
  return Math.round((elapsedDays / totalDays) * 100)
}

// Get progress indicator (on track, at risk, behind)
export function getProgressIndicator(actual: number, expected: number): ProgressIndicator {
  const ratio = expected === 0 ? 1 : actual / expected
  if (ratio >= 0.7) return 'on_track'
  if (ratio >= 0.4) return 'at_risk'
  return 'behind'
}

// Build alignment tree for visualization
export function buildAlignmentTree(rootGoalId?: string): GoalAlignmentNode[] {
  const rootGoals = rootGoalId 
    ? mockGoals.filter(g => g.id === rootGoalId)
    : mockGoals.filter(g => !g.parent_goal_id && g.status !== 'cancelled')
  
  function buildNode(goal: MockGoal): GoalAlignmentNode {
    const owner = getOwnerById(goal.owner_id)!
    const children = mockGoals
      .filter(g => g.parent_goal_id === goal.id)
      .map(buildNode)
    
    return {
      id: goal.id,
      title: goal.title,
      type: goal.type,
      status: goal.status,
      progress: calculateGoalProgress(goal.id),
      owner,
      children
    }
  }
  
  return rootGoals.map(buildNode)
}

// Generate unique IDs
let goalIdCounter = mockGoals.length + 1
let keyResultIdCounter = mockKeyResults.length + 1
let progressHistoryIdCounter = mockProgressHistory.length + 1

export function generateGoalId(): string {
  return `goal_${String(goalIdCounter++).padStart(3, '0')}`
}

export function generateKeyResultId(): string {
  return `kr_${String(keyResultIdCounter++).padStart(3, '0')}`
}

export function generateProgressHistoryId(): string {
  return `ph_${String(progressHistoryIdCounter++).padStart(3, '0')}`
}

// Convert progress history to API format
export function toProgressHistory(mock: MockProgressHistory): ProgressHistory {
  const updatedBy = getOwnerById(mock.updated_by_id)
  if (!updatedBy) throw new Error(`User not found: ${mock.updated_by_id}`)
  
  return {
    id: mock.id,
    goal_id: mock.goal_id,
    key_result_id: mock.key_result_id,
    old_value: mock.old_value,
    new_value: mock.new_value,
    comment: mock.comment,
    updated_by: updatedBy,
    created_at: mock.created_at
  }
}

// Get progress history for a goal
export function getProgressHistoryForGoal(goalId: string): ProgressHistory[] {
  return mockProgressHistory
    .filter(ph => ph.goal_id === goalId)
    .map(toProgressHistory)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
}
