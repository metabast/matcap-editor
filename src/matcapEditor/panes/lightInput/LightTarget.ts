import { SetLightModelPropertyCommand } from '@/commands/SetLightModelPropertyCommand';
import type { ValuesPaneCtrl } from '@/ts/types/PanesTypes';
import type { Vector3 } from 'three';
import type { DataLightPaneFolder } from '../LightPaneFolder';

const LightTarget = {
    addBinding(data: DataLightPaneFolder) {
        // Bindings only exist while a light is selected.
        const lightModel = data.currentLightModel;
        if (!lightModel) return;

        const paneCtrl: ValuesPaneCtrl = {
            value: lightModel.positionTarget.clone(),
            oldValue: lightModel.positionTarget.clone(),
            history: true,
        };
        data.paneContainer
            .addBinding(paneCtrl, 'value', {
                label: 'positionTarget',
                min: 0,
                max: 10,
                step: 0.001,
            })
            .on('change', (event) => {
                lightModel.positionTarget = event.value as Vector3;
                if (event.last && paneCtrl.history) {
                    data.content.world.editor.execute(
                        new SetLightModelPropertyCommand(
                            data.content.world.editor.scene,
                            {
                                name: 'positionTarget',
                                value: lightModel.positionTarget.clone(),
                                oldValue: paneCtrl.oldValue,
                            },
                            lightModel,
                            data.pane,
                            paneCtrl,
                        ),
                        'update ambiant positionTarget',
                    );
                    paneCtrl.oldValue = lightModel.positionTarget.clone();
                }
            });
    },
};

export default LightTarget;
