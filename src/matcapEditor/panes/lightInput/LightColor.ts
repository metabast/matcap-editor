import { SetLightPropertyCommand } from '@/commands/SetLightPropertyCommand';
import type { ValuesPaneCtrl } from '@/ts/types/PanesTypes';
import { Color } from 'three';
import type { DataLightPaneFolder } from '../LightPaneFolder';

const LightColor = {
    addInput(data: DataLightPaneFolder) {
        const paneCtrl: ValuesPaneCtrl = {
            value: `#${data.currentLightModel.light.color.getHexString()}`,
            oldValue: data.currentLightModel.light.color.getHex(),
            history: true,
        };
        data.paneContainer
            .addInput(paneCtrl, 'value', {
                label: 'color',
                min: 0,
                max: 10,
                step: 0.001,
            })
            .on('change', (event) => {
                data.currentLightModel.light.color.set(paneCtrl.value as Color);
                if (event.last && paneCtrl.history) {
                    data.content.world.editor.execute(
                        new SetLightPropertyCommand(
                            data.content.world.editor,
                            {
                                name: 'color',
                                value: data.currentLightModel.light.color.getHex(),
                                oldValue: paneCtrl.oldValue,
                            },
                            data.currentLightModel.light,
                            data.pane,
                            paneCtrl,
                        ),
                        'update ambiant color',
                    );
                    paneCtrl.oldValue = new Color(data.currentLightModel.light.color).getHex();
                }
            });
    },
};

export default LightColor;
