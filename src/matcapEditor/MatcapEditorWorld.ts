import { BufferGeometry, Clock, Mesh, OrthographicCamera, Scene, WebGLRenderer } from 'three';
import { RectAreaLightUniformsLib } from 'three/examples/jsm/lights/RectAreaLightUniformsLib.js';
import { computeBoundsTree, disposeBoundsTree, acceleratedRaycast, MeshBVH } from 'three-mesh-bvh';
import Editor from '@/Editor';
import StatsSingle from '@/commons/Stats';
import MatcapEditorContent from '@/matcapEditor/MatcapEditorContent';
import { matcapEditorStore } from '@/stores/matcapEditorStore';

(BufferGeometry.prototype as any).computeBoundsTree = computeBoundsTree;
(BufferGeometry.prototype as any).disposeBoundsTree = disposeBoundsTree;
Mesh.prototype.raycast = acceleratedRaycast;

class MatcapEditorWorld {
    private _store: any;
    private _editor: Editor;

    canvas: HTMLCanvasElement;

    scene: Scene;

    camera: OrthographicCamera;

    stats: StatsSingle;

    renderer: WebGLRenderer;

    clock: Clock;

    content: MatcapEditorContent;

    halfSize: number;

    constructor() {
        this._store = matcapEditorStore();
        this._editor = Editor.instance;
        this.stats = new StatsSingle();

        this.canvas = document.querySelector('canvas.webgl2') as HTMLCanvasElement;
        this.scene = new Scene();
        RectAreaLightUniformsLib.init();
        this.halfSize = 0.5;
        this.camera = new OrthographicCamera(-this.halfSize, this.halfSize, this.halfSize, -this.halfSize, 0.5, 200);
        this.renderer = new WebGLRenderer({
            canvas: this.canvas,
            antialias: true,
        });

        this.renderer.setSize(this._store.sizes.exportDefault, this._store.sizes.exportDefault);
        this.renderer.setPixelRatio(1);

        this.camera.position.set(0, 0, 1);

        this.clock = new Clock();

        this.content = new MatcapEditorContent(this);

        this.tick();
    }

    public get editor() {
        return this._editor;
    }

    tick = () => {
        this.renderer.render(this.scene, this.camera);
        this.stats.end();
        requestAnimationFrame(this.tick);
    };
}

export default MatcapEditorWorld;
