<template>
    <CanvasSnapshots />
    <canvas class="webgl" @dragover.prevent="dragNdropIsVisible = true" @dragleave.prevent="dragNdropIsVisible = false"
        @drop.prevent="onDrop" />
    <DragAndDropHelperVue :is-visible-over="dragNdropIsVisible" />
    <canvas class="webgl2" :width="String(store.sizes.view)" :height="String(store.sizes.view)" :style="getStyles()" />
    <MatcapLights />

    <PreviewProperties />

</template>

<script lang="ts" setup>

import Editor from '@/legacy/Editor';
import { matcapEditorStore } from '@/stores/matcapEditorStore';
import { onMounted, computed, ref } from 'vue';
import DragAndDropHelperVue from '@/legacy/components/DragAndDropHelper.vue';
import MatcapLights from '@/legacy/components/MatcapLights.vue';
import CanvasSnapshots from '@/legacy/components/CanvasSnapshots.vue';
import PreviewProperties from '@/legacy/components/PreviewProperties.vue';
import DroppedFileManager from '@/legacy/commons/DroppedFileManager';

const store = computed(() => matcapEditorStore());
const dragNdropIsVisible = ref(false);
onMounted(async () => {
    Editor.instance.contextIsReady();
});

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