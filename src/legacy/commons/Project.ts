import type Editor from '@/legacy/Editor';
import type { TProject } from '@/ts/types/TProject';
import events from '@/legacy/commons/Events';
import { matcapEditorStore } from '@/stores/matcapEditorStore';
import { ImportProjectCommand } from '@/legacy/commands/ImportProjectCommand';
import SphereMaterialPaneFolderCtrl from '@/legacy/matcapEditor/panes/SphereMaterialPaneFolderCtrl';
import SphereAmbiantPaneFolder from '@/legacy/matcapEditor/panes/SphereAmbiantPaneFolder';

let _store: ReturnType<typeof matcapEditorStore>;

let _editor: Editor;

const createBlobURL = async (data: string, type: string) => {
    const blob = new Blob([data], { type });
    return URL.createObjectURL(blob);
};

const serializeCurrentProject = (): string => {
    return JSON.stringify({
        metadata: {
            version: 1,
            type: 'matcap',
        },
        lights: _store.lights,
        sphereRenderMaterial: SphereMaterialPaneFolderCtrl.instance.serializedParams,
        sphereRenderAmbiant: SphereAmbiantPaneFolder.instance.serializedParams,
    });
};

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
        _editor.deleteLight(light);
    });
    _editor.clearHistory();
};

const importCurrentProject = (data) => {
    clearCurrentProject();
    _editor.execute(new ImportProjectCommand(_editor, data));
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