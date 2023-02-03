import type { FolderApi } from '@tweakpane/core';
import events from '@/commons/Events';
import type { Pane } from 'tweakpane';
import { computed } from 'vue';
import { matcapPreviewStore } from '@/stores/matcapPreviewStore';
import type { ValuesPaneCtrl } from '@/ts/types/PanesTypes';
import type MatcapPreviewContent from '../MatcapPreviewContent';
import { SetPreviewRoughnessCommand } from '@/commands/SetPreviewRoughnessCommand';
import { SetPreviewMetalnessCommand } from '@/commands/SetPreviewMetalnessCommand';

const store = computed(() => matcapPreviewStore());

if (import.meta.hot) {
    import.meta.hot.dispose(() => {
        import.meta.hot?.invalidate();
    });
}

let _content: MatcapPreviewContent;
let _pane: Pane;
let _paneFolder: FolderApi;

let roughnessCtrl: ValuesPaneCtrl;
let metalnessCtrl: ValuesPaneCtrl;

events.on('matcap:preview:mesh:selected', (mesh) => {
    // _paneFolder?.children.forEach((child) => {
    //     child.dispose();
    // });
    // generate(_content);
    if (!mesh) return;
    roughnessCtrl.value = Number(mesh.material.roughness);
    roughnessCtrl.oldValue = Number(mesh.material.roughness);
    metalnessCtrl.value = Number(mesh.material.metalness);
    metalnessCtrl.oldValue = Number(mesh.material.metalness);
    roughnessCtrl.history = false;
    metalnessCtrl.history = false;
    _pane.refresh();
    roughnessCtrl.history = true;
    metalnessCtrl.history = true;
});

const generate = (content: MatcapPreviewContent) => {
    _content = content;

    roughnessCtrl = {
        value: Number(store.value.roughness),
        oldValue: Number(store.value.roughness),
        history: true,
    };

    metalnessCtrl = {
        value: Number(store.value.metalness),
        oldValue: Number(store.value.metalness),
        history: true,
    };

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
        .addInput(roughnessCtrl, 'value', {
            min: 0,
            max: 1,
            step: 0.01,
        })
        .on('change', (event) => {
            if (event.last && roughnessCtrl.history) {
                _content.world.editor.execute(new SetPreviewRoughnessCommand(
                    _content.world.editor,
                    {
                        name: 'roughness',
                        value: roughnessCtrl.value,
                        oldValue: Number(roughnessCtrl.oldValue),
                    },
                    _pane,
                    roughnessCtrl,
                    metalnessCtrl,
                ));
                // store.value.metalness = 1 - event.value;
                // events.emit('object:roughness:update');
                // _pane.refresh();
            }
        });

    _paneFolder
        .addInput(store.value, 'metalness', {
            min: 0,
            max: 1,
            step: 0.01,
        })
        .on('change', (event) => {
            if (event.last && metalnessCtrl.history) {
                _content.world.editor.execute(new SetPreviewMetalnessCommand(
                    _content.world.editor,
                    {
                        name: 'metalness',
                        value: metalnessCtrl.value,
                        oldValue: Number(metalnessCtrl.oldValue),
                    },
                    _pane,
                    metalnessCtrl,
                    roughnessCtrl,
                ));
                // store.value.roughness = 1 - event.value;
                // events.emit('object:metalness:update');
                // _pane.refresh();
            }
        });
};

const PreviewMaterialPaneFolder = {
    initialize(pane: Pane) {
        _pane = pane;
        _paneFolder = _pane.addFolder({
            title: 'Material',
            expanded: true,
        });
        events.on('matcap:preview:content:ready', generate);
    },
};

export default PreviewMaterialPaneFolder;
