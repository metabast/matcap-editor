import events from './commons/Events';
import bindKeyboardShortcuts from './commons/KeyboardShortcuts';
import { Loader } from './commons/Loader';
import { History } from './history';
import MatcapEditorWorld from './matcapEditor/MatcapEditorWorld';
import MatcapPreviewWorld from './matcapPreview/MatcapPreviewWorld';
import Project from '@/commons/Project';
import SceneService from '@/services/SceneService';
import type { Command } from './commons/Command';

/**
 * Application shell. It composes the services and, for now, forwards to them so
 * that existing call sites keep working; the forwarding disappears once callers
 * receive the services they actually need (MATC-8b).
 */
class Editor {
    private _history: History;

    private _scene: SceneService;

    private _loader: Loader;

    constructor() {
        // Singleton control
        if (Editor._instance) {
            throw new Error('Cannot initialize singleton class using new');
        }
        Editor._instance = this;

        this._loader = new Loader(this);
        this._history = new History();

        const previewWorld = new MatcapPreviewWorld(this);
        const editorWorld = new MatcapEditorWorld(this);
        this._scene = new SceneService(editorWorld, previewWorld);

        (globalThis as any).matcapPreviewWorld = previewWorld;
        (globalThis as any).matcapEditorWorld = editorWorld;
        Project.initialize(this);

        bindKeyboardShortcuts(this._history);

        events.emit('matcap:editor:ready', this);
    }

    public get scene() {
        return this._scene;
    }

    public get matcapEditorWorld() {
        return this._scene.editorWorld;
    }

    public get matcapPreviewWorld() {
        return this._scene.previewWorld;
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
    private static _instance: Editor;

    /** The one construction path, called by the composition root in main.ts. */
    public static bootstrap(): Editor {
        return new Editor();
    }

    /**
     * Accessor only: the editor is built by the composition root in main.ts.
     * Reading this before that point is a module evaluation order bug.
     */
    public static get instance(): Editor {
        if (!Editor._instance) {
            throw new Error('Editor is not initialized yet');
        }

        return Editor._instance;
    }
}

export default Editor;
