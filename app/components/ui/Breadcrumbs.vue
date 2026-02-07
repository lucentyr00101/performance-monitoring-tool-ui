<template>
  <nav v-if="breadcrumbs.length > 0" class="flex items-center text-sm text-gray-400 gap-1">
    <template v-for="(item, index) in breadcrumbs" :key="index">
      <UIcon v-if="index > 0" name="i-heroicons-chevron-right-20-solid" class="w-3 h-3 text-gray-600 flex-shrink-0" />
      <NuxtLink
        v-if="item.to"
        :to="item.to"
        class="hover:text-white transition-colors truncate max-w-[140px]"
      >
        {{ item.label }}
      </NuxtLink>
      <span v-else class="text-gray-300 truncate max-w-[200px]">{{ item.label }}</span>
    </template>
  </nav>
</template>

<script setup lang="ts">
const { breadcrumbs } = useBreadcrumbs()
</script>
