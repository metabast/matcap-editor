import * as THREE from 'three';

import { TGALoader } from 'three/examples/jsm/loaders/TGALoader.js';

// import { AddObjectCommand } from '../commands/AddObjectCommand.js';
// import { SetSceneCommand } from '../commands/SetSceneCommand.js';

import { LoaderUtils, type IHashFiles } from './LoaderUtils';

// import { unzipSync, strFromU8 } from 'fflate';
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

            // case 'dae':

            //     {

            //         reader.addEventListener('load', async function (event) {

            //             const contents = event.target.result;

            //             const { ColladaLoader } = await import('three/examples/jsm/loaders/ColladaLoader.js');

            //             const loader = new ColladaLoader(manager);
            //             const collada = loader.parse(contents);

            //             collada.scene.name = filename;

            // this._editor.execute(new AddObjectCommand(editor, collada.scene));

            //         }, false);
            //         reader.readAsText(file);

            //         break;

            //     }

            // case 'fbx':

            //     {

            //         reader.addEventListener('load', async function (event) {

            //             const contents = event.target.result;

            //             const { FBXLoader } = await import('three/examples/jsm/loaders/FBXLoader.js');

            //             const loader = new FBXLoader(manager);
            //             const object = loader.parse(contents);

            // this._editor.execute(new AddObjectCommand(editor, object));

            //         }, false);
            //         reader.readAsArrayBuffer(file);

            //         break;

            //     }

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


            // case 'gltf':

            //     {

            //         reader.addEventListener('load', async function (event) {

            //             const contents = event.target.result;

            //             let loader;

            //             if (isGLTF1(contents)) {

            //                 alert('Import of glTF asset not possible. Only versions >= 2.0 are supported. Please try to upgrade the file to glTF 2.0 using glTF-Pipeline.');

            //             } else {

            //                 const { DRACOLoader } = await import('three/examples/jsm/loaders/DRACOLoader.js');
            //                 const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js');

            //                 const dracoLoader = new DRACOLoader();
            //                 dracoLoader.setDecoderPath('../examples/js/libs/draco/gltf/');

            //                 loader = new GLTFLoader(manager);
            //                 loader.setDRACOLoader(dracoLoader);

            //             }

            //             loader.parse(contents, '', function (result) {

            //                 const scene = result.scene;
            //                 scene.name = filename;

            //                 scene.animations.push(...result.animations);
            // this._editor.execute(new AddObjectCommand(editor, scene));

            //             });

            //         }, false);
            //         reader.readAsArrayBuffer(file);

            //         break;

            //     }

            // case 'js':
            // case 'json':

            //     {

            //         reader.addEventListener('load', function (event) {

            //             const contents = event.target.result;

            //             // 2.0

            //             if (contents.indexOf('postMessage') !== - 1) {

            //                 const blob = new Blob([contents], { type: 'text/javascript' });
            //                 const url = URL.createObjectURL(blob);

            //                 const worker = new Worker(url);

            //                 worker.onmessage = function (event) {

            //                     event.data.metadata = { version: 2 };
            //                     handleJSON(event.data);

            //                 };

            //                 worker.postMessage(Date.now());

            //                 return;

            //             }

            //             // >= 3.0

            //             let data;

            //             try {

            //                 data = JSON.parse(contents);

            //             } catch (error) {

            //                 alert(error);
            //                 return;

            //             }

            //             handleJSON(data);

            //         }, false);
            //         reader.readAsText(file);

            //         break;

            //     }

            // case 'obj':

            //     {

            //         reader.addEventListener('load', async function (event) {

            //             const contents = event.target.result;

            //             const { OBJLoader } = await import('three/examples/jsm/loaders/OBJLoader.js');

            //             const object = new OBJLoader().parse(contents);
            //             object.name = filename;

            // this._editor.execute(new AddObjectCommand(editor, object));

            //         }, false);
            //         reader.readAsText(file);

            //         break;

            //     }

            // case 'zip':

            //     {

            //         reader.addEventListener('load', function (event) {

            //             handleZIP(event.target.result);

            //         }, false);
            //         reader.readAsArrayBuffer(file);

            //         break;

            //     }

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

            case 'buffergeometry':

                {

                    const loader = new THREE.BufferGeometryLoader();
                    const result = loader.parse(data);

                    const mesh = new THREE.Mesh(result);

                    // this._editor.execute(new AddObjectCommand(this._editor, mesh));

                    break;

                }

            case 'geometry':

                console.error('Loader: "Geometry" is no longer supported.');

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

    // async function handleZIP(contents) {

    //     const zip = unzipSync(new Uint8Array(contents));

    //     // Poly

    //     if (zip['model.obj'] && zip['materials.mtl']) {

    //         const { MTLLoader } = await import('three/examples/jsm/loaders/MTLLoader.js');
    //         const { OBJLoader } = await import('three/examples/jsm/loaders/OBJLoader.js');

    //         const materials = new MTLLoader().parse(strFromU8(zip['materials.mtl']));
    //         const object = new OBJLoader().setMaterials(materials).parse(strFromU8(zip['model.obj']));
    // this._editor.execute(new AddObjectCommand(editor, object));

    //     }

    //     //

    //     for (const path in zip) {

    //         const file = zip[path];

    //         const manager = new THREE.LoadingManager();
    //         manager.setURLModifier(function (url) {

    //             const file = zip[url];

    //             if (file) {

    //                 console.log('Loading', url);

    //                 const blob = new Blob([file.buffer], { type: 'application/octet-stream' });
    //                 return URL.createObjectURL(blob);

    //             }

    //             return url;

    //         });

    //         const extension = path.split('.').pop().toLowerCase();

    //         switch (extension) {

    //             case 'fbx':

    //                 {

    //                     const { FBXLoader } = await import('three/examples/jsm/loaders/FBXLoader.js');

    //                     const loader = new FBXLoader(manager);
    //                     const object = loader.parse(file.buffer);

    // this._editor.execute(new AddObjectCommand(editor, object));

    //                     break;

    //                 }

    //             case 'glb':

    //                 {

    //                     const { DRACOLoader } = await import('three/examples/jsm/loaders/DRACOLoader.js');
    //                     const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js');

    //                     const dracoLoader = new DRACOLoader();
    //                     dracoLoader.setDecoderPath('../examples/js/libs/draco/gltf/');

    //                     const loader = new GLTFLoader();
    //                     loader.setDRACOLoader(dracoLoader);

    //                     loader.parse(file.buffer, '', function (result) {

    //                         const scene = result.scene;

    //                         scene.animations.push(...result.animations);
    // this._editor.execute(new AddObjectCommand(editor, scene));

    //                     });

    //                     break;

    //                 }

    //             case 'gltf':

    //                 {

    //                     const { DRACOLoader } = await import('three/examples/jsm/loaders/DRACOLoader.js');
    //                     const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js');

    //                     const dracoLoader = new DRACOLoader();
    //                     dracoLoader.setDecoderPath('../examples/js/libs/draco/gltf/');

    //                     const loader = new GLTFLoader(manager);
    //                     loader.setDRACOLoader(dracoLoader);
    //                     loader.parse(strFromU8(file), '', function (result) {

    //                         const scene = result.scene;

    //                         scene.animations.push(...result.animations);
    // this._editor.execute(new AddObjectCommand(editor, scene));

    //                     });

    //                     break;

    //                 }

    //         }

    //     }

    // }

    isGLTF1(contents) {

        let resultContent;

        if (typeof contents === 'string') {

            // contents is a JSON string
            resultContent = contents;

        } else {

            const magic = THREE.LoaderUtils.decodeText(new Uint8Array(contents, 0, 4));

            if (magic === 'glTF') {

                // contents is a .glb file; extract the version
                const version = new DataView(contents).getUint32(4, true);

                return version < 2;

            } else {

                // contents is a .gltf file
                resultContent = THREE.LoaderUtils.decodeText(new Uint8Array(contents));

            }

        }

        const json = JSON.parse(resultContent);

        return (json.asset != undefined && json.asset.version[0] < 2);

    }

}

export { Loader };