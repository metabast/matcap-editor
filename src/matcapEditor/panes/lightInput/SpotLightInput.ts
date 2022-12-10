import { SetSpotLightPropertyCommand } from '@/commands/SetSpotLightPropertyCommand';
import type { ValuesPaneCtrl } from '@/ts/types/PanesTypes';
import type { SpotLight } from 'three';
import type { DataLightPaneFolder } from '../LightPaneFolder';

const inputParams = {
    distance: {
        min: 0,
        max: 10,
        step: 0.01,
    },
    angle: {
        min: 0,
        max: Math.PI / 4,
        step: 0.001,
    },
    penumbra: {
        min: 0,
        max: 1,
        step: 0.001,
    },
    decay: {
        min: 0,
        max: 10,
        step: 0.01,
    },
};

const SpotLightInput = {
    addInput(data: DataLightPaneFolder, propertyName: 'distance' | 'angle' | 'penumbra' | 'decay') {
        const spotlight = data.currentLightModel.light as SpotLight;
        const paneCtrl: ValuesPaneCtrl = {
            value: Number(spotlight[propertyName]),
            oldValue: Number(spotlight[propertyName]),
            history: true,
        };

        const params = { ...{ label: propertyName }, ...inputParams[propertyName] };

        data.paneContainer.addInput(paneCtrl, 'value', params).on('change', (event) => {
            spotlight[propertyName] = Number(event.value);
            if (event.last && paneCtrl.history) {
                data.content.world.editor.execute(
                    new SetSpotLightPropertyCommand(
                        data.content.world.editor,
                        {
                            name: propertyName,
                            value: spotlight[propertyName],
                            oldValue: Number(paneCtrl.oldValue),
                        },
                        data.currentLightModel.light as SpotLight,
                        data.pane,
                        paneCtrl,
                    ),
                    `update ambiant${propertyName}`,
                );
                paneCtrl.oldValue = Number(spotlight[propertyName]);
            }
        });
    },
};

export default SpotLightInput;
