import * as THREE from 'three';

import { TGALoader } from 'three/examples/jsm/loaders/TGALoader.js';

import { LoaderUtils, type IHashFiles } from './LoaderUtils';

import type Editor from '@/Editor.js';
import type { LoadingManager } from 'three';
import events from './Events';
import { EVENT_FILES_DROPPED } from './Constants';
import { AddObjectCommand } from '@/commands/AddObjectCommand';

class Loader {

    private _editor: Editor;

    private _texturePath: string = '';



    constructor(editor: Editor) {
        this._editor = editor;
        events.on(EVENT_FILES_DROPPED, this.onFilesDropped);
    }

    onFilesDropped = (files: string[]) => {

        this.loadFiles(files);

    };

    loadFiles = (files: File[], filesMap: IHashFiles) => {
        console.log(files);

        if (files.length > 0) {

            filesMap = filesMap || LoaderUtils.createFilesMap(files);

            const manager = new THREE.LoadingManager();
            manager.setURLModifier(function (url) {

                url = url.replace(/^(\.?\/)/, ''); // remove './'

                const file = filesMap[url];

                if (file) {

                    return URL.createObjectURL(file);

                }

                return url;

            });

            manager.addHandler(/\.tga$/i, new TGALoader());

            for (let i = 0; i < files.length; i++) {

                this.loadFile(files[i], manager);

            }

        }

    };

    loadFile = (file: File, manager: LoadingManager) => {

        const filename = file.name;
        const extension = filename.split('.').pop().toLowerCase();

        const reader = new FileReader();
        reader.addEventListener('progress', function (event) {

            const size = '(' + Math.floor(event.total / 1000) + ' KB)';
            const progress = Math.floor((event.loaded / event.total) * 100) + '%';

        });

        switch (extension) {

            case 'glb':

                reader.addEventListener('load', async (event) => {

                    const contents = event.target.result;

                    const { DRACOLoader } = await import('three/examples/jsm/loaders/DRACOLoader.js');
                    const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js');

                    const dracoLoader = new DRACOLoader();
                    dracoLoader.setDecoderPath('../examples/js/libs/draco/gltf/');

                    const loader = new GLTFLoader();
                    loader.setDRACOLoader(dracoLoader);
                    loader.parse(contents, '', (result) => {

                        const scene = result.scene;
                        scene.name = filename;

                        // scene.animations.push(...result.animations);
                        this._editor.execute(new AddObjectCommand(this._editor, scene));

                    });

                }, false);
                reader.readAsArrayBuffer(file);

                break;

            case 'json':

                {

                    reader.addEventListener('load', (event) => {

                        const contents = event.target.result;

                        let data;

                        try {

                            data = JSON.parse(contents);

                        } catch (error) {

                            alert(error);
                            return;

                        }

                        this.handleJSON(data);

                    }, false);
                    reader.readAsText(file);

                    break;

                }

            default:

                console.error('Unsupported file format (' + extension + ').');

                break;

        }

    };

    handleJSON = (data) => {

        if (data.metadata === undefined) { // 2.0

            data.metadata = { type: 'Geometry' };

        }

        if (data.metadata.type === undefined) { // 3.0

            data.metadata.type = 'Geometry';

        }

        if (data.metadata.formatVersion !== undefined) {

            data.metadata.version = data.metadata.formatVersion;

        }

        switch (data.metadata.type.toLowerCase()) {

            case 'matcap':
                events.emit('matcap:project:read', data);
                break;

            case 'object':

                {

                    const loader = new THREE.ObjectLoader();
                    loader.setResourcePath(this.texturePath);

                    loader.parse(data, function (result) {

                        if (result.isScene) {

                            // this._editor.execute(new SetSceneCommand(this._editor, result));

                        } else {

                            // this._editor.execute(new AddObjectCommand(this._editor, result));

                        }

                    });

                    break;

                }

            case 'app':

                this._editor.fromJSON(data);

                break;

        }

    };
}

export { Loader };