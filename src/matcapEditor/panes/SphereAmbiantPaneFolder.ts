import events from 'src/commons/Events';
import type { FolderApi, TabPageApi } from '@tweakpane/core';
import { Color } from 'three';
import type { Pane } from 'tweakpane';
import { SetAmbiantLightCommand } from 'src/commands/SetAmbiantLightCommand';
import type { ValuesPaneCtrl } from '@/ts/types/PanesTypes';
import type MatcapEditorContent from '../MatcapEditorContent';

const data: { pane: Pane; paneContainer: FolderApi | TabPageApi } = {
    pane: null,
    paneContainer: null,
};

const generate = (content: MatcapEditorContent) => {
    const intensityCtrl: ValuesPaneCtrl = {
        value: Number(content.ambiantLight.intensity),
        oldValue: Number(content.ambiantLight.intensity),
        history: true,
    };
    data.paneContainer
        .addInput(intensityCtrl, 'value', {
            min: 0,
            max: 2,
            step: 0.01,
        })
        .on('change', (event) => {
            content.ambiantLight.intensity = Number(event.value);
            if (event.last && intensityCtrl.history) {
                content.world.editor.execute(
                    new SetAmbiantLightCommand(
                        content.world.editor,
                        {
                            name: 'intensity',
                            value: content.ambiantLight.intensity,
                            oldValue: Number(intensityCtrl.oldValue),
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

    const colorCtrl: ValuesPaneCtrl = {
        value: `#${content.ambiantLight.color.getHexString()}`,
        oldValue: content.ambiantLight.color.getHex(),
        history: true,
    };
    data.paneContainer.addInput(colorCtrl, 'value', { label: 'color' }).on('change', (event) => {
        content.ambiantLight.color.set(colorCtrl.value as Color);
        if (event.last && colorCtrl.history) {
            content.world.editor.execute(
                new SetAmbiantLightCommand(
                    content.world.editor,
                    {
                        name: 'color',
                        value: content.ambiantLight.color.getHex(),
                        oldValue: colorCtrl.oldValue,
                    },
                    content.ambiantLight,
                    data.pane,
                    colorCtrl,
                ),
                'update material color',
            );
            colorCtrl.oldValue = new Color(colorCtrl.value as Color).getHex();
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
