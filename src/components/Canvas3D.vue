<template>
    <CanvasSnapshots />
    <canvas
        class="webgl"
        @dragover.prevent="dragNdropIsVisible = true"
        @dragleave.prevent="dragNdropIsVisible = false"
        @drop.prevent="onDrop"
    />
    <DragAndDropHelperVue :is-visible-over="dragNdropIsVisible" />
    <canvas class="webgl2" :width="String(store.sizes.view)" :height="String(store.sizes.view)" :style="getStyles()" />
    <MatcapLights />

    <PreviewProperties />
</template>

<script lang="ts" setup>
import { matcapEditorStore } from '@/stores/matcapEditorStore';
import { computed, ref } from 'vue';
import DragAndDropHelperVue from '@/components/DragAndDropHelper.vue';
import MatcapLights from './MatcapLights.vue';
import CanvasSnapshots from './CanvasSnapshots.vue';
import PreviewProperties from './PreviewProperties.vue';
import DroppedFileManager from '@/commons/DroppedFileManager';

const store = computed(() => matcapEditorStore());
const dragNdropIsVisible = ref(false);
function onDrop(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    DroppedFileManager.onDrop(e);
    dragNdropIsVisible.value = false;
}

function getStyles() {
    return `
        width: ${store.value.sizes.view}px!important;
        height: ${store.value.sizes.view}px!important;
    `;
}
</script>
