import { Command } from 'src/Command';
import { emitSnapshot } from 'src/commons/Events';
import type Editor from 'src/Editor';
import type MatcapEditorWorld from 'src/matcapEditor/MatcapEditorWorld';
import type { MeshPhysicalMaterial } from 'three';

export type SphereMaterialParams = {
    name: string;
    value: number | string;
};

class SetSphereMaterialParamsCommand extends Command {
    private world: MatcapEditorWorld;

    private material: MeshPhysicalMaterial;

    private parameters: SphereMaterialParams;

    private oldParameters: SphereMaterialParams;

    constructor(editor: Editor, parameters: SphereMaterialParams) {
        super(editor);
        this.type = 'SetSphereMaterialParamsCommand';
        this.name = 'Set Sphere Material Params';
        this.updatable = true;
        this.world = this.editor.matcapEditorWorld;
        this.material = this.world.content.sphereRenderMaterial;
        this.oldParameters = {
            name: parameters.name,
            value: parameters.value,
        };
        this.parameters = parameters;
    }

    execute(): void {
        this.world.content.sphereRenderMaterial[this.parameters.name] =
            this.parameters.value;
        emitSnapshot();
    }

    undo(): void {
        this.world.content.sphereRenderMaterial[this.oldParameters.name] =
            this.oldParameters.value;
        emitSnapshot();
    }
}

export { SetSphereMaterialParamsCommand };
