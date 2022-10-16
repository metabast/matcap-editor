import { Command } from 'src/Command';
import events, { emitSnapshot } from 'src/commons/Events';
import type Editor from 'src/Editor';
import type MatcapEditorWorld from 'src/matcapEditor/MatcapEditorWorld';
import type { Color, MeshPhysicalMaterial } from 'three';
import type { Pane } from 'tweakpane';

export type SphereMaterialPaneCtrl = {
    value: number | string | Color;
    oldValue: number | string | Color;
    history: boolean;
};
export type SphereMaterialParams = {
    name: string;
    value: number | string | Color;
    oldValue: number | string | Color;
};

class SetSphereMaterialParamsCommand extends Command {
    private world: MatcapEditorWorld;

    private material: MeshPhysicalMaterial;

    private parameters: SphereMaterialParams;

    private pane: Pane;

    private paneCtrl: SphereMaterialPaneCtrl;

    constructor(
        editor: Editor,
        parameters: SphereMaterialParams,
        pane: Pane,
        paneCtrl: SphereMaterialPaneCtrl,
    ) {
        super(editor);
        this.type = 'SetSphereMaterialParamsCommand';
        this.name = 'Set Sphere Material Params';
        this.updatable = true;
        this.world = this.editor.matcapEditorWorld;
        this.material = this.world.content.sphereRenderMaterial;
        this.parameters = parameters;
        this.pane = pane;
        this.paneCtrl = paneCtrl;
    }

    execute(): void {
        this.material[this.parameters.name] = this.parameters.value;
        this.paneCtrl.history = false;

        this.paneCtrl.value = this.parameters.value;

        this.pane.refresh();

        this.paneCtrl.history = true;
        emitSnapshot();
    }

    undo(): void {
        this.material[this.parameters.name] = this.parameters.oldValue;
        this.paneCtrl.history = false;

        this.paneCtrl.value = this.parameters.oldValue;

        this.pane.refresh();

        this.paneCtrl.history = true;
        emitSnapshot();
    }
}

export { SetSphereMaterialParamsCommand };
