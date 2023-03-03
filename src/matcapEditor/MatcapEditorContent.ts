import {
    AmbientLight,
    ArrowHelper,
    Mesh,
    MeshBasicMaterial,
    MeshNormalMaterial,
    MeshPhysicalMaterial,
    OrthographicCamera,
    PlaneGeometry,
    Raycaster,
    SphereGeometry,
    Vector2,
    Vector3,
    type Intersection,
} from 'three';

import { getScreenPosition } from '@/commons/VectorHelpers';
import { AddLightCommand } from '@/commands';
import { SetLightModelPositionCommand } from '@/commands/SetLightPositionCommand';
import type { ValuesCommand } from '@/ts/types/PanesTypes';
import events, { emitSnapshot } from '@/commons/Events';
import type MatcapEditorWorld from './MatcapEditorWorld';
import LightModel from './LightModel';
import RenderManager from './RenderManager';
import { matcapEditorStore } from '@/stores/matcapEditorStore';
import { LightFabric } from './LightFabric';

const data = {
    halfSize: 0.3,
    widthSegments: 256,
    heightSegments: 256,
    textureIndex: 0,
};
data.heightSegments = data.widthSegments / (4 / 3);



class MatcapEditorContent {
    private _store: any;
    private _world: MatcapEditorWorld;

    private _cameraSnapshot: OrthographicCamera;

    private plane: Mesh;

    private sphereRender: Mesh;

    private _sphereRenderMaterial: MeshPhysicalMaterial;

    private sphereNormal: Mesh;

    private meshesIntersectable: Array<Mesh> = [];

    private _ambiantLight: AmbientLight = new AmbientLight(0x000000);

    private _arrowHelper: ArrowHelper = new ArrowHelper(new Vector3(), new Vector3(), 1, '#ff0000');

    private currentLightModel: LightModel | null;

    private raycaster: Raycaster = new Raycaster();

    private pointer: Vector2 = new Vector2();

    private hitSphere: Intersection;

    private lightPosition: Vector3 = new Vector3();

    constructor(world: MatcapEditorWorld) {

        this._store = matcapEditorStore();
        this._world = world;

        const halfSize = 0.3;

        this._cameraSnapshot = new OrthographicCamera(-halfSize, halfSize, halfSize, -halfSize, 0.5, 200);
        this._cameraSnapshot.position.set(0, 0, 1);

        const planeGeometry = new PlaneGeometry(2, 2);
        const planeMaterial = new MeshBasicMaterial({ color: 0x000000 });
        planeMaterial.transparent = true;
        planeMaterial.opacity = 0;
        this.plane = new Mesh(planeGeometry, planeMaterial);

        const sphereRenderGeometry = new SphereGeometry(0.3, data.widthSegments, data.heightSegments);
        this._sphereRenderMaterial = new MeshPhysicalMaterial({
            color: 0xffffff,
        });
        this._sphereRenderMaterial.roughness = this._store.material.roughness;
        this._sphereRenderMaterial.metalness = this._store.material.metalness;

        this.sphereRender = new Mesh(sphereRenderGeometry, this._sphereRenderMaterial);

        const sphereNormalGeometry = new SphereGeometry(0.4, data.widthSegments, data.heightSegments);
        const sphereNormalMaterial = new MeshNormalMaterial({
            opacity: 0,
            transparent: true,
        });
        this.sphereNormal = new Mesh(sphereNormalGeometry, sphereNormalMaterial);

        this.meshesIntersectable = [this.plane, this.sphereRender, this.sphereNormal];

        this.sphereRender.geometry.computeBoundsTree();
        this.sphereNormal.geometry.computeBoundsTree();
        this.plane.geometry.computeBoundsTree();

        this._world.scene.add(this.plane);
        this._world.scene.add(this.sphereRender);
        this._world.scene.add(this.sphereNormal);

        this._ambiantLight.intensity = this._store.ambiant.intensity;
        this._ambiantLight.color = this._store.ambiant.color;
        this._world.scene.add(this._ambiantLight);

        this._world.scene.add(this._arrowHelper);

        RenderManager.initialize(this);

        this._world.canvas.addEventListener('mouseover', this.onMouseOver);
        this._world.canvas.addEventListener('mouseout', this.onMouseOut);

        events.on('matcap:ambiant:update', this.onAmbiantChanged);

        events.on('matcap:light:delete', this.deleteLight);
        events.on('matcap:light:startMoving', this.onLightStartMoving);
        events.on('matcap:light:stopMoving', this.onLightStopMoving);
        events.on('matcap:material:update', this.onMaterialUpdate);
        this._world.canvas.addEventListener('pointerup', this.onPointerUp);

        events.emit('matcap:content:ready', this);
    }

    public get world(): MatcapEditorWorld {
        return this._world;
    }

    public get arrowHelper(): ArrowHelper {
        return this._arrowHelper;
    }

    public get sphereRenderMaterial(): MeshPhysicalMaterial {
        return this._sphereRenderMaterial;
    }

    public get cameraSnapshot(): OrthographicCamera {
        return this._cameraSnapshot;
    }

    public get ambiantLight(): AmbientLight {
        return this._ambiantLight;
    }

    private onAmbiantChanged = () => {
        this._ambiantLight.intensity = this._store.ambiant.intensity;
        this._ambiantLight.color = this._store.ambiant.color;
        RenderManager.snapshot();
        emitSnapshot();
    };

    private onMouseOver = () => {
        this._arrowHelper.visible = true;
        this._world.canvas.addEventListener('pointermove', this.onPointerMove);
        this._world.canvas.addEventListener('pointerdown', this.onPointerDown);
    };

    private onMouseOut = () => {
        this._arrowHelper.visible = false;
        this._world.canvas.removeEventListener('pointermove', this.onPointerMove);
        this._world.canvas.removeEventListener('pointerdown', this.onPointerDown);
    };

    private onPointerDown = () => {
        if (!this.hitSphere?.face) return;

        const positionOnSphere = this.hitSphere.point.clone();

        this.lightPosition = this.hitSphere.point.clone();
        this.lightPosition.add(this.hitSphere.face.normal.clone().multiplyScalar(this._store.create.distance));

        const instanceOfLight = LightFabric.getLightInstance(this._store.create.lightType);

        instanceOfLight.position.x = this.lightPosition.x;
        instanceOfLight.position.y = this.lightPosition.y;
        if (this._store.create.front) instanceOfLight.position.z = this.lightPosition.z;
        else instanceOfLight.position.z = -this.lightPosition.z;

        const screenPosition = getScreenPosition(
            positionOnSphere.clone().add(this.hitSphere.face.normal.clone().multiplyScalar(0.1)),
            this._world.camera,
            this._store.sizes.exportDefault,
            this._store.sizes.exportDefault,
        );

        const lightModel = new LightModel();
        lightModel.light = instanceOfLight;
        lightModel.screenPosition = screenPosition;
        lightModel.positionOnSphere = positionOnSphere;
        lightModel.sphereFaceNormal = this.hitSphere.face.normal.clone();
        lightModel.distance = Number(this._store.create.distance);
        lightModel.front = Boolean(this._store.create.front);

        this.world.editor.execute(new AddLightCommand(this.world.editor, lightModel));
    };

    private onPointerMove = (event: PointerEvent) => {
        this.pointer.set(
            ((event.offsetX * this._store.ratio) / this._store.sizes.exportDefault) * 2 - 1,
            -((event.offsetY * this._store.ratio) / this._store.sizes.exportDefault) * 2 + 1,
        );
        this.raycaster.setFromCamera(this.pointer, this._world.camera);
        const hits = this.raycaster.intersectObjects(this.meshesIntersectable);
        const hit = hits[0];

        if (!hit) return;

        if (hit.object === this.sphereNormal) {
            this._arrowHelper.setColor('#e5ff00');
            this.raycaster.set(hit.point, new Vector3().subVectors(new Vector3(), hit.point).normalize());
        } else if (hit.object === this.plane) {
            this._arrowHelper.setColor('#00ffee');
            this.raycaster.set(hit.point, new Vector3().subVectors(new Vector3(), hit.point).normalize());
        }
        const hits2 = this.raycaster.intersectObject(this.sphereRender);
        const hit2 = hits2[0];

        if (!hit2) return;

        this._arrowHelper.setDirection(hit2.face?.normal as Vector3);
        this._arrowHelper.setLength(0.1);
        this._arrowHelper.position.copy(hit2.point);

        this.hitSphere = hit2;

        if (this.currentLightModel) {

            if (!this.hitSphere?.face) return;
            const positionOnSphere = this.hitSphere.point.clone();
            this.lightPosition = positionOnSphere.clone();
            this.lightPosition.add(this.hitSphere.face.normal.clone().multiplyScalar(this.currentLightModel.distance));
            this.currentLightModel.light.position.x = this.lightPosition.x;
            this.currentLightModel.light.position.y = this.lightPosition.y;

            if (this.currentLightModel.front) this.currentLightModel.light.position.z = this.lightPosition.z;
            else this.currentLightModel.light.position.z = -this.lightPosition.z;

            this.currentLightModel.update();

            const screenPosition = getScreenPosition(
                positionOnSphere.clone().add(this.hitSphere.face.normal.clone().multiplyScalar(0.1)),
                this._world.camera,
                this._store.sizes.exportDefault,
                this._store.sizes.exportDefault,
            );
            this.currentLightModel.screenPosition = screenPosition;
            // this.currentLightModel.positionOnSphere = positionOnSphere;
            this.currentLightModel.sphereFaceNormal = this.hitSphere.face.normal.clone();
        }
    };

    private onPointerUp = () => {
        if (this.currentLightModel) {
            const parameters = {
                name: 'position',
                value: this.currentLightModel.positions,
                oldValue: this.currentLightModel.oldPositions,
            } as ValuesCommand;

            this.world.editor.execute(
                new SetLightModelPositionCommand(this.world.editor, parameters, this.currentLightModel),
            );
        }

        this._store.isUILightVisible = true;
        this.currentLightModel = null;
        RenderManager.snapshot();
    };

    private onLightStartMoving = (lightModel: LightModel) => {
        this.currentLightModel = lightModel;
        lightModel.pickCurrentPositions();
    };

    private onLightStopMoving = () => {
        this.currentLightModel = null;
        RenderManager.snapshot();
    };

    private onMaterialUpdate = () => { };

    public deleteLight = (lightModel: LightModel) => {
        this._world.scene.remove(lightModel.light);
        this._store.lights.splice(this._store.lights.indexOf(lightModel), 1);
        RenderManager.snapshot();
    };
}
export default MatcapEditorContent;
