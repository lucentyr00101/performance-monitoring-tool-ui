/**
 * Mock employee data for development/testing
 * Remove this file when real API is ready
 */

import type { Employee, EmployeeListItem } from '~/types/employee'

export interface MockEmployee {
  id: string
  user_id: string
  employee_code: string
  first_name: string
  last_name: string
  email: string
  phone?: string
  avatar_url?: string
  job_title: string
  department_id: string
  department_name: string
  manager_id?: string
  hire_date: string
  employment_type: 'full-time' | 'part-time' | 'contract'
  employment_status: 'active' | 'inactive' | 'on_leave' | 'terminated'
  work_location: 'remote' | 'hybrid' | 'office'
  career_level?: string
  user_role: 'admin' | 'hr' | 'manager' | 'employee' | 'csuite'
  created_at: string
  updated_at: string
}

export const mockEmployees: MockEmployee[] = [
  // Executive
  {
    id: 'emp_001',
    user_id: 'usr_005',
    employee_code: 'EMP-001',
    first_name: 'Robert',
    last_name: 'Williams',
    email: 'ceo@company.com',
    phone: '+1-555-100-0001',
    avatar_url: undefined,
    job_title: 'Chief Executive Officer',
    department_id: 'dept_001',
    department_name: 'Executive',
    manager_id: undefined,
    hire_date: '2018-01-15',
    employment_type: 'full-time',
    employment_status: 'active',
    work_location: 'office',
    career_level: 'Executive',
    user_role: 'csuite',
    created_at: '2018-01-15T09:00:00Z',
    updated_at: '2026-01-15T14:30:00Z'
  },
  {
    id: 'emp_002',
    user_id: 'usr_006',
    employee_code: 'EMP-002',
    first_name: 'Jennifer',
    last_name: 'Martinez',
    email: 'cfo@company.com',
    phone: '+1-555-100-0002',
    avatar_url: undefined,
    job_title: 'Chief Financial Officer',
    department_id: 'dept_001',
    department_name: 'Executive',
    manager_id: 'emp_001',
    hire_date: '2019-03-01',
    employment_type: 'full-time',
    employment_status: 'active',
    work_location: 'hybrid',
    career_level: 'Executive',
    user_role: 'csuite',
    created_at: '2019-03-01T09:00:00Z',
    updated_at: '2026-01-10T10:00:00Z'
  },

  // IT / Admin
  {
    id: 'emp_003',
    user_id: 'usr_001',
    employee_code: 'EMP-003',
    first_name: 'System',
    last_name: 'Administrator',
    email: 'admin@company.com',
    phone: '+1-555-100-0003',
    avatar_url: undefined,
    job_title: 'IT Administrator',
    department_id: 'dept_007',
    department_name: 'Information Technology',
    manager_id: 'emp_001',
    hire_date: '2020-06-15',
    employment_type: 'full-time',
    employment_status: 'active',
    work_location: 'hybrid',
    career_level: 'Senior',
    user_role: 'admin',
    created_at: '2020-06-15T09:00:00Z',
    updated_at: '2026-01-20T11:00:00Z'
  },

  // HR
  {
    id: 'emp_004',
    user_id: 'usr_002',
    employee_code: 'EMP-004',
    first_name: 'Sarah',
    last_name: 'Johnson',
    email: 'hr@company.com',
    phone: '+1-555-100-0004',
    avatar_url: undefined,
    job_title: 'HR Manager',
    department_id: 'dept_002',
    department_name: 'Human Resources',
    manager_id: 'emp_001',
    hire_date: '2020-02-10',
    employment_type: 'full-time',
    employment_status: 'active',
    work_location: 'office',
    career_level: 'Manager',
    user_role: 'hr',
    created_at: '2020-02-10T09:00:00Z',
    updated_at: '2026-01-18T09:00:00Z'
  },
  {
    id: 'emp_005',
    user_id: 'usr_007',
    employee_code: 'EMP-005',
    first_name: 'Lisa',
    last_name: 'Thompson',
    email: 'lisa.thompson@company.com',
    phone: '+1-555-100-0005',
    avatar_url: undefined,
    job_title: 'HR Specialist',
    department_id: 'dept_002',
    department_name: 'Human Resources',
    manager_id: 'emp_004',
    hire_date: '2022-08-01',
    employment_type: 'full-time',
    employment_status: 'active',
    work_location: 'hybrid',
    career_level: 'Mid-Level',
    user_role: 'employee',
    created_at: '2022-08-01T09:00:00Z',
    updated_at: '2026-01-05T14:00:00Z'
  },

  // Engineering Manager
  {
    id: 'emp_006',
    user_id: 'usr_003',
    employee_code: 'EMP-006',
    first_name: 'Michael',
    last_name: 'Chen',
    email: 'manager@company.com',
    phone: '+1-555-100-0006',
    avatar_url: undefined,
    job_title: 'Engineering Manager',
    department_id: 'dept_003',
    department_name: 'Engineering',
    manager_id: 'emp_001',
    hire_date: '2019-11-15',
    employment_type: 'full-time',
    employment_status: 'active',
    work_location: 'hybrid',
    career_level: 'Manager',
    user_role: 'manager',
    created_at: '2019-11-15T09:00:00Z',
    updated_at: '2026-01-25T10:00:00Z'
  },

  // Engineering Team
  {
    id: 'emp_007',
    user_id: 'usr_004',
    employee_code: 'EMP-007',
    first_name: 'Emily',
    last_name: 'Davis',
    email: 'employee@company.com',
    phone: '+1-555-100-0007',
    avatar_url: undefined,
    job_title: 'Software Developer',
    department_id: 'dept_003',
    department_name: 'Engineering',
    manager_id: 'emp_006',
    hire_date: '2021-03-20',
    employment_type: 'full-time',
    employment_status: 'active',
    work_location: 'remote',
    career_level: 'Mid-Level',
    user_role: 'employee',
    created_at: '2021-03-20T09:00:00Z',
    updated_at: '2026-01-22T16:00:00Z'
  },
  {
    id: 'emp_008',
    user_id: 'usr_008',
    employee_code: 'EMP-008',
    first_name: 'David',
    last_name: 'Brown',
    email: 'david.brown@company.com',
    phone: '+1-555-100-0008',
    avatar_url: undefined,
    job_title: 'Senior Software Developer',
    department_id: 'dept_003',
    department_name: 'Engineering',
    manager_id: 'emp_006',
    hire_date: '2020-09-01',
    employment_type: 'full-time',
    employment_status: 'active',
    work_location: 'hybrid',
    career_level: 'Senior',
    user_role: 'employee',
    created_at: '2020-09-01T09:00:00Z',
    updated_at: '2026-01-20T11:30:00Z'
  },
  {
    id: 'emp_009',
    user_id: 'usr_009',
    employee_code: 'EMP-009',
    first_name: 'Amanda',
    last_name: 'Wilson',
    email: 'amanda.wilson@company.com',
    phone: '+1-555-100-0009',
    avatar_url: undefined,
    job_title: 'Junior Developer',
    department_id: 'dept_003',
    department_name: 'Engineering',
    manager_id: 'emp_006',
    hire_date: '2024-01-15',
    employment_type: 'full-time',
    employment_status: 'active',
    work_location: 'office',
    career_level: 'Junior',
    user_role: 'employee',
    created_at: '2024-01-15T09:00:00Z',
    updated_at: '2026-01-15T09:00:00Z'
  },
  {
    id: 'emp_010',
    user_id: 'usr_010',
    employee_code: 'EMP-010',
    first_name: 'James',
    last_name: 'Taylor',
    email: 'james.taylor@company.com',
    phone: '+1-555-100-0010',
    avatar_url: undefined,
    job_title: 'DevOps Engineer',
    department_id: 'dept_003',
    department_name: 'Engineering',
    manager_id: 'emp_006',
    hire_date: '2021-07-10',
    employment_type: 'full-time',
    employment_status: 'active',
    work_location: 'remote',
    career_level: 'Senior',
    user_role: 'employee',
    created_at: '2021-07-10T09:00:00Z',
    updated_at: '2026-01-12T14:00:00Z'
  },

  // Product Team
  {
    id: 'emp_011',
    user_id: 'usr_011',
    employee_code: 'EMP-011',
    first_name: 'Rachel',
    last_name: 'Green',
    email: 'rachel.green@company.com',
    phone: '+1-555-100-0011',
    avatar_url: undefined,
    job_title: 'Product Manager',
    department_id: 'dept_004',
    department_name: 'Product',
    manager_id: 'emp_001',
    hire_date: '2020-04-20',
    employment_type: 'full-time',
    employment_status: 'active',
    work_location: 'hybrid',
    career_level: 'Manager',
    user_role: 'manager',
    created_at: '2020-04-20T09:00:00Z',
    updated_at: '2026-01-20T10:00:00Z'
  },
  {
    id: 'emp_012',
    user_id: 'usr_012',
    employee_code: 'EMP-012',
    first_name: 'Kevin',
    last_name: 'Moore',
    email: 'kevin.moore@company.com',
    phone: '+1-555-100-0012',
    avatar_url: undefined,
    job_title: 'UX Designer',
    department_id: 'dept_004',
    department_name: 'Product',
    manager_id: 'emp_011',
    hire_date: '2022-02-14',
    employment_type: 'full-time',
    employment_status: 'active',
    work_location: 'remote',
    career_level: 'Mid-Level',
    user_role: 'employee',
    created_at: '2022-02-14T09:00:00Z',
    updated_at: '2026-01-18T11:00:00Z'
  },

  // Sales Team
  {
    id: 'emp_013',
    user_id: 'usr_013',
    employee_code: 'EMP-013',
    first_name: 'Christopher',
    last_name: 'Anderson',
    email: 'chris.anderson@company.com',
    phone: '+1-555-100-0013',
    avatar_url: undefined,
    job_title: 'Sales Director',
    department_id: 'dept_005',
    department_name: 'Sales',
    manager_id: 'emp_001',
    hire_date: '2019-08-01',
    employment_type: 'full-time',
    employment_status: 'active',
    work_location: 'office',
    career_level: 'Director',
    user_role: 'manager',
    created_at: '2019-08-01T09:00:00Z',
    updated_at: '2026-01-22T09:00:00Z'
  },
  {
    id: 'emp_014',
    user_id: 'usr_014',
    employee_code: 'EMP-014',
    first_name: 'Michelle',
    last_name: 'Lee',
    email: 'michelle.lee@company.com',
    phone: '+1-555-100-0014',
    avatar_url: undefined,
    job_title: 'Account Executive',
    department_id: 'dept_005',
    department_name: 'Sales',
    manager_id: 'emp_013',
    hire_date: '2023-05-15',
    employment_type: 'full-time',
    employment_status: 'active',
    work_location: 'hybrid',
    career_level: 'Mid-Level',
    user_role: 'employee',
    created_at: '2023-05-15T09:00:00Z',
    updated_at: '2026-01-10T15:00:00Z'
  },

  // Marketing
  {
    id: 'emp_015',
    user_id: 'usr_015',
    employee_code: 'EMP-015',
    first_name: 'Jessica',
    last_name: 'Clark',
    email: 'jessica.clark@company.com',
    phone: '+1-555-100-0015',
    avatar_url: undefined,
    job_title: 'Marketing Manager',
    department_id: 'dept_006',
    department_name: 'Marketing',
    manager_id: 'emp_001',
    hire_date: '2021-01-10',
    employment_type: 'full-time',
    employment_status: 'active',
    work_location: 'hybrid',
    career_level: 'Manager',
    user_role: 'manager',
    created_at: '2021-01-10T09:00:00Z',
    updated_at: '2026-01-15T10:00:00Z'
  },
  {
    id: 'emp_016',
    user_id: 'usr_016',
    employee_code: 'EMP-016',
    first_name: 'Brian',
    last_name: 'Harris',
    email: 'brian.harris@company.com',
    phone: '+1-555-100-0016',
    avatar_url: undefined,
    job_title: 'Content Specialist',
    department_id: 'dept_006',
    department_name: 'Marketing',
    manager_id: 'emp_015',
    hire_date: '2022-11-01',
    employment_type: 'full-time',
    employment_status: 'active',
    work_location: 'remote',
    career_level: 'Mid-Level',
    user_role: 'employee',
    created_at: '2022-11-01T09:00:00Z',
    updated_at: '2026-01-08T16:00:00Z'
  },

  // On Leave employee
  {
    id: 'emp_017',
    user_id: 'usr_017',
    employee_code: 'EMP-017',
    first_name: 'Patricia',
    last_name: 'Wright',
    email: 'patricia.wright@company.com',
    phone: '+1-555-100-0017',
    avatar_url: undefined,
    job_title: 'Senior Developer',
    department_id: 'dept_003',
    department_name: 'Engineering',
    manager_id: 'emp_006',
    hire_date: '2020-03-15',
    employment_type: 'full-time',
    employment_status: 'on_leave',
    work_location: 'hybrid',
    career_level: 'Senior',
    user_role: 'employee',
    created_at: '2020-03-15T09:00:00Z',
    updated_at: '2026-01-01T09:00:00Z'
  },

  // Contractor
  {
    id: 'emp_018',
    user_id: 'usr_018',
    employee_code: 'EMP-018',
    first_name: 'Thomas',
    last_name: 'King',
    email: 'thomas.king@company.com',
    phone: '+1-555-100-0018',
    avatar_url: undefined,
    job_title: 'Security Consultant',
    department_id: 'dept_007',
    department_name: 'Information Technology',
    manager_id: 'emp_003',
    hire_date: '2025-06-01',
    employment_type: 'contract',
    employment_status: 'active',
    work_location: 'remote',
    career_level: 'Senior',
    user_role: 'employee',
    created_at: '2025-06-01T09:00:00Z',
    updated_at: '2026-01-20T10:00:00Z'
  },

  // Part-time
  {
    id: 'emp_019',
    user_id: 'usr_019',
    employee_code: 'EMP-019',
    first_name: 'Nancy',
    last_name: 'Scott',
    email: 'nancy.scott@company.com',
    phone: '+1-555-100-0019',
    avatar_url: undefined,
    job_title: 'Data Analyst',
    department_id: 'dept_004',
    department_name: 'Product',
    manager_id: 'emp_011',
    hire_date: '2023-09-01',
    employment_type: 'part-time',
    employment_status: 'active',
    work_location: 'remote',
    career_level: 'Mid-Level',
    user_role: 'employee',
    created_at: '2023-09-01T09:00:00Z',
    updated_at: '2026-01-18T14:00:00Z'
  },

  // Inactive employee
  {
    id: 'emp_020',
    user_id: 'usr_020',
    employee_code: 'EMP-020',
    first_name: 'Daniel',
    last_name: 'Adams',
    email: 'daniel.adams@company.com',
    phone: '+1-555-100-0020',
    avatar_url: undefined,
    job_title: 'Former Sales Rep',
    department_id: 'dept_005',
    department_name: 'Sales',
    manager_id: 'emp_013',
    hire_date: '2021-04-01',
    employment_type: 'full-time',
    employment_status: 'terminated',
    work_location: 'office',
    career_level: 'Mid-Level',
    user_role: 'employee',
    created_at: '2021-04-01T09:00:00Z',
    updated_at: '2025-12-15T09:00:00Z'
  }
]

// Helper to get employee by ID
export function findEmployeeById(id: string): MockEmployee | undefined {
  return mockEmployees.find(e => e.id === id)
}

// Helper to get employees by department
export function findEmployeesByDepartment(departmentId: string): MockEmployee[] {
  return mockEmployees.filter(e => e.department_id === departmentId)
}

// Helper to get direct reports
export function findDirectReports(managerId: string): MockEmployee[] {
  return mockEmployees.filter(e => e.manager_id === managerId)
}

// Helper to get manager info
export function getManagerInfo(managerId: string | undefined) {
  if (!managerId) return undefined
  const manager = findEmployeeById(managerId)
  if (!manager) return undefined
  return {
    id: manager.id,
    first_name: manager.first_name,
    last_name: manager.last_name,
    job_title: manager.job_title,
    email: manager.email
  }
}

// Convert mock employee to full Employee type
export function toEmployee(mock: MockEmployee): Employee {
  const manager = getManagerInfo(mock.manager_id)
  
  return {
    id: mock.id,
    user_id: mock.user_id,
    employee_code: mock.employee_code,
    first_name: mock.first_name,
    last_name: mock.last_name,
    email: mock.email,
    phone: mock.phone,
    avatar_url: mock.avatar_url,
    job_title: mock.job_title,
    department_id: mock.department_id,
    department: {
      id: mock.department_id,
      name: mock.department_name
    },
    manager_id: mock.manager_id,
    manager,
    hire_date: mock.hire_date,
    employment_type: mock.employment_type,
    employment_status: mock.employment_status,
    work_location: mock.work_location,
    career_level: mock.career_level,
    direct_reports_count: findDirectReports(mock.id).length,
    created_at: mock.created_at,
    updated_at: mock.updated_at
  }
}

// Convert mock employee to list item
export function toEmployeeListItem(mock: MockEmployee): EmployeeListItem {
  const manager = getManagerInfo(mock.manager_id)
  
  return {
    id: mock.id,
    employee_code: mock.employee_code,
    first_name: mock.first_name,
    last_name: mock.last_name,
    email: mock.email,
    job_title: mock.job_title,
    department: {
      id: mock.department_id,
      name: mock.department_name
    },
    manager: manager ? {
      id: manager.id,
      first_name: manager.first_name,
      last_name: manager.last_name
    } : undefined,
    hire_date: mock.hire_date,
    employment_status: mock.employment_status,
    avatar_url: mock.avatar_url
  }
}

// Generate next employee code
let employeeCodeCounter = mockEmployees.length + 1
export function generateEmployeeCode(): string {
  return `EMP-${String(employeeCodeCounter++).padStart(3, '0')}`
}

// Generate UUID
export function generateId(): string {
  return `emp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}
