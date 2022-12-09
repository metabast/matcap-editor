import { Command } from '@/commons/Command';
import type Editor from '@/Editor';
import type LightModel from '@/matcapEditor/LightModel';

class AddLightCommand extends Command {
    private lightModel: LightModel;

    constructor(editor: Editor, lightModel: LightModel) {
        super(editor);
        this.type = 'AddLightCommand';
        this.name = 'Add Light';
        this.updatable = true;
        this.lightModel = lightModel;
    }

    execute() {
        this.editor.addLight(this.lightModel);
    }

    undo() {
        this.editor.deleteLight(this.lightModel);
    }
}

export { AddLightCommand };
