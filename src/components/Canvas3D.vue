<template >
    <CanvasSnapshots />
    <canvas class="webgl" />
    <canvas class="webgl2"
        :width="String(store.sizes.view)"
        :height="String(store.sizes.view)"
        :style="getStyles()"
    />
    <MatcapLights />

    <PreviewProperties />

</template >

<script lang="ts" setup >

import Editor from '@/Editor';
import { matcapEditorStore } from '@/stores/matcapEditorStore';
import { onMounted, computed } from 'vue';
import MatcapLights from './MatcapLights.vue';
import CanvasSnapshots from './CanvasSnapshots.vue';
import PreviewProperties from './PreviewProperties.vue';

if (import.meta.hot) {
    import.meta.hot.dispose(() => {
        import.meta.hot?.invalidate();
    });
}

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

</script >