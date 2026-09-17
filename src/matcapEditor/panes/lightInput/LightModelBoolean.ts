import { SetLightModelPropertyCommand } from '@/commands/SetLightModelPropertyCommand';
import events from '@/commons/Events';
import LightModel from '@/matcapEditor/LightModel';
import type { ValuesPaneCtrl } from '@/ts/types/PanesTypes';
import type { DataLightPaneFolder } from '../LightPaneFolder';

const LightModelBoolean = {
    addBinding(data: DataLightPaneFolder, propertyName: 'front' | 'lookAtTarget') {
        // Bindings only exist while a light is selected.
        const lightModel = data.currentLightModel;
        if (!lightModel) return;

        if (!lightModel || !data.paneContainer) return;
        const paneCtrl: ValuesPaneCtrl = {
            value: Boolean(lightModel[propertyName]),
            oldValue: Boolean(lightModel[propertyName]),
            history: true,
        };
        data.paneContainer
            .addBinding(paneCtrl, 'value', {
                label: propertyName,
                min: 0,
                max: 10,
                step: 0.001,
            })
            .on('change', (event) => {
                if (!lightModel || !data.content || !data.pane) return;

                lightModel[propertyName] = Boolean(event.value);
                LightModel.updateLightDistance(lightModel);
                if (event.last && paneCtrl.history) {
                    data.editor.execute(
                        new SetLightModelPropertyCommand(
                            data.editor.scene,
                            {
                                name: propertyName,
                                value: lightModel[propertyName],
                                oldValue: Boolean(paneCtrl.oldValue),
                            },
                            lightModel,
                            data.pane,
                            paneCtrl,
                        ),
                        `update light model ${propertyName}`,
                    );
                    paneCtrl.oldValue = Boolean(lightModel[propertyName]);
                }
            });

        events.on('light:change', (payload) => {
            if (!data.pane) return;
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
