import events from './Events';
import { matcapEditorStore } from '@/stores/matcapEditorStore';
import { ImportProjectCommand } from '@/commands/ImportProjectCommand';
import type { TProject } from '@/ts/types/TProject';
import type Editor from '@/Editor';

let _store: ReturnType<typeof matcapEditorStore>;

let _editor: Editor;

const createBlobURL = async (data: string, type: string) => {
    const blob = new Blob([data], { type });
    return URL.createObjectURL(blob);
};

const serializeCurrentProject = (): string =>
    JSON.stringify({
        metadata: {
            version: 1,
            type: 'matcap',
        },
        lights: _store.lights,
        sphereRenderMaterial: { ..._store.material },
        sphereRenderAmbiant: { ..._store.ambiant },
    });

const exportCurrentProject = () => {
    const blobURL = createBlobURL(serializeCurrentProject(), 'application/json');
    blobURL.then((url) => {
        const link = document.createElement('a');
        link.href = url;
        link.download = 'matcap.json';
        link.click();
    });
};

const clearCurrentProject = () => {
    _store.lights.forEach((light: any) => {
        _editor.scene.deleteLight(light);
    });
    _editor.clearHistory();
};

const importCurrentProject = (data: TProject) => {
    clearCurrentProject();
    _editor.execute(new ImportProjectCommand(_editor.scene, data));
};

const Project = {
    initialize(editor: Editor) {
        _editor = editor;
        _store = matcapEditorStore();
        events.on('matcap:export:project', exportCurrentProject);
        events.on('matcap:project:read', importCurrentProject);
    },
};

export default Project;
