import type Editor from 'src/Editor';
import { Clock, PerspectiveCamera, Scene, sRGBEncoding, Vector2, WebGLRenderer } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import Resize from '../commons/Resize';
import StatsSingle from '../commons/Stats';
import MatcapEditorContent from './MatcapPreviewContent';

import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { OutlinePass } from 'three/examples/jsm/postprocessing/OutlinePass.js';

class MatcapPreviewWorld {
    private _editor: Editor;

    canvas: HTMLCanvasElement;

    scene: Scene;

    camera: PerspectiveCamera;

    stats: StatsSingle;

    renderer: WebGLRenderer;

    control: OrbitControls;

    clock: Clock;

    resize: Resize;

    content: MatcapEditorContent;

    composer: EffectComposer;

    outlinePass: OutlinePass;


    constructor(editor: Editor) {
        this._editor = editor;
    }

    public get editor() {
        return this._editor;
    }

    init() {
        this.stats = new StatsSingle();

        this.canvas = document.querySelector('canvas.webgl') as HTMLCanvasElement;
        this.scene = new Scene();
        this.camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        // scene.background = new THREE.Color(0xffffff);
        this.renderer = new WebGLRenderer({
            canvas: this.canvas,
            antialias: true,
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.outputEncoding = sRGBEncoding;

        this.control = new OrbitControls(this.camera, this.renderer.domElement);
        this.control.enableDamping = true;
        this.camera.position.set(0, 0, 4);

        this.clock = new Clock();

        this.content = new MatcapEditorContent(this);

        this.resize = new Resize({
            canvas: this.canvas,
            camera: this.camera,
            renderer: this.renderer,
        });

        this.composer = new EffectComposer(this.renderer);

        const renderPass = new RenderPass(this.scene, this.camera);
        this.composer.addPass(renderPass);

        this.outlinePass = new OutlinePass(new Vector2(window.innerWidth, window.innerHeight), this.scene, this.camera);
        this.composer.addPass(this.outlinePass);

        this.tick();
    }

    tick = () => {
        this.stats.begin();
        this.control.update();
        this.content.update(this.clock);
        this.renderer.render(this.scene, this.camera);
        this.composer.render();
        requestAnimationFrame(this.tick);
    };
}

export default MatcapPreviewWorld;
