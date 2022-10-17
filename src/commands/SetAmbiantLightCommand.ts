import { Command } from 'src/Command';
import { emitSnapshot } from 'src/commons/Events';
import type Editor from 'src/Editor';
import type { ValuesCommand, ValuesPaneCtrl } from 'src/types/PanesTypes';
import { Color, type AmbientLight } from 'three';
import type { Pane } from 'tweakpane';

export type ObjectPropertyParams = {
    name: string;
    value: number | string;
    oldValue: number | string;
};

class SetAmbiantLightCommand extends Command {
    private parameters: ValuesCommand;

    private ambientLight: AmbientLight;

    private pane: Pane;

    private paneCtrl: ValuesPaneCtrl;

    constructor(
        editor: Editor,
        parameters: ValuesCommand,
        ambientLight: AmbientLight,
        pane: Pane,
        paneCtrl: ValuesPaneCtrl,
    ) {
        super(editor);
        this.type = 'SetAmbiantLightCommand';
        this.name = 'Set ambientLight Params';
        this.updatable = true;
        this.parameters = parameters;
        this.ambientLight = ambientLight;
        this.pane = pane;
        this.paneCtrl = paneCtrl;
    }

    execute(): void {
        this.apply(this.parameters.value);
        emitSnapshot();
    }

    undo(): void {
        this.apply(this.parameters.oldValue);
        emitSnapshot();
    }

    apply(value: number | string | Color): void {
        switch (this.parameters.name) {
            case 'intensity':
                this.ambientLight.intensity = Number(value);
                break;

            case 'color':
                this.ambientLight.color.setHex(Number(value));
                break;
            default:
                break;
        }

        this.paneCtrl.history = false;

        if (this.parameters.name === 'color') {
            this.paneCtrl.value = `#${new Color(value).getHexString()}`;
        } else {
            this.paneCtrl.value = value;
        }

        this.pane.refresh();

        this.paneCtrl.history = true;
    }
}

export { SetAmbiantLightCommand };
