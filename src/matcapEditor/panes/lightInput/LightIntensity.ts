import { SetLightPropertyCommand } from 'src/commands/SetLightPropertyCommand';
import type { ValuesPaneCtrl } from '@/ts/types/PanesTypes';
import type { DataLightPaneFolder } from '../LightPaneFolder';

const LightIntensity = {
    addInput(data: DataLightPaneFolder) {
        const paneCtrl: ValuesPaneCtrl = {
            value: Number(data.currentLightModel.light.intensity),
            oldValue: Number(data.currentLightModel.light.intensity),
            history: true,
        };
        data.paneContainer
            .addInput(paneCtrl, 'value', {
                label: 'intensity',
                min: 0,
                max: 10,
                step: 0.001,
            })
            .on('change', (event) => {
                data.currentLightModel.light.intensity = Number(event.value);
                if (event.last && paneCtrl.history) {
                    data.content.world.editor.execute(
                        new SetLightPropertyCommand(
                            data.content.world.editor,
                            {
                                name: 'intensity',
                                value: data.currentLightModel.light.intensity,
                                oldValue: Number(paneCtrl.oldValue),
                            },
                            data.currentLightModel.light,
                            data.pane,
                            paneCtrl,
                        ),
                        'update ambiant intensity',
                    );
                    paneCtrl.oldValue = Number(data.currentLightModel.light.intensity);
                }
            });
    },
};

export default LightIntensity;
