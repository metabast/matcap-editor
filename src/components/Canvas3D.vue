<script lang="ts" setup>
import MatcapLights from './MatcapLights.vue';
import CanvasSnapshots from './CanvasSnapshots.vue';
import PreviewProperties from './PreviewProperties.vue';
import DragAndDropHelperVue from '@/components/DragAndDropHelper.vue';
import { matcapEditorStore } from '@/stores/matcapEditorStore';
import Editor from '@/Editor';
import DroppedFileManager from '@/commons/DroppedFileManager';
import { onMounted, computed, ref } from 'vue';

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
