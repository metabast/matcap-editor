<script lang="ts" setup>
import { computed } from 'vue';
import Canvas3D from '@/components/Canvas3D.vue';
import MigrationDebugPanel from '@/components/MigrationDebugPanel.vue';

const isDevelopment = computed(() => import.meta.env.DEV);
</script>

<template>
  <Canvas3D />

  <!-- Panneau de debug de la migration (développement uniquement) -->
  <MigrationDebugPanel v-if="isDevelopment" />
</template>

<style scoped></style>

<style scoped></style>
