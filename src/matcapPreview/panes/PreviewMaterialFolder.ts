import type { FolderApi } from '@tweakpane/core';
import events from 'src/commons/Events';
import { PreviewStore, type IPreviewStore } from 'src/store';
import type { Pane } from 'tweakpane';

let store: IPreviewStore;
PreviewStore.subscribe((newStore) => {
    store = newStore;
});

const data: { pane: Pane; paneFolder: FolderApi } = {
    pane: null,
    paneFolder: null,
};

const generate = () => {
    data.paneFolder
        .addInput(store, 'power', {
            min: 0,
            max: 10,
            step: 0.01,
        })
        .on('change', () => {
            events.emit('object:power:update');
        });

    data.paneFolder
        .addInput(store, 'roughness', {
            min: 0,
            max: 1,
            step: 0.01,
        })
        .on('change', (event) => {
            store.metalness = 1 - event.value;
            events.emit('object:roughness:update');
            data.pane.refresh();
        });

    data.paneFolder
        .addInput(store, 'metalness', {
            min: 0,
            max: 1,
            step: 0.01,
        })
        .on('change', (event) => {
            store.roughness = 1 - event.value;
            events.emit('object:metalness:update');
            data.pane.refresh();
        });
};

const PreviewMaterialPaneFolder = {
    initialize(pane: Pane) {
        data.pane = pane;
        data.paneFolder = data.pane.addFolder({
            title: 'Material',
            expanded: true,
        });
        generate();
    },
};

export default PreviewMaterialPaneFolder;
