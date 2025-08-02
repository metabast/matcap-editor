<template >
    <div class="matcap-preview-pane" />
</template >

<script lang="ts" setup >

import { computed, onMounted } from 'vue';
import { Pane } from 'tweakpane';
import PreviewMaterialPaneFolder from '@/legacy/matcapPreview/panes/PreviewMaterialFolder';
import { matcapPreviewStore } from '@/stores/matcapPreviewStore';

const store = computed(() => matcapPreviewStore());

let pane: Pane;
onMounted(() => {
    pane = new Pane({
        container: document.querySelector('.matcap-preview-pane') as HTMLElement,
        title: 'Preview',
    });

    PreviewMaterialPaneFolder.initialize(pane);

    pane.addBinding(store.value, 'showGrid').on('change', () => {
    });
});

</script >