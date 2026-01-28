<script setup lang="ts">
import type { DepartmentHierarchy } from '~/types/department'

interface Props {
  hierarchy: DepartmentHierarchy[]
  isLoading?: boolean
  expandedIds?: Set<string>
}

const props = withDefaults(defineProps<Props>(), {
  expandedIds: () => new Set()
})

const emit = defineEmits<{
  select: [department: DepartmentHierarchy]
  toggleExpand: [id: string]
}>()

// Local expanded state
const localExpanded = ref(new Set(props.expandedIds))

function toggleExpand(id: string) {
  if (localExpanded.value.has(id)) {
    localExpanded.value.delete(id)
  } else {
    localExpanded.value.add(id)
  }
  emit('toggleExpand', id)
}

function isExpanded(id: string): boolean {
  return localExpanded.value.has(id)
}

// Recursive component for tree nodes
</script>

<template>
  <div class="space-y-2">
    <!-- Loading -->
    <div v-if="isLoading" class="space-y-3">
      <div v-for="i in 5" :key="i" class="animate-pulse">
        <div class="flex items-center gap-3 p-3 bg-gray-900 border border-gray-800 rounded-lg">
          <div class="w-5 h-5 bg-gray-800 rounded" />
          <div class="h-4 w-32 bg-gray-800 rounded" />
          <div class="h-4 w-16 bg-gray-800 rounded ml-auto" />
        </div>
      </div>
    </div>

    <!-- Empty -->
    <div v-else-if="hierarchy.length === 0" class="text-center py-8 bg-gray-900 border border-gray-800 rounded-lg">
      <UIcon name="i-heroicons-rectangle-group" class="w-12 h-12 text-gray-700 mx-auto mb-3" />
      <p class="text-gray-500">No hierarchy data available</p>
    </div>

    <!-- Hierarchy Tree -->
    <div v-else class="bg-gray-900 border border-gray-800 rounded-lg p-4">
      <template v-for="dept in hierarchy" :key="dept.id">
        <div class="department-node">
          <!-- Department Row -->
          <div
            class="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-800/50 cursor-pointer transition-colors"
            @click="emit('select', dept)"
          >
            <!-- Expand/Collapse -->
            <button
              v-if="dept.children && dept.children.length > 0"
              class="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-white"
              @click.stop="toggleExpand(dept.id)"
            >
              <UIcon
                :name="isExpanded(dept.id) ? 'i-heroicons-chevron-down' : 'i-heroicons-chevron-right'"
                class="w-4 h-4"
              />
            </button>
            <div v-else class="w-6" />

            <!-- Department Icon -->
            <div class="w-8 h-8 bg-primary-500/10 rounded-lg flex items-center justify-center">
              <UIcon name="i-heroicons-building-office-2" class="w-4 h-4 text-primary-400" />
            </div>

            <!-- Department Info -->
            <div class="flex-1 min-w-0">
              <p class="font-medium text-white truncate">{{ dept.name }}</p>
              <p v-if="dept.manager" class="text-xs text-gray-500">
                {{ dept.manager.first_name }} {{ dept.manager.last_name }}
              </p>
            </div>

            <!-- Employee Count -->
            <div class="flex items-center gap-1 text-sm text-gray-400">
              <UIcon name="i-heroicons-users" class="w-4 h-4" />
              <span>{{ dept.employee_count || 0 }}</span>
            </div>
          </div>

          <!-- Children (nested) -->
          <div
            v-if="dept.children && dept.children.length > 0 && isExpanded(dept.id)"
            class="ml-8 mt-1 pl-4 border-l border-gray-800"
          >
            <template v-for="child in dept.children" :key="child.id">
              <div class="department-node">
                <div
                  class="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-800/50 cursor-pointer transition-colors"
                  @click="emit('select', child)"
                >
                  <button
                    v-if="child.children && child.children.length > 0"
                    class="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-white"
                    @click.stop="toggleExpand(child.id)"
                  >
                    <UIcon
                      :name="isExpanded(child.id) ? 'i-heroicons-chevron-down' : 'i-heroicons-chevron-right'"
                      class="w-4 h-4"
                    />
                  </button>
                  <div v-else class="w-6" />

                  <div class="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center">
                    <UIcon name="i-heroicons-building-office" class="w-4 h-4 text-gray-400" />
                  </div>

                  <div class="flex-1 min-w-0">
                    <p class="font-medium text-white truncate">{{ child.name }}</p>
                    <p v-if="child.manager" class="text-xs text-gray-500">
                      {{ child.manager.first_name }} {{ child.manager.last_name }}
                    </p>
                  </div>

                  <div class="flex items-center gap-1 text-sm text-gray-400">
                    <UIcon name="i-heroicons-users" class="w-4 h-4" />
                    <span>{{ child.employee_count || 0 }}</span>
                  </div>
                </div>

                <!-- Third level children -->
                <div
                  v-if="child.children && child.children.length > 0 && isExpanded(child.id)"
                  class="ml-8 mt-1 pl-4 border-l border-gray-800"
                >
                  <div
                    v-for="grandchild in child.children"
                    :key="grandchild.id"
                    class="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-800/50 cursor-pointer transition-colors"
                    @click="emit('select', grandchild)"
                  >
                    <div class="w-6" />
                    <div class="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center">
                      <UIcon name="i-heroicons-squares-2x2" class="w-4 h-4 text-gray-500" />
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="font-medium text-gray-300 truncate">{{ grandchild.name }}</p>
                    </div>
                    <div class="flex items-center gap-1 text-sm text-gray-500">
                      <UIcon name="i-heroicons-users" class="w-4 h-4" />
                      <span>{{ grandchild.employee_count || 0 }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </template>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>
