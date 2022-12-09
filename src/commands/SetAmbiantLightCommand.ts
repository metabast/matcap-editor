import { Command } from '@/commons/Command';
import { emitSnapshot } from '@/commons/Events';
import type Editor from '@/Editor';
import type { ValuesCommand, ValuesPaneCtrl } from '@/ts/types/PanesTypes';
import { Color, type AmbientLight } from 'three';
import type { Pane } from 'tweakpane';

type PropertiesAllowed = 'intensity' | 'color';
type SelectedTypes = number | Color;
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
        this.pane = pane;
        this.paneCtrl = paneCtrl;
        this.ambientLight = ambientLight;
    }

    execute(): void {
        this.apply(this.parameters.value as SelectedTypes);
        emitSnapshot();
    }

    undo(): void {
        this.apply(this.parameters.oldValue as SelectedTypes);
        emitSnapshot();
    }

    apply(value: SelectedTypes): void {
        const name = this.parameters.name as PropertiesAllowed;

        this.paneCtrl.history = false;
        if (name === 'color') {
            this.ambientLight.color.setHex(Number(value));
            this.paneCtrl.value = `#${new Color(value).getHexString()}`;
        } else {
            this.ambientLight[name] = Number(value);
            this.paneCtrl.value = value;
        }

        this.pane.refresh();

        this.paneCtrl.history = true;
    }
}

export { SetAmbiantLightCommand };
