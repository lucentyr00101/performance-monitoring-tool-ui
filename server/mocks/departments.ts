/**
 * Mock department data for development/testing
 * Remove this file when real API is ready
 */

import type { Department, DepartmentListItem, DepartmentHierarchyNode } from '~/types/department'
import { getManagerInfo } from './employees'

export interface MockDepartment {
  id: string
  name: string
  description?: string
  parent_id?: string
  manager_id?: string
  employee_count: number
  status: 'active' | 'inactive'
  created_at: string
  updated_at: string
}

export const mockDepartments: MockDepartment[] = [
  {
    id: 'dept_001',
    name: 'Executive',
    description: 'Executive leadership and strategic direction',
    parent_id: undefined,
    manager_id: 'emp_001', // CEO
    employee_count: 2,
    status: 'active',
    created_at: '2018-01-01T09:00:00Z',
    updated_at: '2026-01-15T10:00:00Z'
  },
  {
    id: 'dept_002',
    name: 'Human Resources',
    description: 'People operations, recruitment, and employee relations',
    parent_id: 'dept_001',
    manager_id: 'emp_004', // Sarah Johnson
    employee_count: 2,
    status: 'active',
    created_at: '2018-01-01T09:00:00Z',
    updated_at: '2026-01-10T10:00:00Z'
  },
  {
    id: 'dept_003',
    name: 'Engineering',
    description: 'Software development, DevOps, and technical architecture',
    parent_id: 'dept_001',
    manager_id: 'emp_006', // Michael Chen
    employee_count: 6,
    status: 'active',
    created_at: '2018-01-01T09:00:00Z',
    updated_at: '2026-01-20T11:00:00Z'
  },
  {
    id: 'dept_004',
    name: 'Product',
    description: 'Product management, design, and user experience',
    parent_id: 'dept_001',
    manager_id: 'emp_011', // Rachel Green
    employee_count: 3,
    status: 'active',
    created_at: '2019-03-01T09:00:00Z',
    updated_at: '2026-01-18T09:00:00Z'
  },
  {
    id: 'dept_005',
    name: 'Sales',
    description: 'Sales, business development, and customer acquisition',
    parent_id: 'dept_001',
    manager_id: 'emp_013', // Christopher Anderson
    employee_count: 3,
    status: 'active',
    created_at: '2018-06-01T09:00:00Z',
    updated_at: '2026-01-22T10:00:00Z'
  },
  {
    id: 'dept_006',
    name: 'Marketing',
    description: 'Brand management, content, and demand generation',
    parent_id: 'dept_001',
    manager_id: 'emp_015', // Jessica Clark
    employee_count: 2,
    status: 'active',
    created_at: '2019-01-01T09:00:00Z',
    updated_at: '2026-01-15T10:00:00Z'
  },
  {
    id: 'dept_007',
    name: 'Information Technology',
    description: 'IT infrastructure, security, and technical support',
    parent_id: 'dept_001',
    manager_id: 'emp_003', // System Administrator
    employee_count: 2,
    status: 'active',
    created_at: '2019-06-01T09:00:00Z',
    updated_at: '2026-01-20T14:00:00Z'
  },
  {
    id: 'dept_008',
    name: 'Frontend Engineering',
    description: 'Frontend development and UI/UX implementation',
    parent_id: 'dept_003',
    manager_id: undefined,
    employee_count: 0,
    status: 'active',
    created_at: '2022-01-01T09:00:00Z',
    updated_at: '2026-01-10T09:00:00Z'
  },
  {
    id: 'dept_009',
    name: 'Backend Engineering',
    description: 'Backend development, APIs, and data services',
    parent_id: 'dept_003',
    manager_id: undefined,
    employee_count: 0,
    status: 'active',
    created_at: '2022-01-01T09:00:00Z',
    updated_at: '2026-01-10T09:00:00Z'
  },
  {
    id: 'dept_010',
    name: 'DevOps',
    description: 'Infrastructure, CI/CD, and platform engineering',
    parent_id: 'dept_003',
    manager_id: undefined,
    employee_count: 0,
    status: 'active',
    created_at: '2022-06-01T09:00:00Z',
    updated_at: '2026-01-12T09:00:00Z'
  }
]

// Helper to get department by ID
export function findDepartmentById(id: string): MockDepartment | undefined {
  return mockDepartments.find(d => d.id === id)
}

// Helper to get child departments
export function findChildDepartments(parentId: string): MockDepartment[] {
  return mockDepartments.filter(d => d.parent_id === parentId)
}

// Helper to get parent department info
export function getParentInfo(parentId: string | undefined) {
  if (!parentId) return undefined
  const parent = findDepartmentById(parentId)
  if (!parent) return undefined
  return {
    id: parent.id,
    name: parent.name
  }
}

// Convert mock department to full Department type
export function toDepartment(mock: MockDepartment): Department {
  const manager = getManagerInfo(mock.manager_id)
  const parent = getParentInfo(mock.parent_id)
  const children = findChildDepartments(mock.id)
  
  return {
    id: mock.id,
    name: mock.name,
    description: mock.description,
    parent_id: mock.parent_id,
    parent,
    manager_id: mock.manager_id,
    manager,
    sub_departments: children.map(c => ({
      id: c.id,
      name: c.name,
      employee_count: c.employee_count
    })),
    employee_count: mock.employee_count,
    status: mock.status,
    created_at: mock.created_at,
    updated_at: mock.updated_at
  }
}

// Convert mock department to list item
export function toDepartmentListItem(mock: MockDepartment): DepartmentListItem {
  const manager = getManagerInfo(mock.manager_id)
  const parent = getParentInfo(mock.parent_id)
  
  return {
    id: mock.id,
    name: mock.name,
    description: mock.description,
    parent,
    manager,
    employee_count: mock.employee_count,
    status: mock.status
  }
}

// Build hierarchy tree recursively
function buildHierarchyNode(mock: MockDepartment): DepartmentHierarchyNode {
  const manager = getManagerInfo(mock.manager_id)
  const children = findChildDepartments(mock.id)
  
  return {
    id: mock.id,
    name: mock.name,
    employee_count: mock.employee_count,
    manager,
    children: children.map(c => buildHierarchyNode(c))
  }
}

// Get full hierarchy tree
export function getHierarchyTree(): DepartmentHierarchyNode[] {
  // Get root departments (no parent)
  const roots = mockDepartments.filter(d => !d.parent_id && d.status === 'active')
  return roots.map(r => buildHierarchyNode(r))
}

// Calculate max depth of hierarchy
export function getMaxDepth(nodes: DepartmentHierarchyNode[], currentDepth: number = 1): number {
  if (nodes.length === 0) return currentDepth - 1
  
  let maxDepth = currentDepth
  for (const node of nodes) {
    if (node.children.length > 0) {
      const childDepth = getMaxDepth(node.children, currentDepth + 1)
      maxDepth = Math.max(maxDepth, childDepth)
    }
  }
  return maxDepth
}

// Generate UUID
export function generateDepartmentId(): string {
  return `dept_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}
