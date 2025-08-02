import { SetLightPropertyCommand } from '@/legacy/commands/SetLightPropertyCommand';
import type { ValuesPaneCtrl } from '@/ts/types/PanesTypes';
import type { DataLightPaneFolder } from '@/legacy/matcapEditor/panes/LightPaneFolder';
import Editor from '@/legacy/Editor';

const LightIntensity = {
    addBinding(data: DataLightPaneFolder) {
        const paneCtrl: ValuesPaneCtrl = {
            value: Number(data.currentLightModel.light.intensity),
            oldValue: Number(data.currentLightModel.light.intensity),
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
                data.currentLightModel.light.intensity = Number(event.value);
                if (event.last && paneCtrl.history) {
                    Editor.instance.execute(
                        new SetLightPropertyCommand(
                            Editor.instance,
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
