import type { FolderApi } from '@tweakpane/core';
import events from '@/commons/Events';
import type { Pane } from 'tweakpane';
import { computed } from 'vue';
import { matcapEditorStore } from '@/stores/matcapEditorStore';

const store = computed(() => matcapEditorStore());

let _pane: Pane;
let _paneFolder: FolderApi;

const generate = () => {
    const sizes = store.value.sizes.exportRatios.map(
        (value) => value * store.value.sizes.exportDefault,
    );
    const sizesCtrl: { value: number; oldValue: number; history: boolean } = {
        value: store.value.sizes.exportDefault,
        oldValue: store.value.sizes.exportDefault,
        history: true,
    };

    _paneFolder
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
            store.value.sizes.exportRatio = event.value / store.value.sizes.exportDefault;
        });

    _paneFolder.addButton({ title: 'Export' }).on('click', () => {
        events.emit('matcap:export:png', { exported: true });
    });
};

const ExportMatcapPaneFolder = {
    initialize(pane: Pane) {
        _pane = pane;
        _paneFolder = _pane.addFolder({
            title: 'Export',
            expanded: false,
        });
        generate();
    },
};

export default ExportMatcapPaneFolder;
