import type { FolderApi, TabApi } from '@tweakpane/core';
import events from '@/commons/Events';
import type { Pane } from 'tweakpane';
import { computed } from 'vue';
import { matcapEditorStore } from '@/stores/matcapEditorStore';

const store = computed(() => matcapEditorStore());

let _pane: Pane;
let _paneFolder: FolderApi;
let _tab: TabApi;

const generate = () => {
    const sizesCtrl: { value: number; oldValue: number; history: boolean } = {
        value: store.value.sizes.exportDefault,
        oldValue: store.value.sizes.exportDefault,
        history: true,
    };

    _tab = _paneFolder.addTab({
        pages: [
            {
                title: 'Matcap Grid',
            },
            {
                title: 'Project',
            },
            {
                title: 'Object',
            },
        ],
    });

    _tab.pages[0]
        .addBinding(sizesCtrl, 'value', {
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

    _tab.pages[0].addButton({ title: 'Export' }).on('click', () => {
        events.emit('matcap:export:png', { exported: true });
    });

    _tab.pages[0].addButton({ title: 'Export grid' }).on('click', () => {
        events.emit('matcap:export:grid:png', { exported: true });
    });

    _tab.pages[1].addButton({ title: 'Import project' }).on('click', () => {
        events.emit('show:dragNdrop', { msg: 'project file: *.json' });
    });

    _tab.pages[1].addButton({ title: 'Export project' }).on('click', () => {
        events.emit('matcap:export:project');
    });

    _tab.pages[2].addButton({ title: 'Import GLB file' }).on('click', () => {
        events.emit('show:dragNdrop', { msg: 'object file: *.glb' });
    });
};

const ImportExportMatcapPaneFolder = {
    initialize(pane: Pane) {
        _pane = pane;
        _paneFolder = _pane.addFolder({
            title: 'Import/Export',
            expanded: false,
        });
        generate();
    },
};

export default ImportExportMatcapPaneFolder;
