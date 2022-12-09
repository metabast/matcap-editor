<template>
    <canvas class="snapshots" width="768" height="768" :style="`z-index: ${store.showGrid ? '1' : '-1'};`" />
</template>

<script lang="ts" setup>
import { matcapPreviewStore } from '@/stores/matcapPreviewStore';
import { computed } from 'vue';



const store = computed(() => matcapPreviewStore());

</script>