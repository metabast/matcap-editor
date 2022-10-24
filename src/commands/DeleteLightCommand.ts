import { Command } from 'src/Command';
import type Editor from 'src/Editor';
import type LightModel from 'src/matcapEditor/LightModel';

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
