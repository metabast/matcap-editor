import { computed } from 'vue';
import type { Pane } from 'tweakpane';
import type { FolderApi } from '@tweakpane/core';
import { matcapEditorStore } from '@/stores/matcapEditorStore';

const store = computed(() => matcapEditorStore());

enum LightType {
    Area = 'Area',
    Point = 'Point',
    Spot = 'Spot',
}

let _pane: Pane;
let _paneFolder: FolderApi;

const generate = () => {
    _paneFolder
        .addInput(store.value.create, 'lightType', {
            label: 'Size',
            options: LightType,
        })
        .on('change', (event) => {
            store.value.create.lightType = event.value;
        });

    _paneFolder.addInput(store.value.create, 'distance', {
        min: 0,
        max: 10,
        step: 0.01,
    });
    _paneFolder.addInput(store.value.create, 'intensity', {
        min: 0,
        max: 10,
        step: 0.01,
    });

    _paneFolder.addButton({ title: 'reset' }).on('click', () => {
        store.value.create.lightType = LightType.Area;
        store.value.create.distance = 1;
        store.value.create.intensity = 1;
        _pane.refresh();
    });
};

const CreatePaneFolder = {
    initialize(pane: Pane) {
        _pane = pane;
        _paneFolder = _pane.addFolder({
            title: 'Create',
            expanded: true,
        });
        generate();
    },
};

export default CreatePaneFolder;
