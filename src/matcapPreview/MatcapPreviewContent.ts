/* eslint-disable no-param-reassign */
import events from 'src/commons/Events';
import { MeshMatcapPBRMaterial } from 'src/materials/MeshMatcapPBRMaterial';
import { PreviewStore, type IPreviewStore } from 'src/store';
import {
    Clock,
    Mesh,
    MeshMatcapMaterial,
    Texture,
    TextureLoader,
    TorusKnotGeometry,
} from 'three';
import type MatcapEditorWorld from './MatcapPreviewWorld';

let store: IPreviewStore;
PreviewStore.subscribe((newStore) => {
    store = newStore;
});

class MatcapPreviewContent {
    private world: MatcapEditorWorld;

    private matcapLoader: TextureLoader;

    private torusKnotMaterial: MeshMatcapMaterial;

    private torusKnot: Mesh;

    constructor(world: MatcapEditorWorld) {
        this.world = world;

        const torusKnotGeometry = new TorusKnotGeometry(0.5, 0.4, 256, 32);
        // const torusKnotGeometry = new SphereGeometry(1, 64, 64);
        this.torusKnotMaterial = new MeshMatcapPBRMaterial();
        this.torusKnotMaterial.color.setScalar(0);

        this.matcapLoader = new TextureLoader();
        this.torusKnot = new Mesh(torusKnotGeometry, this.torusKnotMaterial);
        this.world.scene.add(this.torusKnot);

        this.matcapLoader.load('./matcaps.png', (texture) => {
            (this.torusKnot.material as MeshMatcapPBRMaterial).matcap = texture;
            (this.torusKnot.material as MeshMatcapPBRMaterial).needsUpdate =
                true;
        });
        // events.on('matcap:updateFromEditor', this.onmatcapUpdated);
        events.on('matcap:editor:snapshots:ready', this.onSnapshotsReady);
        events.on('object:power:update', this.onObjectPowerUpdate);
        events.on('object:roughness:update', this.onObjectRoughnessUpdate);
        events.on('object:metalness:update', this.onObjectMetalnessUpdate);
    }

    private onmatcapUpdated = (matcapURL: {
        url: string;
        textureIndex: number;
    }) => {
        this.matcapLoader.load(matcapURL.url, (texture: Texture) => {
            this.torusKnotMaterial.color.setScalar(store.power);
            if (matcapURL.textureIndex === 0) {
                (this.torusKnot.material as MeshMatcapPBRMaterial).matcap =
                    texture;
            } else {
                (
                    this.torusKnot.material as MeshMatcapPBRMaterial
                ).roughnessMap = texture;
            }
            (this.torusKnot.material as MeshMatcapPBRMaterial).needsUpdate =
                true;
        });
    };

    private onSnapshotsReady = (snapshots: { matcap: string }): void => {
        this.matcapLoader.load(snapshots.matcap, (texture: Texture) => {
            this.torusKnotMaterial.color.setScalar(store.power);
            (this.torusKnot.material as MeshMatcapPBRMaterial).matcap = texture;
            (this.torusKnot.material as MeshMatcapPBRMaterial).needsUpdate =
                true;
        });
    };

    private onObjectPowerUpdate = (): void => {
        this.torusKnotMaterial.color.setScalar(store.power);
    };

    private onObjectRoughnessUpdate = (): void => {
        // this.customUniforms.uRoughness.value = store.roughness;
        (this.torusKnot.material as MeshMatcapPBRMaterial).roughness =
            store.roughness;
    };

    private onObjectMetalnessUpdate = (): void => {
        (this.torusKnot.material as MeshMatcapPBRMaterial).metalness =
            store.metalness;
    };

    // eslint-disable-next-line class-methods-use-this
    public update(clock: Clock) {}
}
export default MatcapPreviewContent;
