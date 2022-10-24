import { BufferGeometry, Clock, Mesh, OrthographicCamera, Scene, sRGBEncoding, WebGLRenderer } from 'three';
// eslint-disable-next-line import/extensions
import { RectAreaLightUniformsLib } from 'three/examples/jsm/lights/RectAreaLightUniformsLib.js';
import { computeBoundsTree, disposeBoundsTree, acceleratedRaycast } from 'three-mesh-bvh';
import type Editor from 'src/Editor';
import StatsSingle from '../commons/Stats';
import MatcapEditorContent from './MatcapEditorContent';
import { MatcapEditorStore } from '../store';
import type { IMatcapEditorStore } from '../store';

let store: IMatcapEditorStore;
MatcapEditorStore.subscribe((value) => {
    store = value;
});

BufferGeometry.prototype.computeBoundsTree = computeBoundsTree;
BufferGeometry.prototype.disposeBoundsTree = disposeBoundsTree;
Mesh.prototype.raycast = acceleratedRaycast;
// eslint-disable-next-line import/extensions

class MatcapEditorWorld {
    private _editor: Editor;

    canvas: HTMLCanvasElement;

    scene: Scene;

    camera: OrthographicCamera;

    stats: StatsSingle;

    renderer: WebGLRenderer;

    clock: Clock;

    content: MatcapEditorContent;

    halfSize: number;

    constructor(editor: Editor) {
        this._editor = editor;
        this._editor.matcapEditorWorld = this;
    }

    public get editor() {
        return this._editor;
    }

    init() {
        this.stats = new StatsSingle();

        this.canvas = document.querySelector('canvas.webgl2');
        this.scene = new Scene();
        RectAreaLightUniformsLib.init();
        this.halfSize = 0.5;
        this.camera = new OrthographicCamera(-this.halfSize, this.halfSize, this.halfSize, -this.halfSize, 0.5, 200);
        this.renderer = new WebGLRenderer({
            canvas: this.canvas,
            antialias: true,
        });
        this.renderer.outputEncoding = sRGBEncoding;
        this.renderer.physicallyCorrectLights = true;

        this.renderer.setSize(store.sizes.exportDefault, store.sizes.exportDefault);
        this.renderer.setPixelRatio(1);

        this.camera.position.set(0, 0, 1);

        this.clock = new Clock();

        this.content = new MatcapEditorContent(this);

        this.tick();
    }

    tick = () => {
        this.renderer.render(this.scene, this.camera);
        this.stats.end();
        requestAnimationFrame(this.tick);
    };
}

export default MatcapEditorWorld;
