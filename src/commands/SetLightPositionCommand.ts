import { Command } from '@/commons/Command';
import type SceneService from '@/services/SceneService';
import type LightModel from '@/matcapEditor/LightModel';
import type { LightModelPositions, ValuesCommand } from '@/ts/types/PanesTypes';

class SetLightModelPositionCommand extends Command {
    private parameters: ValuesCommand;

    private lightModel: LightModel;

    constructor(scene: SceneService, parameters: ValuesCommand, lightModel: LightModel) {
        super(scene);
        this.type = 'SetLightModelPositionCommand';
        this.name = 'Set LightModel Position';
        this.updatable = true;
        this.parameters = parameters;
        this.lightModel = lightModel;
    }

    execute(): void {
        this.scene.updateLightPositions(this.lightModel, this.parameters.value as LightModelPositions);
    }

    undo(): void {
        this.scene.updateLightPositions(this.lightModel, this.parameters.oldValue as LightModelPositions);
    }
}

export { SetLightModelPositionCommand };
