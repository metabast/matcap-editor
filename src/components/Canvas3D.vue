<template >
    <CanvasSnapshots />
    <canvas class="webgl" 
        @dragover.prevent=""
        @drop.prevent="DroppedFileManager.onDrop" 
    />
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
import { ref } from 'vue';
import DroppedFileManager from '@/commons/DroppedFileManager';

if (import.meta.hot) {
    import.meta.hot.dispose(() => {
        import.meta.hot?.invalidate();
    });
}

const store = computed(() => matcapEditorStore());
const canvas_preview = ref(null);
let editor: Editor;

onMounted(async () => {
    editor = new Editor();
});

function getStyles() {
    return `
        width: ${store.value.sizes.view}px!important;
        height: ${store.value.sizes.view}px!important;
    `;
}

async function onDrop(event: DragEvent) {
    const file = event.dataTransfer?.files[0];
    console.log(file);
    
    // const fileContent = await promiseReader(file);
    // console.log(fileContent);
    // const blob = new Blob([fileContent], { type: 'image/png' });
    // const url = URL.createObjectURL(blob);
    // const image = new Image();
    // image.src = url;
    // image.onload = () => {
    //     matcapEditorStore().setMatcap(image);
    // };
    
}



</script >