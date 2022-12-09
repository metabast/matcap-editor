import type { FolderApi } from '@tweakpane/core';
import events from 'src/commons/Events';
import { MatcapEditorStore, type IMatcapEditorStore } from 'src/store';
import type { Pane } from 'tweakpane';

let store: IMatcapEditorStore;
MatcapEditorStore.subscribe((newStore) => {
    store = newStore;
});

const data: { pane: Pane; paneFolder: FolderApi } = {
    pane: null,
    paneFolder: null,
};

const generate = () => {
    const sizes = store.sizes.exportRatios.map(
        (value) => value * store.sizes.exportDefault,
    );
    const sizesCtrl: { value: number; oldValue: number; history: boolean } = {
        value: store.sizes.exportDefault,
        oldValue: store.sizes.exportDefault,
        history: true,
    };

    data.paneFolder
        .addInput(sizesCtrl, 'value', {
            label: 'Size',
            options: {
                '128': 128,
                '256': 256,
                '512': 512,
                '1024': 1024,
            },
        })
        .on('change', (event) => {
            store.sizes.exportRatio = event.value / store.sizes.exportDefault;
        });

    data.paneFolder.addButton({ title: 'Export' }).on('click', () => {
        events.emit('matcap:export:png', { exported: true });
    });
};

const ExportMatcapPaneFolder = {
    initialize(pane: Pane) {
        data.pane = pane;
        data.paneFolder = data.pane.addFolder({
            title: 'Export',
            expanded: false,
        });
        generate();
    },
};

export default ExportMatcapPaneFolder;
