import { Command } from 'src/Command';
import { emitSnapshot } from 'src/commons/Events';
import type Editor from 'src/Editor';
import type { ValuesCommand, ValuesPaneCtrl } from 'src/types/PanesTypes';
import type { RectAreaLight } from 'three';
import type { Pane } from 'tweakpane';

type PropertiesAllowed = 'width' | 'height';
type SelectedTypes = number;
class SetAreaLightPropertyCommand extends Command {
    private parameters: ValuesCommand;

    private light: RectAreaLight;

    private pane: Pane;

    private paneCtrl: ValuesPaneCtrl;

    constructor(editor: Editor, parameters: ValuesCommand, light: RectAreaLight, pane: Pane, paneCtrl: ValuesPaneCtrl) {
        super(editor);
        this.type = 'SetRectAreaLightPropertyCommand';
        this.name = 'Set RectAreaLight Property';
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

export { SetAreaLightPropertyCommand };
