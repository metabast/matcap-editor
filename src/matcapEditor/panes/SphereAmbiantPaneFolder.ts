import events from 'src/commons/Events';
import type { FolderApi, TabPageApi } from '@tweakpane/core';
import {
    SetMaterialColorCommand,
    type MaterialColorPaneCtrl,
} from 'src/commands/SetMaterialColorCommand';
import { Color } from 'three';
import type { Pane } from 'tweakpane';
import { MatcapEditorStore, type IMatcapEditorStore } from 'src/store';
import {
    SetObjectPropertyCommand,
    type ObjectPropertyPaneCtrl,
} from 'src/commands/SetObjectPropertyCommand';
import { SetAmbiantLightCommand } from 'src/commands/SetAmbiantLightCommand';
import type MatcapEditorContent from '../MatcapEditorContent';

const data: { pane: Pane; paneContainer: FolderApi | TabPageApi } = {
    pane: null,
    paneContainer: null,
};

let store: IMatcapEditorStore;
MatcapEditorStore.subscribe((newStore) => {
    store = newStore;
});

const generate = (content: MatcapEditorContent) => {
    const intensityCtrl: ObjectPropertyPaneCtrl = {
        value: Number(content.ambiantLight.intensity),
        oldValue: Number(content.ambiantLight.intensity),
        history: true,
    };
    data.paneContainer
        .addInput(content.ambiantLight, 'intensity', {
            min: 0,
            max: 2,
            step: 0.01,
        })
        .on('change', (event) => {
            const word = 'intensity';
            content.ambiantLight[word] = Number(event.value);
            if (event.last && intensityCtrl.history) {
                content.world.editor.execute(
                    new SetAmbiantLightCommand(
                        content.world.editor,
                        {
                            name: 'intensity',
                            value: content.ambiantLight.intensity,
                            oldValue: Number(intensityCtrl.value),
                        },
                        content.ambiantLight,
                        data.pane,
                        intensityCtrl,
                    ),
                    'update ambiant intensity',
                );
                intensityCtrl.oldValue = Number(content.ambiantLight.intensity);
            }
        });

    const colorObj: MaterialColorPaneCtrl = {
        value: `#${content.ambiantLight.color.getHexString()}`,
        oldValue: content.ambiantLight.color.getHex(),
        history: true,
    };
    data.paneContainer
        .addInput(colorObj, 'value', { label: 'color' })
        .on('change', (event) => {
            content.ambiantLight.color.set(colorObj.value);
            if (event.last && colorObj.history) {
                content.world.editor.execute(
                    new SetAmbiantLightCommand(
                        content.world.editor,
                        {
                            name: 'color',
                            value: content.ambiantLight.color.getHex(),
                            oldValue: colorObj.oldValue,
                        },
                        content.ambiantLight,
                        data.pane,
                        colorObj,
                    ),
                    'update material color',
                );
                colorObj.oldValue = new Color(colorObj.value).getHex();
            }
        });
};
const SphereAmbiantPaneFolder = {
    initialize(pane: Pane, paneContainer?: TabPageApi) {
        data.pane = pane;
        if (paneContainer) {
            data.paneContainer = paneContainer;
        } else {
            data.paneContainer = data.pane.addFolder({
                title: 'Ambiant',
                expanded: false,
            });
        }
        events.on('matcap:content:ready', generate);
    },
};

export default SphereAmbiantPaneFolder;
