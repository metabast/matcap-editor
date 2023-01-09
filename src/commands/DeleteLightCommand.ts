import { Command } from '@/commons/Command';
import type Editor from '@/Editor';
import type LightModel from '@/matcapEditor/LightModel';

class DeleteLightCommand extends Command {
    private lightModel: LightModel;

    constructor(editor: Editor, lightModel: LightModel) {
        super(editor);
        this.type = 'DeleteLightCommand';
        this.name = 'Delete Light';
        this.updatable = true;
        this.lightModel = lightModel;
    }

    execute() {
        this.editor.deleteLight(this.lightModel);
    }

    undo() {
        this.editor.addLight(this.lightModel);
    }
}

export { DeleteLightCommand };
