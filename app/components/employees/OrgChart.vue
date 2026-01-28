<script setup lang="ts">
import { VueFlow, Position, useVueFlow } from '@vue-flow/core'
import { Controls } from '@vue-flow/controls'
import { MiniMap } from '@vue-flow/minimap'
import type { Node, Edge } from '@vue-flow/core'
import type { DepartmentHierarchyNode } from '~/types/department'

interface OrgEmployee {
  id: string
  name: string
  jobTitle?: string
  avatarUrl?: string
  managerId?: string
  directReportsCount?: number
  department?: string
}

interface Props {
  employees: OrgEmployee[]
  hierarchy?: DepartmentHierarchyNode[]
  isLoading?: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  nodeClick: [id: string]
  export: []
}>()

const router = useRouter()

// Search
const searchQuery = ref('')
const highlightedNodeId = ref<string | null>(null)

// Vue Flow instance
const { fitView, zoomIn, zoomOut, setCenter } = useVueFlow()

// Generate nodes and edges from employees
const nodes = computed<Node[]>(() => {
  if (!props.employees?.length) return []
  
  // Group by level (manager hierarchy)
  const levels = new Map<number, OrgEmployee[]>()
  const nodePositions = new Map<string, { level: number; index: number }>()
  
  // Find root (no manager or manager not in list)
  const employeeIds = new Set(props.employees.map(e => e.id))
  const roots = props.employees.filter(e => !e.managerId || !employeeIds.has(e.managerId))
  
  // BFS to assign levels
  const queue: Array<{ employee: OrgEmployee; level: number }> = roots.map(e => ({ employee: e, level: 0 }))
  const visited = new Set<string>()
  
  while (queue.length > 0) {
    const { employee, level } = queue.shift()!
    if (visited.has(employee.id)) continue
    visited.add(employee.id)
    
    if (!levels.has(level)) levels.set(level, [])
    levels.get(level)!.push(employee)
    
    // Find direct reports
    const reports = props.employees.filter(e => e.managerId === employee.id)
    reports.forEach(r => {
      if (!visited.has(r.id)) {
        queue.push({ employee: r, level: level + 1 })
      }
    })
  }
  
  // Calculate positions
  const nodeSpacingX = 250
  const nodeSpacingY = 150
  
  const result: Node[] = []
  
  levels.forEach((employees, level) => {
    const totalWidth = (employees.length - 1) * nodeSpacingX
    const startX = -totalWidth / 2
    
    employees.forEach((employee, index) => {
      result.push({
        id: employee.id,
        type: 'orgNode',
        position: {
          x: startX + index * nodeSpacingX,
          y: level * nodeSpacingY
        },
        data: {
          id: employee.id,
          name: employee.name,
          jobTitle: employee.jobTitle,
          avatarUrl: employee.avatarUrl,
          employeeCount: employee.directReportsCount,
          isHighlighted: highlightedNodeId.value === employee.id
        },
        sourcePosition: Position.Bottom,
        targetPosition: Position.Top
      })
      
      nodePositions.set(employee.id, { level, index })
    })
  })
  
  return result
})

// Generate edges from manager relationships
const edges = computed<Edge[]>(() => {
  if (!props.employees?.length) return []
  
  const employeeIds = new Set(props.employees.map(e => e.id))
  
  return props.employees
    .filter(e => e.managerId && employeeIds.has(e.managerId))
    .map(e => ({
      id: `e-${e.managerId}-${e.id}`,
      source: e.managerId!,
      target: e.id,
      type: 'smoothstep',
      animated: false,
      style: { stroke: '#4b5563', strokeWidth: 2 }
    }))
})

// Search functionality
const searchResults = computed(() => {
  if (!searchQuery.value.trim()) return []
  
  const query = searchQuery.value.toLowerCase()
  return props.employees.filter(e => 
    e.name.toLowerCase().includes(query) ||
    e.jobTitle?.toLowerCase().includes(query)
  )
})

function handleSearch() {
  if (searchResults.value.length > 0) {
    const employee = searchResults.value[0]
    if (employee) {
      highlightedNodeId.value = employee.id
      
      // Find node and center on it
      const node = nodes.value.find(n => n.id === employee.id)
      if (node) {
        setCenter(node.position.x + 100, node.position.y + 50, { zoom: 1.5, duration: 500 })
      }
    }
  }
}

function clearSearch() {
  searchQuery.value = ''
  highlightedNodeId.value = null
}

// Handle node click
function handleNodeClick(id: string) {
  router.push(`/employees/${id}`)
  emit('nodeClick', id)
}

// Zoom controls
function handleZoomIn() {
  zoomIn({ duration: 300 })
}

function handleZoomOut() {
  zoomOut({ duration: 300 })
}

function handleFitView() {
  fitView({ padding: 0.2, duration: 500 })
}

// Initial fit view
onMounted(() => {
  setTimeout(() => {
    fitView({ padding: 0.2 })
  }, 100)
})
</script>

<template>
  <div class="org-chart-container">
    <!-- Toolbar -->
    <div class="flex items-center justify-between gap-4 mb-4">
      <!-- Search -->
      <div class="flex-1 max-w-md relative">
        <UInput
          v-model="searchQuery"
          placeholder="Search employees..."
          icon="i-heroicons-magnifying-glass"
          @keyup.enter="handleSearch"
        />
        <button
          v-if="searchQuery"
          class="absolute right-10 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
          @click="clearSearch"
        >
          <UIcon name="i-heroicons-x-mark" class="w-4 h-4" />
        </button>
        <UButton
          variant="ghost"
          color="primary"
          size="sm"
          class="absolute right-1 top-1/2 -translate-y-1/2"
          @click="handleSearch"
        >
          Go
        </UButton>
        
        <!-- Search Results Dropdown -->
        <div
          v-if="searchQuery && searchResults.length > 0"
          class="absolute top-full left-0 right-0 mt-1 bg-gray-900 border border-gray-700 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto"
        >
          <button
            v-for="result in searchResults.slice(0, 5)"
            :key="result.id"
            class="w-full px-4 py-2 text-left hover:bg-gray-800 transition-colors flex items-center gap-3"
            @click="handleNodeClick(result.id); clearSearch()"
          >
            <UAvatar :alt="result.name" size="xs" />
            <div>
              <p class="text-sm text-white">{{ result.name }}</p>
              <p class="text-xs text-gray-400">{{ result.jobTitle }}</p>
            </div>
          </button>
        </div>
      </div>
      
      <!-- Zoom Controls -->
      <div class="flex items-center gap-2">
        <UButton variant="outline" color="neutral" size="sm" @click="handleZoomOut">
          <UIcon name="i-heroicons-minus" class="w-4 h-4" />
        </UButton>
        <UButton variant="outline" color="neutral" size="sm" @click="handleFitView">
          <UIcon name="i-heroicons-arrows-pointing-out" class="w-4 h-4" />
        </UButton>
        <UButton variant="outline" color="neutral" size="sm" @click="handleZoomIn">
          <UIcon name="i-heroicons-plus" class="w-4 h-4" />
        </UButton>
        <UButton
          variant="outline"
          color="neutral"
          size="sm"
          @click="emit('export')"
        >
          <UIcon name="i-heroicons-arrow-down-tray" class="w-4 h-4 mr-1" />
          Export
        </UButton>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="h-[600px] bg-gray-900 border border-gray-800 rounded-lg flex items-center justify-center">
      <div class="text-center">
        <div class="w-12 h-12 border-4 border-gray-700 border-t-primary-500 rounded-full animate-spin mx-auto mb-4" />
        <p class="text-gray-400">Loading organization chart...</p>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="!employees || employees.length === 0" class="h-[600px] bg-gray-900 border border-gray-800 rounded-lg flex items-center justify-center">
      <div class="text-center">
        <UIcon name="i-heroicons-rectangle-group" class="w-16 h-16 text-gray-700 mx-auto mb-4" />
        <h3 class="text-lg font-medium text-white mb-2">No employees found</h3>
        <p class="text-gray-500">Add employees to see the organization chart.</p>
      </div>
    </div>

    <!-- Chart -->
    <div v-else class="h-[600px] bg-gray-950 border border-gray-800 rounded-lg overflow-hidden">
      <VueFlow
        :nodes="nodes"
        :edges="edges"
        :default-zoom="0.8"
        :min-zoom="0.2"
        :max-zoom="2"
        fit-view-on-init
        class="org-flow"
      >
        <!-- Custom Node -->
        <template #node-orgNode="{ data }">
          <EmployeesOrgChartNode
            v-bind="data"
            @click="handleNodeClick(data.id)"
          />
        </template>

        <!-- Controls -->
        <Controls position="bottom-left" />

        <!-- Minimap -->
        <MiniMap
          position="bottom-right"
          :node-color="() => '#374151'"
          :mask-color="'rgba(0, 0, 0, 0.5)'"
        />
      </VueFlow>
    </div>

    <!-- Legend -->
    <div class="flex items-center gap-6 mt-4 text-sm text-gray-400">
      <div class="flex items-center gap-2">
        <UIcon name="i-heroicons-arrows-pointing-out" class="w-4 h-4" />
        <span>Scroll to zoom, drag to pan</span>
      </div>
      <div class="flex items-center gap-2">
        <UIcon name="i-heroicons-cursor-arrow-rays" class="w-4 h-4" />
        <span>Click node to view profile</span>
      </div>
    </div>
  </div>
</template>

<style>
/* Vue Flow base styles */
@import '@vue-flow/core/dist/style.css';
@import '@vue-flow/core/dist/theme-default.css';
@import '@vue-flow/controls/dist/style.css';
@import '@vue-flow/minimap/dist/style.css';

.org-flow {
  background: #030712;
}

.org-flow .vue-flow__edge-path {
  stroke: #4b5563;
  stroke-width: 2;
}

.org-flow .vue-flow__controls {
  background: #1f2937;
  border: 1px solid #374151;
  border-radius: 8px;
}

.org-flow .vue-flow__controls-button {
  background: transparent;
  color: #9ca3af;
  border: none;
}

.org-flow .vue-flow__controls-button:hover {
  background: #374151;
  color: white;
}

.org-flow .vue-flow__minimap {
  background: #111827;
  border: 1px solid #374151;
  border-radius: 8px;
}
</style>
