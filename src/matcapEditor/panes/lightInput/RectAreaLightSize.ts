import { SetAreaLightPropertyCommand } from '@/commands/SetAreaLightPropertyCommand';
import type { ValuesPaneCtrl } from '@/ts/types/PanesTypes';
import type { RectAreaLight } from 'three';
import type { DataLightPaneFolder } from '../LightPaneFolder';

const RectAreaLightSize = {
    addBinding(data: DataLightPaneFolder, propertyName: 'width' | 'height') {
        // Bindings only exist while a light is selected.
        const lightModel = data.currentLightModel;
        if (!lightModel) return;

        const rectAreaLight = lightModel.light as RectAreaLight;
        const paneCtrl: ValuesPaneCtrl = {
            value: Number(rectAreaLight[propertyName]),
            oldValue: Number(rectAreaLight[propertyName]),
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
                rectAreaLight[propertyName] = Number(event.value);
                if (event.last && paneCtrl.history) {
                    data.editor.execute(
                        new SetAreaLightPropertyCommand(
                            data.editor.scene,
                            {
                                name: propertyName,
                                value: rectAreaLight[propertyName],
                                oldValue: Number(paneCtrl.oldValue),
                            },
                            lightModel.light as RectAreaLight,
                            data.pane,
                            paneCtrl,
                        ),
                        `update ambiant${propertyName}`,
                    );
                    paneCtrl.oldValue = Number(rectAreaLight[propertyName]);
                }
            });
    },
};

export default RectAreaLightSize;
