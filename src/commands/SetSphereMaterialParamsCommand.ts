import { Command } from '@/commons/Command';
import { emitSnapshot } from '@/commons/Events';
import type Editor from '@/Editor';
import type MatcapEditorWorld from '@/matcapEditor/MatcapEditorWorld';
import { Color, type MeshPhysicalMaterial } from 'three';
import type { Pane } from 'tweakpane';
import type { ValuesCommand, ValuesPaneCtrl } from '@/ts/types/PanesTypes';

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
type PropertiesAllowed = 'roughness' | 'metalness' | 'color';
type SelectedTypes = number | Color;
class SetSphereMaterialParamsCommand extends Command {
    private world: MatcapEditorWorld;

    private material: MeshPhysicalMaterial;

    private parameters: ValuesCommand;

    private pane: Pane;

    private paneCtrl: ValuesPaneCtrl;

    constructor(editor: Editor, parameters: ValuesCommand, pane: Pane, paneCtrl: ValuesPaneCtrl) {
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
            this.material.color.setHex(Number(value));
            this.paneCtrl.value = `#${new Color(value).getHexString()}`;
        } else {
            this.material[name] = Number(value);
            this.paneCtrl.value = value;
        }

        this.pane.refresh();

        this.paneCtrl.history = true;
    }
}

export { SetSphereMaterialParamsCommand };
