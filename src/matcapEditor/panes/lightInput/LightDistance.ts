import { SetLightModelPropertyCommand } from 'src/commands/SetLightModelPropertyCommand';
import LightModel from 'src/matcapEditor/LightModel';
import type { ValuesPaneCtrl } from '@/ts/types/PanesTypes';
import type { DataLightPaneFolder } from '../LightPaneFolder';

const LightDistance = {
    addInput(data: DataLightPaneFolder) {
        const distancetCtrl: ValuesPaneCtrl = {
            value: Number(data.currentLightModel.distance),
            oldValue: Number(data.currentLightModel.distance),
            history: true,
        };
        data.paneContainer
            .addInput(distancetCtrl, 'value', {
                label: 'distance',
                min: 0,
                max: 10,
                step: 0.001,
            })
            .on('change', (event) => {
                data.currentLightModel.distance = Number(event.value);
                LightModel.updateLightDistance(data.currentLightModel);
                if (event.last && distancetCtrl.history) {
                    data.content.world.editor.execute(
                        new SetLightModelPropertyCommand(
                            data.content.world.editor,
                            {
                                name: 'distance',
                                value: data.currentLightModel.distance,
                                oldValue: Number(distancetCtrl.oldValue),
                            },
                            data.currentLightModel,
                            data.pane,
                            distancetCtrl,
                        ),
                        'update ambiant distance',
                    );
                    distancetCtrl.oldValue = Number(data.currentLightModel.distance);
                }
            });
    },
};

export default LightDistance;
