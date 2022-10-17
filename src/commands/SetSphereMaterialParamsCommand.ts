import { Command } from 'src/Command';
import { emitSnapshot } from 'src/commons/Events';
import type Editor from 'src/Editor';
import type MatcapEditorWorld from 'src/matcapEditor/MatcapEditorWorld';
import { Color, type MeshPhysicalMaterial } from 'three';
import type { Pane } from 'tweakpane';
import type { ValuesCommand, ValuesPaneCtrl } from 'src/types/PanesTypes';

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

    private parameters: ValuesCommand;

    private pane: Pane;

    private paneCtrl: ValuesPaneCtrl;

    constructor(
        editor: Editor,
        parameters: ValuesCommand,
        pane: Pane,
        paneCtrl: ValuesPaneCtrl,
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
        this.apply(this.parameters.value);
        emitSnapshot();
    }

    undo(): void {
        this.apply(this.parameters.oldValue);
        emitSnapshot();
    }

    apply(value: number | string | Color): void {
        switch (this.parameters.name) {
            case 'roughness':
                this.material.roughness = Number(value);
                break;

            case 'metalness':
                this.material.metalness = Number(value);
                break;

            case 'color':
                this.material.color.setHex(Number(value));
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

export { SetSphereMaterialParamsCommand };
