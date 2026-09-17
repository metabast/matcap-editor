<template>
    <div class="matcap-editor-pane" :style="getStyles()" />
</template>

<script lang="ts" setup>
import { computed, onMounted } from 'vue';
import { Pane } from 'tweakpane';

import { matcapEditorStore } from '@/stores/matcapEditorStore';
import events from '@/commons/Events';
import { refreshPane } from '@/commons/PaneRefresh';

import SpherePaneFolder from '@/matcapEditor/panes/SpherePaneFolder';
import CreatePaneFolder from '@/matcapEditor/panes/CreatePaneFolder';
import LightPaneFolder from '@/matcapEditor/panes/LightPaneFolder';
import ImportExportMatcapPaneFolder from '@/matcapEditor/panes/ImportExportMatcapPaneFolder';
import type Editor from '@/Editor';

const store = computed(() => matcapEditorStore());
let pane: Pane;

function getStyles() {
    return `
        width: ${store.value.sizes.view}px!important;
        height: ${store.value.sizes.view}px!important;
    `;
}

// Commands change the store; the pane has to be told to re-read it.
events.on('matcap:ui:pane:refresh', () => {
    if (pane) refreshPane(pane);
});

events.on('matcap:editor:ready', (editor: Editor) => {
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

    SpherePaneFolder.initialize(pane, editor);

    LightPaneFolder.initialize(pane, editor);
});

onMounted(() => {
    pane = new Pane({
        container: document.querySelector('.matcap-editor-pane') as HTMLElement,
    });
});
</script>
