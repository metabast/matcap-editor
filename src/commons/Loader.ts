import type Editor from '@/Editor.js';
import events from './Events';
import { EVENT_FILES_DROPPED } from './Constants';
import { AddObjectCommand } from '@/commands/AddObjectCommand';

type JSON_Matcap = {
    metadata: {
        type: string;
    };
};


class Loader {

    private _editor: Editor;

    constructor(editor: Editor) {
        this._editor = editor;
        events.on(EVENT_FILES_DROPPED, this.onFilesDropped.bind(this));
    }

    public onFilesDropped(files: File[]): void {

        if (files.length > 0) {
            for (let i = 0; i < files.length; i++) {
                this.loadFile(files[i]);
            }
        }
    }

    private onReaderProgress(event: ProgressEvent): void {
        const size = '(' + Math.floor(event.total / 1000) + ' KB)';
        const progress = Math.floor((event.loaded / event.total) * 100) + '%';
        console.log('Loading', size, progress);
    }

    private loadFile(file: File): void {

        const filename = file.name;
        if (!file.name || file.name.indexOf('.') === -1) return;
        const extension = filename.split('.')?.pop()?.toLowerCase();

        const reader = new FileReader();
        reader.addEventListener('progress', this.onReaderProgress.bind(this), false);

        switch (extension) {

            case 'glb':

                reader.addEventListener('load', this.onGLBLoaded.bind(this), false);
                reader.readAsArrayBuffer(file);

                break;

            case 'json':

                reader.addEventListener('load', () => {



                }, false);
                reader.readAsText(file);

                break;

            default:

                console.error('Unsupported file format (' + extension + ').');

                break;

        }

    }

    private async onGLBLoaded(event: ProgressEvent<FileReader>) {
        const contents: ArrayBuffer = (event.target as FileReader).result as ArrayBuffer;

        const { DRACOLoader } = await import('three/examples/jsm/loaders/DRACOLoader.js');
        const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js');

        const dracoLoader = new DRACOLoader();
        dracoLoader.setDecoderPath('../examples/js/libs/draco/gltf/');

        const loader = new GLTFLoader();
        loader.setDRACOLoader(dracoLoader);
        loader.parse(contents, '', (result) => {
            this._editor.execute(new AddObjectCommand(this._editor, result.scene));
        });
    }

    private onJSONLoaded(event: ProgressEvent<FileReader>) {

        const contents = (event.target as FileReader).result as string;
        let data;
        try {
            data = JSON.parse(contents);
        } catch (error) {
            alert(error);
            return;
        }

        this.handleJSON(data);
    }

    private handleJSON = (data: JSON_Matcap) => {
        // TODO: add JSON Matcap validation
        switch (data.metadata.type.toLowerCase()) {
            case 'matcap':
                events.emit('matcap:project:read', data);
                break;
        }
    };
}

export { Loader };