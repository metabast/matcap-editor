import {
    Clock,
    PerspectiveCamera,
    Scene,
    sRGBEncoding,
    WebGLRenderer,
} from 'three';
// eslint-disable-next-line import/extensions
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import Resize from '../commons/Resize';
import StatsSingle from '../commons/Stats';
import MatcapEditorContent from './MatcapPreviewContent';
// eslint-disable-next-line import/extensions

class MatcapPreviewWorld {
    canvas: HTMLCanvasElement;

    scene: Scene;

    camera: PerspectiveCamera;

    stats: StatsSingle;

    renderer: WebGLRenderer;

    control: OrbitControls;

    clock: Clock;

    resize: Resize;

    content: MatcapEditorContent;

    init() {
        this.stats = new StatsSingle();

        this.canvas = document.querySelector('canvas.webgl');
        this.scene = new Scene();
        this.camera = new PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000,
        );
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

        this.tick();
    }

    tick = () => {
        this.stats.begin();
        this.control.update();
        this.content.update(this.clock);
        this.renderer.render(this.scene, this.camera);
        requestAnimationFrame(this.tick);
    };
}

export default MatcapPreviewWorld;
