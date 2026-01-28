/**
 * Mock user data for development/testing
 * Remove this file when real API is ready
 */

export interface MockUser {
  id: string
  email: string
  password: string // Plain text for mock only
  role: 'admin' | 'hr' | 'manager' | 'employee' | 'csuite'
  status: 'active' | 'inactive' | 'suspended'
  employee: {
    id: string
    firstName: string
    lastName: string
    jobTitle: string
    department: string
    avatarUrl: string | null
  }
}

export const mockUsers: MockUser[] = [
  {
    id: 'usr_001',
    email: 'admin@company.com',
    password: 'Admin123',
    role: 'admin',
    status: 'active',
    employee: {
      id: 'emp_001',
      firstName: 'System',
      lastName: 'Administrator',
      jobTitle: 'IT Administrator',
      department: 'Information Technology',
      avatarUrl: null
    }
  },
  {
    id: 'usr_002',
    email: 'hr@company.com',
    password: 'Hr123456',
    role: 'hr',
    status: 'active',
    employee: {
      id: 'emp_002',
      firstName: 'Sarah',
      lastName: 'Johnson',
      jobTitle: 'HR Manager',
      department: 'Human Resources',
      avatarUrl: null
    }
  },
  {
    id: 'usr_003',
    email: 'manager@company.com',
    password: 'Manager123',
    role: 'manager',
    status: 'active',
    employee: {
      id: 'emp_003',
      firstName: 'Michael',
      lastName: 'Chen',
      jobTitle: 'Engineering Manager',
      department: 'Engineering',
      avatarUrl: null
    }
  },
  {
    id: 'usr_004',
    email: 'employee@company.com',
    password: 'Employee123',
    role: 'employee',
    status: 'active',
    employee: {
      id: 'emp_004',
      firstName: 'Emily',
      lastName: 'Davis',
      jobTitle: 'Software Developer',
      department: 'Engineering',
      avatarUrl: null
    }
  },
  {
    id: 'usr_005',
    email: 'ceo@company.com',
    password: 'Ceo12345',
    role: 'csuite',
    status: 'active',
    employee: {
      id: 'emp_005',
      firstName: 'Robert',
      lastName: 'Williams',
      jobTitle: 'Chief Executive Officer',
      department: 'Executive',
      avatarUrl: null
    }
  }
]

// In-memory token store (for development only)
export const tokenStore = new Map<string, { userId: string; expiresAt: number }>()

// Helper to generate mock tokens
export function generateMockToken(prefix: string = 'tok'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
}

// Helper to find user by email
export function findUserByEmail(email: string): MockUser | undefined {
  return mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase())
}

// Helper to find user by ID
export function findUserById(id: string): MockUser | undefined {
  return mockUsers.find(u => u.id === id)
}
