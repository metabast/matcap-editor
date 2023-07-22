import { SetAreaLightPropertyCommand } from '@/commands/SetAreaLightPropertyCommand';
import type { ValuesPaneCtrl } from '@/ts/types/PanesTypes';
import type { RectAreaLight } from 'three';
import type { DataLightPaneFolder } from '../LightPaneFolder';
import Editor from '@/Editor';

const RectAreaLightSize = {
    addInput(data: DataLightPaneFolder, propertyName: 'width' | 'height') {
        const rectAreaLight = data.currentLightModel.light as RectAreaLight;
        const paneCtrl: ValuesPaneCtrl = {
            value: Number(rectAreaLight[propertyName]),
            oldValue: Number(rectAreaLight[propertyName]),
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
                rectAreaLight[propertyName] = Number(event.value);
                if (event.last && paneCtrl.history) {
                    Editor.instance.execute(
                        new SetAreaLightPropertyCommand(
                            Editor.instance,
                            {
                                name: propertyName,
                                value: rectAreaLight[propertyName],
                                oldValue: Number(paneCtrl.oldValue),
                            },
                            data.currentLightModel.light as RectAreaLight,
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
