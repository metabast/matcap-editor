import { Command } from '@/commons/Command';
import type SceneService from '@/services/SceneService';
import type LightModel from '@/matcapEditor/LightModel';

class DeleteLightCommand extends Command {
    private lightModel: LightModel;

    constructor(scene: SceneService, lightModel: LightModel) {
        super(scene);
        this.type = 'DeleteLightCommand';
        this.name = 'Delete Light';
        this.updatable = true;
        this.lightModel = lightModel;
    }

    execute() {
        this.scene.deleteLight(this.lightModel);
    }

    undo() {
        this.scene.addLight(this.lightModel);
    }
}

export { DeleteLightCommand };
