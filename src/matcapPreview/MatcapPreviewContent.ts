/* eslint-disable no-param-reassign */
import { matcapPreviewStore } from '@/stores/matcapPreviewStore';
import events from '@/commons/Events';
import { MeshMatcapORMMaterial } from '@/materials/MeshMatcapORMMaterial';
import { Clock, Material, Mesh, Object3D, Raycaster, sRGBEncoding, Texture, TextureLoader, TorusKnotGeometry, Vector2 } from 'three';
import type MatcapEditorWorld from './MatcapPreviewWorld';

if (import.meta.hot) {
    import.meta.hot.dispose(() => {
        import.meta.hot?.invalidate();
    });
}


class MatcapPreviewContent {
    private _store: any;

    private _world: MatcapEditorWorld;

    private matcapLoader: TextureLoader;

    private _materials: MeshMatcapORMMaterial[] = [];
    private _matcap: Texture;
    private _meshes: Mesh[] = [];
    private _currentObject: Object3D;
    private _selectedMesh: Mesh | null = null;

    private raycaster: Raycaster = new Raycaster();

    constructor(world: MatcapEditorWorld) {
        this._store = matcapPreviewStore();

        this._world = world;

        this.matcapLoader = new TextureLoader();

        const torusKnotGeometry = new TorusKnotGeometry(0.5, 0.4, 256, 32);
        const torusKnot = new Mesh(torusKnotGeometry, new Material());

        this.addObject(torusKnot);


        events.on('matcap:editor:snapshots:ready', this.onSnapshotsReady);
        events.on('object:power:update', this.onObjectPowerUpdate);
        events.on('object:roughness:update', this.onObjectRoughnessUpdate);
        events.on('object:metalness:update', this.onObjectMetalnessUpdate);

        this._world.canvas.addEventListener('pointerdown', this.onPointerDown);

        events.emit('matcap:preview:content:ready', this);

    }

    public get world() {
        return this._world;
    }

    private onPointerDown = () => {
        this._world.canvas.addEventListener('pointerup', this.onPointerUp);
    };

    private onPointerUp = (event: PointerEvent) => {
        this._world.canvas.removeEventListener('pointerup', this.onPointerUp);

        const pointer = new Vector2();
        pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
        pointer.y = - (event.clientY / window.innerHeight) * 2 + 1;

        this.raycaster.setFromCamera(pointer, this._world.camera);
        const intersects = this.raycaster.intersectObjects(this._meshes);
        if (intersects.length > 0) {
            this._selectedMesh = intersects[0].object as Mesh;
            this.world.outlinePass.selectedObjects = [this._selectedMesh];
            // this._store.metalness = (this._selectedMesh.material as MeshMatcapORMMaterial).metalness;
            // this._store.roughness = (this._selectedMesh.material as MeshMatcapORMMaterial).roughness;

        } else {
            this._selectedMesh = null;
        }
        events.emit('matcap:preview:mesh:selected', this._selectedMesh);
    };

    public addObject(object: Object3D) {

        if (this._currentObject) this._currentObject.visible = false;
        this._meshes = [];

        object.traverse((child) => {
            if (child instanceof Mesh) {
                child.material = new MeshMatcapORMMaterial();
                child.material.color.setScalar(this._store.power);
                child.material.matcap = this._matcap;
                child.material.roughness = this._store.roughness;
                child.material.metalness = this._store.metalness;
                child.geometry.computeBoundsTree();
                this._meshes.push(child);
            }
        });
        this._currentObject = object;
        this._world.scene.add(object);
        // this.onObjectRoughnessUpdate();
        // this.onObjectMetalnessUpdate();
    }

    private onSnapshotsReady = (snapshots: { matcap: string; refreshNb: number }): void => {
        this.matcapLoader.load(snapshots.matcap, (texture: Texture) => {
            texture.encoding = sRGBEncoding;
            this._matcap = texture;
            if (snapshots.refreshNb === 1) {
                this._store.roughness = 0;
                this._store.metalness = 1;
                // this.onObjectRoughnessUpdate();
                // this.onObjectMetalnessUpdate();
            }
            this._meshes.forEach((mesh: Mesh) => {
                (mesh.material as MeshMatcapORMMaterial).color.setScalar(this._store.power);
                (mesh.material as MeshMatcapORMMaterial).matcap = texture;
                (mesh.material as MeshMatcapORMMaterial).needsUpdate = true;
            });
        });
    };

    private onObjectPowerUpdate = (): void => {
        if (this._selectedMesh) {
            (this._selectedMesh.material as MeshMatcapORMMaterial).color.setScalar(this._store.power);
        } else {
            this._meshes.forEach((mesh: Mesh) => {
                (mesh.material as MeshMatcapORMMaterial).color.setScalar(this._store.power);
            });
        }
    };

    private onObjectRoughnessUpdate = (): void => {
        console.log('this._store.roughness', this._store.roughness);

        if (this._selectedMesh) {
            (this._selectedMesh.material as MeshMatcapORMMaterial).roughness = this._store.roughness;
        } else {
            this._meshes.forEach((mesh: Mesh) => {
                (mesh.material as MeshMatcapORMMaterial).roughness = this._store.roughness;
            });
        }
    };

    private onObjectMetalnessUpdate = (): void => {
        console.log('this._store.metalness', this._store.metalness);
        if (this._selectedMesh) {
            (this._selectedMesh.material as MeshMatcapORMMaterial).metalness = this._store.metalness;
        } else {
            this._meshes.forEach((mesh: Mesh) => {
                (mesh.material as MeshMatcapORMMaterial).metalness = this._store.metalness;
            });
        }
    };

    // eslint-disable-next-line class-methods-use-this
    public update(clock: Clock) { }
}
export default MatcapPreviewContent;
