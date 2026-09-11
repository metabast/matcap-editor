import { SetLightModelPropertyCommand } from '@/commands/SetLightModelPropertyCommand';
import LightModel from '@/matcapEditor/LightModel';
import Editor from '@/Editor';
import type { ValuesPaneCtrl } from '@/ts/types/PanesTypes';
import type { DataLightPaneFolder } from '../LightPaneFolder';

const LightDistance = {
    addBinding(data: DataLightPaneFolder) {
        const distancetCtrl: ValuesPaneCtrl = {
            value: Number(data.currentLightModel.distance),
            oldValue: Number(data.currentLightModel.distance),
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
                data.currentLightModel.distance = Number(event.value);
                LightModel.updateLightDistance(data.currentLightModel);
                if (event.last && distancetCtrl.history) {
                    Editor.instance.execute(
                        new SetLightModelPropertyCommand(
                            Editor.instance,
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
