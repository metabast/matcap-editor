import { Command } from '@/commons/Command';
import { emitSnapshot } from '@/commons/Events';
import type Editor from '@/Editor';
import type { ValuesCommand, ValuesPaneCtrl } from '@/ts/types/PanesTypes';
import type { SpotLight } from 'three';
import type { Pane } from 'tweakpane';

type PropertiesAllowed = 'distance' | 'angle' | 'penumbra' | 'decay';
type SelectedTypes = number;
class SetSpotLightPropertyCommand extends Command {
    private parameters: ValuesCommand;

    private light: SpotLight;

    private pane: Pane;

    private paneCtrl: ValuesPaneCtrl;

    constructor(editor: Editor, parameters: ValuesCommand, light: SpotLight, pane: Pane, paneCtrl: ValuesPaneCtrl) {
        super(editor);
        this.type = 'SetSpotLightPropertyCommand';
        this.name = 'Set SpotLight Property';
        this.updatable = true;
        this.parameters = parameters;
        this.pane = pane;
        this.paneCtrl = paneCtrl;
        this.light = light;
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

        this.light[name] = Number(value);
        this.paneCtrl.value = value;

        this.pane.refresh();

        this.paneCtrl.history = true;
    }
}

export { SetSpotLightPropertyCommand };
