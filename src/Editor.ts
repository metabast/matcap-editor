import type { Object3D, SpotLight } from 'three';
import type { Command } from './commons/Command';
import events, { emitSnapshot } from './commons/Events';
import { Loader } from './commons/Loader';
import { debounce } from './commons/Utils';
import { History } from './history';
import type LightModel from './matcapEditor/LightModel';
import MatcapEditorWorld from './matcapEditor/MatcapEditorWorld';
import MatcapPreviewWorld from './matcapPreview/MatcapPreviewWorld';
import type { LightModelPositions } from './ts/types/PanesTypes';
import Project from '@/commons/Project';
import { matcapEditorStore } from '@/stores/matcapEditorStore';

interface IEditor {
    matcapEditorWorld: MatcapEditorWorld;
    matcapPreviewWorld: MatcapPreviewWorld;
    loader: Loader;
    matcapEditorStore: any;
}
class Editor implements IEditor {
    private _history: History;

    private _matcapEditorWorld: MatcapEditorWorld;

    private _matcapPreviewWorld: MatcapPreviewWorld;

    private _loader: Loader;

    private _matcapEditorStore: any;

    public get loader() {
        return this._loader;
    }

    constructor() {

        //Singleton control
        if (Editor._instance) {
            throw new Error('Cannot initialize singleton class using new');
        }
        Editor._instance = this;


        this._loader = new Loader(this);
        this._history = new History(this);
        this._matcapEditorStore = matcapEditorStore();

        this._matcapPreviewWorld = new MatcapPreviewWorld(this);
        this._matcapPreviewWorld.init();
        this._matcapEditorWorld = new MatcapEditorWorld();
        this._matcapEditorWorld.init();
        globalThis.matcapPreviewWorld = this._matcapPreviewWorld;
        globalThis.matcapEditorWorld = this._matcapEditorWorld;
        Project.initialize(this);

        document.addEventListener(
            'keydown',
            debounce(this.onKeydown.bind(this), 100),
        );

        events.emit('matcap:editor:ready', this);
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

    public get matcapEditorStore() {
        return this._matcapEditorStore;
    }

    addLight(lightModel: LightModel) {
        this._matcapEditorWorld.scene.add(lightModel.light);

        if (lightModel.light.type === 'SpotLight')
            this._matcapEditorWorld.scene.add((lightModel.light as SpotLight).target);

        events.emit('matcap:editor:light:added', lightModel);
        emitSnapshot();
    }

    deleteLight(lightModel: LightModel) {
        events.emit('matcap:editor:light:remove', lightModel);
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

    addObject(object3d: Object3D) {
        this._matcapPreviewWorld.content.addObject(object3d);
    }

    removeObject(object3d: Object3D) {
        this._matcapPreviewWorld.scene.remove(object3d);
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

    clearHistory() {
        this._history.clear();
    }

    // SINGLETON
    private static _instance: IEditor;
    public static get instance(): Editor {
        if (!Editor._instance) {
            new Editor();
        }

        return Editor._instance as Editor;
    }
}

export default Editor;
