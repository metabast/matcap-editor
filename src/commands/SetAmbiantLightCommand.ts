import { Command } from '@/commons/Command';
import { emitSnapshot } from '@/commons/Events';
import type SceneService from '@/services/SceneService';
import type { ValuesCommand } from '@/ts/types/PanesTypes';

type PropertiesAllowed = 'intensity' | 'color';

class SetAmbiantLightCommand extends Command {
    private parameters: ValuesCommand;

    constructor(scene: SceneService, parameters: ValuesCommand) {
        super(scene);
        this.type = 'SetAmbiantLightCommand';
        this.name = 'Set ambientLight Params';
        this.updatable = true;
        this.parameters = parameters;
    }

    execute(): void {
        this.apply(this.parameters.value as number | string);
        emitSnapshot();
    }

    undo(): void {
        this.apply(this.parameters.oldValue as number | string);
        emitSnapshot();
    }

    apply(value: number | string): void {
        this.scene.setAmbiantParam(this.parameters.name as PropertiesAllowed, value);
    }
}

export { SetAmbiantLightCommand };
