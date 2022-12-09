<template>
    <canvas class="webgl" />
    <canvas class="webgl2" :width="String(store.sizes.view)" height={String(store.sizes.view)} :style="getStyles()" />
    <MatcapLights />
</template>

<script lang="ts" setup>

import Editor from '@/Editor';
import { matcapEditorStore } from '@/stores/matcapEditorStore';
import { onMounted, computed } from 'vue';
import MatcapLights from './MatcapLights.vue';

const store = computed(() => matcapEditorStore());

onMounted(() => {
    new Editor();

});

function getStyles() {
    return `
        width: ${store.value.sizes.view}px!important;
        height: ${store.value.sizes.view}px!important;
    `;
}

</script>