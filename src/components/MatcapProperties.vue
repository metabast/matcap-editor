<template >
    <div class="matcap-editor-pane"
        :style="getStyles()" 
    />
</template >

<script lang="ts" setup >

import { computed, onMounted } from 'vue';
import { Pane } from 'tweakpane';

import { matcapEditorStore } from '@/stores/matcapEditorStore';
import events from '@/commons/Events';

import SpherePaneFolder from '@/matcapEditor/panes/SpherePaneFolder';
import CreatePaneFolder from '@/matcapEditor/panes/CreatePaneFolder';
import LightPaneFolder from '@/matcapEditor/panes/LightPaneFolder';
import ExportMatcapPaneFolder from '@/matcapEditor/panes/ExportMatcapPaneFolder';

if (import.meta.hot) {
    import.meta.hot.dispose(() => {
        import.meta.hot?.invalidate();
    });
}

const store = computed(() => matcapEditorStore());
let pane: Pane;

function getStyles() {
    return `
        width: ${store.value.sizes.view}px!important;
        height: ${store.value.sizes.view}px!important;
    `;
}

onMounted(() => {
    pane = new Pane({
        container: document.querySelector('.matcap-editor-pane') as HTMLElement,
    });

    CreatePaneFolder.initialize(pane);

    pane.addInput(store.value.create, 'front', {
        label: 'front/back',
    });
    pane.addButton({
        title: 'generate',
    }).on('click', () => {
        events.emit('matcap:generate', { exported: true });
    });

    ExportMatcapPaneFolder.initialize(pane);

    SpherePaneFolder.initialize(pane);

    LightPaneFolder.initialize(pane);
});

</script >