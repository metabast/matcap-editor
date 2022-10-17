import { SetSphereMaterialParamsCommand } from 'src/commands/SetSphereMaterialParamsCommand';
import events from 'src/commons/Events';
import type { FolderApi, TabPageApi } from '@tweakpane/core';
import { Color } from 'three';
import type { Pane } from 'tweakpane';
import type { ValuesPaneCtrl } from 'src/types/PanesTypes';
import type MatcapEditorContent from '../MatcapEditorContent';

const data: { pane: Pane; paneContainer: FolderApi | TabPageApi } = {
    pane: null,
    paneContainer: null,
};

const generate = (content: MatcapEditorContent) => {
    const roughnessCtrl: ValuesPaneCtrl = {
        value: Number(content.sphereRenderMaterial.roughness),
        oldValue: Number(content.sphereRenderMaterial.roughness),
        history: true,
    };
    data.paneContainer
        .addInput(content.sphereRenderMaterial, 'roughness', {
            min: 0,
            max: 1,
            step: 0.01,
        })
        .on('change', (event) => {
            if (event.last && roughnessCtrl.history) {
                content.world.editor.execute(
                    new SetSphereMaterialParamsCommand(
                        content.world.editor,
                        {
                            name: 'roughness',
                            value: content.sphereRenderMaterial.roughness,
                            oldValue: Number(roughnessCtrl.value),
                        },
                        data.pane,
                        roughnessCtrl,
                    ),
                    'update material roughness',
                );
                roughnessCtrl.oldValue = Number(
                    content.sphereRenderMaterial.roughness,
                );
            }
        });

    const metalnessCtrl: ValuesPaneCtrl = {
        value: Number(content.sphereRenderMaterial.metalness),
        oldValue: Number(content.sphereRenderMaterial.metalness),
        history: true,
    };
    data.paneContainer
        .addInput(content.sphereRenderMaterial, 'metalness', {
            min: 0,
            max: 1,
            step: 0.01,
        })
        .on('change', (event) => {
            if (event.last && metalnessCtrl.history) {
                content.world.editor.execute(
                    new SetSphereMaterialParamsCommand(
                        content.world.editor,
                        {
                            name: 'metalness',
                            value: content.sphereRenderMaterial.metalness,
                            oldValue: Number(metalnessCtrl.oldValue),
                        },
                        data.pane,
                        metalnessCtrl,
                    ),
                    'update material metalness',
                );
                metalnessCtrl.oldValue = Number(
                    content.sphereRenderMaterial.metalness,
                );
            }
        });

    const colorObj: ValuesPaneCtrl = {
        value: `#${content.sphereRenderMaterial.color.getHexString()}`,
        oldValue: content.sphereRenderMaterial.color.getHex(),
        history: true,
    };
    data.paneContainer
        .addInput(colorObj, 'value', { label: 'color' })
        .on('change', (event) => {
            content.sphereRenderMaterial.color.set(colorObj.value);
            if (event.last && colorObj.history) {
                content.world.editor.execute(
                    new SetSphereMaterialParamsCommand(
                        content.world.editor,
                        {
                            name: 'color',
                            value: content.sphereRenderMaterial.color.getHex(),
                            oldValue: colorObj.oldValue,
                        },
                        data.pane,
                        colorObj,
                    ),
                    'update material color',
                );
                colorObj.oldValue = new Color(colorObj.value).getHex();
            }
        });
};
const SphereMaterialPaneFolder = {
    initialize(pane: Pane, paneContainer?: TabPageApi) {
        data.pane = pane;
        if (paneContainer) {
            data.paneContainer = paneContainer;
        } else {
            data.paneContainer = data.pane.addFolder({
                title: 'Material',
                expanded: true,
            });
        }
        events.on('matcap:content:ready', generate);
    },
};

export default SphereMaterialPaneFolder;
