import { Command } from '@/commons/Command';
import type SceneService from '@/services/SceneService';
import type LightModel from '@/matcapEditor/LightModel';

class AddLightCommand extends Command {
    private lightModel: LightModel;

    constructor(scene: SceneService, lightModel: LightModel) {
        super(scene);
        this.type = 'AddLightCommand';
        this.name = 'Add Light';
        this.updatable = true;
        this.lightModel = lightModel;
    }

    execute() {
        this.scene.addLight(this.lightModel);
    }

    undo() {
        this.scene.deleteLight(this.lightModel);
    }
}

export { AddLightCommand };
