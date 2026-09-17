import events, { emitSnapshot } from '@/commons/Events';
import type MatcapEditorWorld from '@/matcapEditor/MatcapEditorWorld';
import type MatcapPreviewWorld from '@/matcapPreview/MatcapPreviewWorld';
import type LightModel from '@/matcapEditor/LightModel';
import type { LightModelPositions } from '@/ts/types/PanesTypes';
import type { Object3D, SpotLight } from 'three';

/**
 * Owns the two Three.js worlds and the operations that mutate them. Commands
 * depend on this rather than on the editor, so that undo/redo logic carries no
 * knowledge of the application shell.
 */
class SceneService {
    private _editorWorld: MatcapEditorWorld;

    private _previewWorld: MatcapPreviewWorld;

    constructor(editorWorld: MatcapEditorWorld, previewWorld: MatcapPreviewWorld) {
        this._editorWorld = editorWorld;
        this._previewWorld = previewWorld;
    }

    public get editorWorld() {
        return this._editorWorld;
    }

    public get previewWorld() {
        return this._previewWorld;
    }

    addLight(lightModel: LightModel) {
        this._editorWorld.scene.add(lightModel.light);

        if (lightModel.light.type === 'SpotLight') this._editorWorld.scene.add((lightModel.light as SpotLight).target);

        events.emit('matcap:editor:light:added', lightModel);
        emitSnapshot();
    }

    deleteLight(lightModel: LightModel) {
        events.emit('matcap:editor:light:remove', lightModel);
        this._editorWorld.content.deleteLight(lightModel);
    }

    // eslint-disable-next-line class-methods-use-this
    updateLightPositions(lightModel: LightModel, value: LightModelPositions) {
        events.emit('matcap:ui:light:update:current', lightModel);
        lightModel.screenPosition = value.screenPosition;
        lightModel.setPositionX(value.position.x);
        lightModel.setPositionY(value.position.y);
        lightModel.setPositionZ(value.position.z);
        lightModel.update();
        emitSnapshot();
    }

    addObject(object3d: Object3D) {
        this._previewWorld.content.addObject(object3d);
    }

    removeObject(object3d: Object3D) {
        this._previewWorld.scene.remove(object3d);
    }
}

export default SceneService;
