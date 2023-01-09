import { Command } from '@/commons/Command';
import type Editor from '@/Editor';
import type LightModel from '@/matcapEditor/LightModel';
import type { LightModelPositions, ValuesCommand } from '@/ts/types/PanesTypes';

class SetLightModelPositionCommand extends Command {
    private parameters: ValuesCommand;

    private lightModel: LightModel;

    constructor(editor: Editor, parameters: ValuesCommand, lightModel: LightModel) {
        super(editor);
        this.type = 'SetLightModelPositionCommand';
        this.name = 'Set LightModel Position';
        this.updatable = true;
        this.parameters = parameters;
        this.lightModel = lightModel;
    }

    execute(): void {
        this.editor.updateLightPositions(this.lightModel, this.parameters.value as LightModelPositions);
    }

    undo(): void {
        this.editor.updateLightPositions(this.lightModel, this.parameters.oldValue as LightModelPositions);
    }
}

export { SetLightModelPositionCommand };
