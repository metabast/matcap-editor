import events from './commons/Events';
import bindKeyboardShortcuts from './commons/KeyboardShortcuts';
import { Loader } from './commons/Loader';
import { History } from './history';
import MatcapEditorWorld from './matcapEditor/MatcapEditorWorld';
import MatcapPreviewWorld from './matcapPreview/MatcapPreviewWorld';
import RenderManager from './matcapEditor/RenderManager';
import ProjectService from '@/services/ProjectService';
import SceneService from '@/services/SceneService';
import { matcapEditorStore } from '@/stores/matcapEditorStore';
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

    private _project: ProjectService;

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

        // Dev-only console handle. Vite folds `import.meta.env.DEV` to false in a
        // production build, so this leaves nothing on globalThis there. The
        // browser harness reads the rendered material through it.
        if (import.meta.env.DEV) {
            (globalThis as any).matcapEditor = { editorWorld, previewWorld, scene: this._scene };
        }

        this._project = new ProjectService(this._scene, this._history, matcapEditorStore());

        bindKeyboardShortcuts(this._history);

        events.emit('matcap:editor:ready', this);
    }

    /**
     * Detaches every bus subscription this editor owns and frees the singleton
     * slot, so that a second editor can be built on the same page. Without it
     * the listeners of a discarded editor keep answering — and keep it alive.
     */
    public dispose(): void {
        this._scene.editorWorld.dispose();
        this._scene.previewWorld.dispose();
        RenderManager.dispose();
        this._project.dispose();
        this._loader.dispose();
        if (import.meta.env.DEV) {
            Reflect.deleteProperty(globalThis, 'matcapEditor');
        }
        Editor._instance = undefined;
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

    // Guard against a second editor. There is no public accessor: every
    // collaborator receives what it needs from the composition root.
    private static _instance?: Editor;

    /** The one construction path, called by the composition root in main.ts. */
    public static bootstrap(): Editor {
        return new Editor();
    }
}

export default Editor;
