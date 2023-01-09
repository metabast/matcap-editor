import { SetLightModelPropertyCommand } from '@/commands/SetLightModelPropertyCommand';
import events from '@/commons/Events';
import LightModel from '@/matcapEditor/LightModel';
import type { ValuesPaneCtrl } from '@/ts/types/PanesTypes';
import type { DataLightPaneFolder } from '../LightPaneFolder';

const LightModelBoolean = {
    addInput(
        data: DataLightPaneFolder,
        propertyName: 'front' | 'lookAtTarget',
    ) {
        const paneCtrl: ValuesPaneCtrl = {
            value: Boolean(data.currentLightModel[propertyName]),
            oldValue: Boolean(data.currentLightModel[propertyName]),
            history: true,
        };
        data.paneContainer
            .addInput(paneCtrl, 'value', {
                label: propertyName,
                min: 0,
                max: 10,
                step: 0.001,
            })
            .on('change', (event) => {
                data.currentLightModel[propertyName] = Boolean(event.value);
                LightModel.updateLightDistance(data.currentLightModel);
                if (event.last && paneCtrl.history) {
                    data.content.world.editor.execute(
                        new SetLightModelPropertyCommand(
                            data.content.world.editor,
                            {
                                name: propertyName,
                                value: data.currentLightModel[propertyName],
                                oldValue: Boolean(paneCtrl.oldValue),
                            },
                            data.currentLightModel,
                            data.pane,
                            paneCtrl,
                        ),
                        `update light model ${propertyName}`,
                    );
                    paneCtrl.oldValue = Boolean(
                        data.currentLightModel[propertyName],
                    );
                }
            });

        events.on('light:change', (payload) => {
            console.log(propertyName);
            // paneCtrl.history = false;
            if (payload.propertyName === propertyName) {
                paneCtrl.value = payload.value;
                data.pane.refresh();
            }
            // paneCtrl.history = true;
        });
    },
};

export default LightModelBoolean;
