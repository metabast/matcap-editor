import { SetLightPropertyCommand } from '@/commands/SetLightPropertyCommand';
import Editor from '@/Editor';
import { Color } from 'three';
import type { ValuesPaneCtrl } from '@/ts/types/PanesTypes';
import type { DataLightPaneFolder } from '../LightPaneFolder';

const LightColor = {
    addBinding(data: DataLightPaneFolder) {
        // Bindings only exist while a light is selected.
        const lightModel = data.currentLightModel;
        if (!lightModel) return;

        const paneCtrl: ValuesPaneCtrl = {
            value: `#${lightModel.light.color.getHexString()}`,
            oldValue: lightModel.light.color.getHex(),
            history: true,
        };
        data.paneContainer
            .addBinding(paneCtrl, 'value', {
                label: 'color',
                min: 0,
                max: 10,
                step: 0.001,
            })
            .on('change', (event) => {
                lightModel.light.color.set(paneCtrl.value as Color);
                if (event.last && paneCtrl.history) {
                    Editor.instance.execute(
                        new SetLightPropertyCommand(
                            Editor.instance.scene,
                            {
                                name: 'color',
                                value: lightModel.light.color.getHex(),
                                oldValue: paneCtrl.oldValue,
                            },
                            lightModel.light,
                            data.pane,
                            paneCtrl,
                        ),
                        'update ambiant color',
                    );
                    paneCtrl.oldValue = new Color(lightModel.light.color).getHex();
                }
            });
    },
};

export default LightColor;
