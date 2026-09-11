<script lang="ts" setup>
import PreviewMaterialPaneFolder from '@/matcapPreview/panes/PreviewMaterialFolder';
import { matcapPreviewStore } from '@/stores/matcapPreviewStore';
import { computed, onMounted } from 'vue';
import { Pane } from 'tweakpane';

const store = computed(() => matcapPreviewStore());

let pane: Pane;
onMounted(() => {
    pane = new Pane({
        container: document.querySelector('.matcap-preview-pane') as HTMLElement,
        title: 'Preview',
    });

    PreviewMaterialPaneFolder.initialize(pane);

    pane.addBinding(store.value, 'showGrid').on('change', () => {});
});
</script>

<template>
    <div class="matcap-preview-pane" />
</template>
