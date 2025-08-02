<template >
    <div class="matcap-editor-pane"
        :style="getStyles()" 
    />
</template >

<script lang="ts" setup >

import { computed, onMounted } from 'vue';
import { Pane } from 'tweakpane';

import { matcapEditorStore } from '@/stores/matcapEditorStore';
import events from '@/legacy/commons/Events';

import SpherePaneFolder from '@/legacy/matcapEditor/panes/SpherePaneFolder';
import CreatePaneFolder from '@/legacy/matcapEditor/panes/CreatePaneFolder';
import LightPaneFolder from '@/legacy/matcapEditor/panes/LightPaneFolder';
import ImportExportMatcapPaneFolder from '@/legacy/matcapEditor/panes/ImportExportMatcapPaneFolder';

const store = computed(() => matcapEditorStore());
let pane: Pane;

function getStyles() {
    return `
        width: ${store.value.sizes.view}px!important;
        height: ${store.value.sizes.view}px!important;
    `;
}

events.on('matcap:editor:ready', () => {
    CreatePaneFolder.initialize(pane);

    pane.addBinding(store.value.create, 'front', {
        label: 'front/back',
    });
    pane.addButton({
        title: 'generate',
    }).on('click', () => {
        events.emit('matcap:generate', { exported: true });
    });

    ImportExportMatcapPaneFolder.initialize(pane);

    SpherePaneFolder.initialize(pane);

    LightPaneFolder.initialize(pane);
    
});

onMounted(() => {
    pane = new Pane({
        container: document.querySelector('.matcap-editor-pane') as HTMLElement,
    });
    
});

</script >