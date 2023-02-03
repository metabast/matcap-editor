/* eslint-disable no-param-reassign */
import { matcapPreviewStore } from '@/stores/matcapPreviewStore';
import events from '@/commons/Events';
import { MeshMatcapORMMaterial } from '@/materials/MeshMatcapORMMaterial';
import { Clock, Mesh, MeshMatcapMaterial, Object3D, sRGBEncoding, Texture, TextureLoader, TorusKnotGeometry } from 'three';
import type MatcapEditorWorld from './MatcapPreviewWorld';
import { EVENT_FILES_DROPPED } from '@/commons/Constants';


class MatcapPreviewContent {
    private _store: any;

    private _world: MatcapEditorWorld;

    private matcapLoader: TextureLoader;

    private _materials: MeshMatcapORMMaterial[] = [];
    private _matcap: Texture;
    private _meshes: Mesh[] = [];

    private torusKnotMaterial: MeshMatcapMaterial;

    private torusKnot: Mesh;

    constructor(world: MatcapEditorWorld) {
        this._store = matcapPreviewStore();

        this._world = world;

        const torusKnotGeometry = new TorusKnotGeometry(0.5, 0.4, 256, 32);
        this.torusKnotMaterial = new MeshMatcapORMMaterial();
        this.torusKnotMaterial.color.setScalar(0);

        this.matcapLoader = new TextureLoader();
        this.torusKnot = new Mesh(torusKnotGeometry, this.torusKnotMaterial);
        this._world.scene.add(this.torusKnot);

        events.on('matcap:editor:snapshots:ready', this.onSnapshotsReady);
        events.on('object:power:update', this.onObjectPowerUpdate);
        events.on('object:roughness:update', this.onObjectRoughnessUpdate);
        events.on('object:metalness:update', this.onObjectMetalnessUpdate);

    }

    public get world() {
        return this._world;
    }

    public addObject(object: Object3D) {
        object.traverse((child) => {
            if (child instanceof Mesh) {
                child.material = new MeshMatcapORMMaterial();
                child.material.color.setScalar(this._store.power);
                child.material.matcap = this._matcap;
                child.material.needsUpdate = true;
                child.material.roughness = this._store.roughness;
                child.material.metalness = this._store.metalness;
                this._materials.push(child.material);
                this._meshes.push(child);
            }
        });
        this._world.scene.add(object);
        this.onObjectRoughnessUpdate();
        this.onObjectMetalnessUpdate();
    }

    private onSnapshotsReady = (snapshots: { matcap: string; refreshNb: number }): void => {
        this.matcapLoader.load(snapshots.matcap, (texture: Texture) => {
            texture.encoding = sRGBEncoding;
            this._matcap = texture;
            if (snapshots.refreshNb === 1) {
                this._store.roughness = 0;
                this._store.metalness = 1;
                this.onObjectRoughnessUpdate();
                this.onObjectMetalnessUpdate();
            }
            this.torusKnotMaterial.color.setScalar(this._store.power);
            (this.torusKnot.material as MeshMatcapORMMaterial).matcap = texture;
            (this.torusKnot.material as MeshMatcapORMMaterial).needsUpdate = true;
            this._meshes.forEach((mesh: Mesh) => {
                (mesh.material as MeshMatcapORMMaterial).color.setScalar(this._store.power);
                (mesh.material as MeshMatcapORMMaterial).matcap = texture;
                (mesh.material as MeshMatcapORMMaterial).needsUpdate = true;
            });
        });
    };

    private onObjectPowerUpdate = (): void => {
        this.torusKnotMaterial.color.setScalar(this._store.power);
        this._meshes.forEach((mesh: Mesh) => {
            (mesh.material as MeshMatcapORMMaterial).color.setScalar(this._store.power);
        });
    };

    private onObjectRoughnessUpdate = (): void => {
        (this.torusKnot.material as MeshMatcapORMMaterial).roughness = this._store.roughness;
        this._meshes.forEach((mesh: Mesh) => {
            (mesh.material as MeshMatcapORMMaterial).roughness = this._store.roughness;
        });
    };

    private onObjectMetalnessUpdate = (): void => {
        (this.torusKnot.material as MeshMatcapORMMaterial).metalness = this._store.metalness;
        this._meshes.forEach((mesh: Mesh) => {
            (mesh.material as MeshMatcapORMMaterial).metalness = this._store.roughness;
        });
    };

    // eslint-disable-next-line class-methods-use-this
    public update(clock: Clock) { }
}
export default MatcapPreviewContent;
