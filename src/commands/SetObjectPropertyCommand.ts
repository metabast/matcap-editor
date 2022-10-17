import { Command } from 'src/Command';
import { emitSnapshot } from 'src/commons/Events';
import type Editor from 'src/Editor';
import type { Pane } from 'tweakpane';

export type ObjectPropertyPaneCtrl = {
    value: number | string;
    oldValue: number | string;
    history: boolean;
};
export type ObjectPropertyParams = {
    name: string;
    value: number | string;
    oldValue: number | string;
};

class SetObjectPropertyCommand extends Command {
    private parameters: ObjectPropertyParams;

    private object: Record<
        ObjectPropertyParams['name'],
        ObjectPropertyParams['value']
    >;

    private pane: Pane;

    private paneCtrl: ObjectPropertyPaneCtrl;

    constructor(
        editor: Editor,
        parameters: ObjectPropertyParams,
        object: Record<
            ObjectPropertyParams['name'],
            ObjectPropertyParams['value']
        >,
        pane: Pane,
        paneCtrl: ObjectPropertyPaneCtrl,
    ) {
        super(editor);
        this.type = 'SetObjectPropertyCommand';
        this.name = 'Set Object Property Params';
        this.updatable = true;
        this.parameters = parameters;
        this.object = object;
        this.pane = pane;
        this.paneCtrl = paneCtrl;
    }

    execute(): void {
        this.object[this.parameters.name] = this.parameters.value;
        emitSnapshot();
    }

    undo(): void {
        this.object[this.parameters.name] = this.parameters.oldValue;

        this.paneCtrl.history = false;

        this.paneCtrl.value = this.parameters.oldValue;

        this.pane.refresh();

        this.paneCtrl.history = true;

        emitSnapshot();
    }
}

export { SetObjectPropertyCommand };
