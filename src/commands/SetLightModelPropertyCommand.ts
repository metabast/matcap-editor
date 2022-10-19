import { Command } from 'src/Command';
import { emitSnapshot } from 'src/commons/Events';
import type Editor from 'src/Editor';
import LightModel from 'src/matcapEditor/LightModel';
import type { ValuesCommand, ValuesPaneCtrl } from 'src/types/PanesTypes';
import type { Vector3 } from 'three';
import type { Pane } from 'tweakpane';

type PropertiesAllowed = 'distance' | 'lookAtTarget' | 'front' | 'positionTarget';
type SelectedTypes = number | boolean | Vector3;
class SetLightModelPropertyCommand extends Command {
    private parameters: ValuesCommand;

    private lightModel: LightModel;

    private pane: Pane;

    private paneCtrl: ValuesPaneCtrl;

    constructor(
        editor: Editor,
        parameters: ValuesCommand,
        lightModel: LightModel,
        pane: Pane,
        paneCtrl: ValuesPaneCtrl,
    ) {
        super(editor);
        this.type = 'SetLightModelPropertyCommand';
        this.name = 'Set LightModel Property';
        this.updatable = true;
        this.parameters = parameters;
        this.pane = pane;
        this.paneCtrl = paneCtrl;
        this.lightModel = lightModel;
    }

    execute(): void {
        this.apply(this.parameters.value as SelectedTypes);
        emitSnapshot();
    }

    undo(): void {
        this.apply(this.parameters.oldValue as SelectedTypes);
        emitSnapshot();
    }

    apply(value: SelectedTypes): void {
        const name = this.parameters.name as PropertiesAllowed;
        this.paneCtrl.history = false;

        switch (name) {
            case 'distance':
                this.lightModel[name] = value as number;
                LightModel.updateLightDistance(this.lightModel);
                break;

            case 'front':
                this.lightModel[name] = value as boolean;

                LightModel.updateLightDistance(this.lightModel);
                break;

            case 'lookAtTarget':
                this.lightModel[name] = value as boolean;
                break;

            case 'positionTarget':
                this.lightModel[name] = value as Vector3;
                break;

            default:
                break;
        }
        this.paneCtrl.value = value;

        this.pane.refresh();

        this.paneCtrl.history = true;
    }
}

export { SetLightModelPropertyCommand };
