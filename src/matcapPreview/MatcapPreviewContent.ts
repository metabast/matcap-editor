import events from 'src/commons/Events';
import {
    Clock,
    Mesh,
    MeshMatcapMaterial,
    Texture,
    TextureLoader,
    TorusKnotGeometry,
} from 'three';
import type MatcapEditorWorld from './MatcapPreviewWorld';

class MatcapPreviewContent {
    private world: MatcapEditorWorld;

    private matcapLoader: TextureLoader;

    private torusKnotMaterial: MeshMatcapMaterial;

    private torusKnot: Mesh;

    constructor(world: MatcapEditorWorld) {
        this.world = world;

        const torusKnotGeometry = new TorusKnotGeometry(0.5, 0.1, 256, 32);
        this.torusKnotMaterial = new MeshMatcapMaterial();
        this.torusKnotMaterial.color.setScalar(0);

        this.matcapLoader = new TextureLoader();
        this.torusKnot = new Mesh(torusKnotGeometry, this.torusKnotMaterial);
        this.world.scene.add(this.torusKnot);

        events.on('matcap:updateFromEditor', this.onmatcapUpdated);
    }

    private onmatcapUpdated = (matcapURL: { url: string }) => {
        this.matcapLoader.load(matcapURL.url, (texture: Texture) => {
            this.torusKnotMaterial.color.setScalar(1);
            (this.torusKnot.material as MeshMatcapMaterial).matcap = texture;
            (this.torusKnot.material as MeshMatcapMaterial).needsUpdate = true;
        });
    };

    // eslint-disable-next-line class-methods-use-this
    update(clock: Clock) {}
}
export default MatcapPreviewContent;
