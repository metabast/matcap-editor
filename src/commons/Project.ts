import type Editor from '@/Editor';
import events from './Events';
import { matcapEditorStore } from '@/stores/matcapEditorStore';
import LightModel from '@/matcapEditor/LightModel';
import { AddLightCommand } from '@/commands';

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
    data.lights.forEach((light: any) => {
        const lightModel = LightModel.createFromSerialized(light);
        _editor.execute(new AddLightCommand(_editor, lightModel));
    });
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