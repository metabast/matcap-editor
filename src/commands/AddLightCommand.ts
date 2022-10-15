import { Command } from 'src/Command';
import events from 'src/commons/Events';
import type Editor from 'src/Editor';
import type LightModel from 'src/matcapEditor/LightModel';
import type MatcapEditorWorld from 'src/matcapEditor/MatcapEditorWorld';
import RenderManager from 'src/matcapEditor/RenderManager';
import type { SpotLight } from 'three';

class AddLightCommand extends Command {
    private lightModel: LightModel;

    private world: MatcapEditorWorld;

    constructor(editor: Editor, lightModel: LightModel) {
        super(editor);
        this.type = 'AddLightCommand';
        this.name = 'Add Light';
        this.updatable = true;
        this.lightModel = lightModel;
        this.world = this.editor.matcapEditorWorld;
    }

    execute() {
        this.world.scene.add(this.lightModel.light);

        if (this.lightModel.light.type === 'SpotLight')
            this.world.scene.add((this.lightModel.light as SpotLight).target);

        events.emit('matcap:editor:light:added', this.lightModel);
        RenderManager.snapshot();
    }

    undo() {
        events.emit('matcap:light:delete', this.lightModel);
    }
}

export { AddLightCommand };
