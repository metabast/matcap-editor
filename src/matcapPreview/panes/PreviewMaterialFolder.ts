import type { FolderApi } from '@tweakpane/core';
import events from '@/commons/Events';
import type { Pane } from 'tweakpane';
import { computed } from 'vue';
import { matcapPreviewStore } from '@/stores/matcapPreviewStore';

const store = computed(() => matcapPreviewStore());

if (import.meta.hot) {
    import.meta.hot.dispose(() => {
        import.meta.hot?.invalidate();
    });
}

let _pane: Pane;
let _paneFolder: FolderApi;

const generate = () => {
    _paneFolder
        .addInput(store.value, 'power', {
            min: 0,
            max: 10,
            step: 0.01,
        })
        .on('change', () => {
            events.emit('object:power:update');
        });

    _paneFolder
        .addInput(store.value, 'roughness', {
            min: 0,
            max: 1,
            step: 0.01,
        })
        .on('change', (event) => {
            store.value.metalness = 1 - event.value;
            events.emit('object:roughness:update');
            _pane.refresh();
        });

    _paneFolder
        .addInput(store.value, 'metalness', {
            min: 0,
            max: 1,
            step: 0.01,
        })
        .on('change', (event) => {
            store.value.roughness = 1 - event.value;
            events.emit('object:metalness:update');
            _pane.refresh();
        });
};

const PreviewMaterialPaneFolder = {
    initialize(pane: Pane) {
        _pane = pane;
        _paneFolder = _pane.addFolder({
            title: 'Material',
            expanded: true,
        });
        generate();
    },
};

export default PreviewMaterialPaneFolder;
