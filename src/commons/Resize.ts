import { Camera, PerspectiveCamera, WebGLRenderer } from 'three';

interface ResizeParameters {
    canvas: HTMLCanvasElement;
    camera: Camera;
    renderer: WebGLRenderer;
}
class Resize {
    private readonly canvas: HTMLCanvasElement;

    private readonly camera: Camera;

    private readonly renderer: WebGLRenderer;

    constructor(params: ResizeParameters) {
        this.canvas = params.canvas;
        this.camera = params.camera;
        this.renderer = params.renderer;

        // window.removeEventListener('resize', this.onResize);
        window.addEventListener('resize', (event) => {
            this.onResize(event);
        });
    }

    onResize(event: UIEvent) {
        if (this.canvas && this.camera && this.renderer) {
            const aspectRatio = window.innerWidth / window.innerHeight;

            if (this.camera instanceof PerspectiveCamera) {
                const cam: PerspectiveCamera = this.camera;
                cam.aspect = aspectRatio;
                cam.updateProjectionMatrix();
            }

            this.renderer.setSize(window.innerWidth, window.innerHeight);
            this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        }
    }
}

export default Resize;
