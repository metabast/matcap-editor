<template >
    <div class="matcap-preview-pane" />
</template >

<script lang="ts" setup >

import { computed, onMounted } from 'vue';
import { Pane } from 'tweakpane';
import PreviewMaterialPaneFolder from '@/matcapPreview/panes/PreviewMaterialFolder';
import { matcapPreviewStore } from '@/stores/matcapPreviewStore';

if (import.meta.hot) {
    import.meta.hot.dispose(() => {
        import.meta.hot?.invalidate();
    });
}

const store = computed(() => matcapPreviewStore());

let pane: Pane;
onMounted(() => {
    pane = new Pane({
        container: document.querySelector('.matcap-preview-pane') as HTMLElement,
        title: 'Preview',
    });

    PreviewMaterialPaneFolder.initialize(pane);

    pane.addInput(store.value, 'showGrid').on('change', () => {
    });
});

</script >