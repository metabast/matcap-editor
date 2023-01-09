import { SetLightModelPropertyCommand } from '@/commands/SetLightModelPropertyCommand';
import type { ValuesPaneCtrl } from '@/ts/types/PanesTypes';
import type { Vector3 } from 'three';
import type { DataLightPaneFolder } from '../LightPaneFolder';

const LightTarget = {
    addInput(data: DataLightPaneFolder) {
        const paneCtrl: ValuesPaneCtrl = {
            value: data.currentLightModel.positionTarget.clone(),
            oldValue: data.currentLightModel.positionTarget.clone(),
            history: true,
        };
        data.paneContainer
            .addInput(paneCtrl, 'value', {
                label: 'positionTarget',
                min: 0,
                max: 10,
                step: 0.001,
            })
            .on('change', (event) => {
                data.currentLightModel.positionTarget = event.value as Vector3;
                if (event.last && paneCtrl.history) {
                    data.content.world.editor.execute(
                        new SetLightModelPropertyCommand(
                            data.content.world.editor,
                            {
                                name: 'positionTarget',
                                value: data.currentLightModel.positionTarget.clone(),
                                oldValue: paneCtrl.oldValue,
                            },
                            data.currentLightModel,
                            data.pane,
                            paneCtrl,
                        ),
                        'update ambiant positionTarget',
                    );
                    paneCtrl.oldValue = data.currentLightModel.positionTarget.clone();
                }
            });
    },
};

export default LightTarget;
