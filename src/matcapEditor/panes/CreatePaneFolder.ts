import type { FolderApi } from '@tweakpane/core';
import { MatcapEditorStore, type IMatcapEditorStore } from 'src/store';
import type { Pane } from 'tweakpane';

const data: { pane: Pane; paneFolder: FolderApi } = {
    pane: null,
    paneFolder: null,
};

let store: IMatcapEditorStore;
MatcapEditorStore.subscribe((newStore) => {
    store = newStore;
});

enum LightType {
    Area = 'Area',
    Point = 'Point',
    Spot = 'Spot',
}

const generate = () => {
    data.paneFolder
        .addInput(store.create, 'lightType', {
            label: 'Size',
            options: LightType,
        })
        .on('change', (event) => {
            store.create.lightType = event.value;
        });

    data.paneFolder.addInput(store.create, 'distance', {
        min: 0,
        max: 10,
        step: 0.01,
    });
    data.paneFolder.addInput(store.create, 'intensity', {
        min: 0,
        max: 10,
        step: 0.01,
    });

    data.paneFolder.addButton({ title: 'reset' }).on('click', () => {
        store.create.lightType = LightType.Area;
        store.create.distance = 1;
        store.create.intensity = 1;
        data.pane.refresh();
    });
};

const CreatePaneFolder = {
    initialize(pane: Pane) {
        data.pane = pane;
        data.paneFolder = data.pane.addFolder({
            title: 'Create',
            expanded: true,
        });
        generate();
    },
};

export default CreatePaneFolder;
