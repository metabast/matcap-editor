import { SetLightPropertyCommand } from '@/commands/SetLightPropertyCommand';
import Editor from '@/Editor';
import type { ValuesPaneCtrl } from '@/ts/types/PanesTypes';
import type { DataLightPaneFolder } from '../LightPaneFolder';

const LightIntensity = {
    addBinding(data: DataLightPaneFolder) {
        // Bindings only exist while a light is selected.
        const lightModel = data.currentLightModel;
        if (!lightModel) return;

        const paneCtrl: ValuesPaneCtrl = {
            value: Number(lightModel.light.intensity),
            oldValue: Number(lightModel.light.intensity),
            history: true,
        };
        data.paneContainer
            .addBinding(paneCtrl, 'value', {
                label: 'intensity',
                min: 0,
                max: 10,
                step: 0.001,
            })
            .on('change', (event) => {
                lightModel.light.intensity = Number(event.value);
                if (event.last && paneCtrl.history) {
                    Editor.instance.execute(
                        new SetLightPropertyCommand(
                            Editor.instance.scene,
                            {
                                name: 'intensity',
                                value: lightModel.light.intensity,
                                oldValue: Number(paneCtrl.oldValue),
                            },
                            lightModel.light,
                            data.pane,
                            paneCtrl,
                        ),
                        'update ambiant intensity',
                    );
                    paneCtrl.oldValue = Number(lightModel.light.intensity);
                }
            });
    },
};

export default LightIntensity;
