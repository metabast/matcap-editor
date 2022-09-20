import {
    Clock,
    Mesh,
    MeshBasicMaterial,
    MeshMatcapMaterial,
    MeshStandardMaterial,
    TorusKnotGeometry,
} from 'three';
import type MatcapEditorWorld from './MatcapPreviewWorld';

class MatcapPreviewContent {
    private world: MatcapEditorWorld;

    constructor(world: MatcapEditorWorld) {
        this.world = world;

        const torusKnotGeometry = new TorusKnotGeometry(0.5, 0.1, 256, 32);
        const torusKnotMaterial = new MeshMatcapMaterial();
        const standardMat = new MeshBasicMaterial();
        const torusKnot = new Mesh(torusKnotGeometry, standardMat);
        this.world.scene.add(torusKnot);
    }

    update(clock: Clock) {}
}
export default MatcapPreviewContent;
