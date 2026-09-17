import { SetLightModelPropertyCommand } from '@/commands/SetLightModelPropertyCommand';
import LightModel from '@/matcapEditor/LightModel';
import type { ValuesPaneCtrl } from '@/ts/types/PanesTypes';
import type { DataLightPaneFolder } from '../LightPaneFolder';

const LightDistance = {
    addBinding(data: DataLightPaneFolder) {
        // Bindings only exist while a light is selected.
        const lightModel = data.currentLightModel;
        if (!lightModel) return;

        const distancetCtrl: ValuesPaneCtrl = {
            value: Number(lightModel.distance),
            oldValue: Number(lightModel.distance),
            history: true,
        };
        data.paneContainer
            .addBinding(distancetCtrl, 'value', {
                label: 'distance',
                min: 0,
                max: 10,
                step: 0.001,
            })
            .on('change', (event) => {
                lightModel.distance = Number(event.value);
                LightModel.updateLightDistance(lightModel);
                if (event.last && distancetCtrl.history) {
                    data.editor.execute(
                        new SetLightModelPropertyCommand(
                            data.editor.scene,
                            {
                                name: 'distance',
                                value: lightModel.distance,
                                oldValue: Number(distancetCtrl.oldValue),
                            },
                            lightModel,
                            data.pane,
                            distancetCtrl,
                        ),
                        'update ambiant distance',
                    );
                    distancetCtrl.oldValue = Number(lightModel.distance);
                }
            });
    },
};

export default LightDistance;
