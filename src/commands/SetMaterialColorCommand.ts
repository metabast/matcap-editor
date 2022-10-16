import { Command } from 'src/Command';
import events, { emitSnapshot } from 'src/commons/Events';
import type Editor from 'src/Editor';
import type MatcapEditorWorld from 'src/matcapEditor/MatcapEditorWorld';
import {
    Color,
    type MeshPhysicalMaterial,
    type MeshStandardMaterial,
} from 'three';
import type { Pane } from 'tweakpane';

export type MaterialColorPaneCtrl = {
    value: string;
    oldValue: number;
    history: boolean;
};
export type MaterialColorParams = {
    name: string;
    value: number;
    oldValue: number;
};

class SetMaterialColorCommand extends Command {
    private world: MatcapEditorWorld;

    private material: MeshStandardMaterial;

    private parameters: MaterialColorParams;

    private pane: Pane;

    private paneCtrl: MaterialColorPaneCtrl;

    constructor(
        editor: Editor,
        parameters: MaterialColorParams,
        material: MeshStandardMaterial,
        pane: Pane,
        paneCtrl: MaterialColorPaneCtrl,
    ) {
        super(editor);
        this.type = 'SetMaterialColorCommand';
        this.name = 'Set Sphere Material Params';
        this.updatable = true;
        this.world = this.editor.matcapEditorWorld;
        this.material = material;
        this.parameters = parameters;
        this.pane = pane;
        this.paneCtrl = paneCtrl;
    }

    execute(): void {
        (this.material[this.parameters.name] as Color).setHex(
            this.parameters.value,
        );
        emitSnapshot();
    }

    undo(): void {
        (this.material[this.parameters.name] as Color).setHex(
            this.parameters.oldValue,
        );

        this.paneCtrl.history = false;

        this.paneCtrl.value = `#${new Color(
            this.parameters.oldValue,
        ).getHexString()}`;

        this.pane.refresh();

        this.paneCtrl.history = true;

        emitSnapshot();
    }
}

export { SetMaterialColorCommand };
