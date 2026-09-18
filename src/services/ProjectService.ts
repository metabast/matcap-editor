import events from '@/commons/Events';
import { ImportProjectCommand } from '@/commands/ImportProjectCommand';
import type { MatcapProject } from '@/ts/types/MatcapProject';
import type { History } from '@/history';
import type SceneService from '@/services/SceneService';
import type { Lights, matcapEditorStore } from '@/stores/matcapEditorStore';

type Store = ReturnType<typeof matcapEditorStore>;

/**
 * Owns the project concept: turning the store into a `MatcapProject` and back.
 * Everything it needs is handed to it by the composition root, so there is no
 * module state and no singleton to reach for — and the serialization reads the
 * store, never a pane controller.
 */
class ProjectService {
    private _scene: SceneService;

    private _history: History;

    private _store: Store;

    constructor(scene: SceneService, history: History, store: Store) {
        this._scene = scene;
        this._history = history;
        this._store = store;

        events.on('matcap:export:project', () => this.export());
        events.on('matcap:project:read', (project: MatcapProject) => this.import(project));
    }

    /**
     * Pinia's option store unwraps refs through the state type, which turns the
     * `LightModel` instances it holds into a structural lookalike. They are the
     * very same objects at runtime, so read them back under their own type.
     */
    private get lights(): Lights {
        return this._store.lights as Lights;
    }

    serialize(): MatcapProject {
        return {
            metadata: {
                version: 1,
                type: 'matcap',
            },
            sphereRenderMaterial: { ...this._store.material },
            sphereRenderAmbiant: { ...this._store.ambiant },
            lights: this.lights.map((light) => light.toSerialized()),
        };
    }

    export(): void {
        const blob = new Blob([JSON.stringify(this.serialize())], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'matcap.json';
        link.click();
        URL.revokeObjectURL(url);
    }

    import(project: MatcapProject): void {
        this.clear();
        this._history.execute(new ImportProjectCommand(this._scene, project), 'Import Project');
    }

    clear(): void {
        // Copied first: deleting a light splices it out of the store's own array.
        [...this.lights].forEach((light) => this._scene.deleteLight(light));
        this._history.clear();
    }
}

export default ProjectService;
