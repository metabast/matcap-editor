import type { SpotLight } from 'three';
import type { Command } from './commons/Command';
import events, { emitSnapshot } from './commons/Events';
import { debounce } from './commons/Utils';
import { History } from './history';
import type LightModel from './matcapEditor/LightModel';
import MatcapEditorWorld from './matcapEditor/MatcapEditorWorld';
import MatcapPreviewWorld from './matcapPreview/MatcapPreviewWorld';
import type { LightModelPositions } from './ts/types/PanesTypes';

class Editor {
    private _history: History;

    private _matcapEditorWorld: MatcapEditorWorld;

    private _matcapPreviewWorld: MatcapPreviewWorld;

    constructor() {
        this._history = new History(this);

        this._matcapPreviewWorld = new MatcapPreviewWorld(this);
        this._matcapPreviewWorld.init();
        this._matcapEditorWorld = new MatcapEditorWorld(this);
        this._matcapEditorWorld.init();

        document.addEventListener(
            'keydown',
            debounce(this.onKeydown.bind(this), 100),
        );
    }

    private onKeydown(event: KeyboardEvent) {
        switch (event.key.toLowerCase()) {
            case 'z':
                if (event.ctrlKey) {
                    event.preventDefault(); // Prevent browser specific hotkeys

                    if (event.shiftKey) {
                        this.redo();
                    } else {
                        this.undo();
                    }
                }

                break;

            default:
                break;
        }
    }

    public get matcapEditorWorld() {
        return this._matcapEditorWorld;
    }

    public get matcapPreviewWorld() {
        return this._matcapPreviewWorld;
    }

    addLight(lightModel: LightModel) {
        this._matcapEditorWorld.scene.add(lightModel.light);

        if (lightModel.light.type === 'SpotLight')
            this._matcapEditorWorld.scene.add((lightModel.light as SpotLight).target);

        events.emit('matcap:editor:light:added', lightModel);
        emitSnapshot();
    }

    deleteLight(lightModel: LightModel) {
        this._matcapEditorWorld.content.deleteLight(lightModel);
    }

    updateLightPositions(lightModel: LightModel, value: LightModelPositions) {
        events.emit('matcap:ui:light:update:current', lightModel);
        lightModel.screenPosition = value.screenPosition;
        lightModel.setPositionX(value.position.x);
        lightModel.setPositionY(value.position.y);
        lightModel.setPositionZ(value.position.z);
        lightModel.update();
        emitSnapshot();
    }

    execute(cmd: Command, optionalName?: string) {
        this._history.execute(cmd, optionalName as string);
    }

    undo() {
        this._history.undo();
    }

    redo() {
        this._history.redo();
    }
}

export default Editor;
