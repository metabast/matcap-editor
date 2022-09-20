import {
    AmbientLight,
    Mesh,
    MeshBasicMaterial,
    MeshNormalMaterial,
    MeshPhysicalMaterial,
    OrthographicCamera,
    PlaneGeometry,
    SphereGeometry,
} from 'three';
import events from '../commons/Events';
import { ambiantParameters, materialParameters } from '../store';
import type {
    AmbiantParametersInterface,
    MaterialParametersInterface,
} from '../store';
import type MatcapEditorWorld from './MatcapEditorWorld';

const data = {
    halfSize: 0.3,
    widthSegments: 256,
    heightSegments: 256,
};
data.heightSegments = data.widthSegments / (4 / 3);

let materialParams: MaterialParametersInterface;
materialParameters.subscribe((value) => {
    materialParams = value;
});

let ambiantParams: AmbiantParametersInterface;
ambiantParameters.subscribe((value) => {
    ambiantParams = value;
});

class MatcapEditorContent {
    private world: MatcapEditorWorld;

    private cameraSnapshot: OrthographicCamera;

    private plane: Mesh;

    private sphereRender: Mesh;

    private sphereRenderMaterial: MeshPhysicalMaterial;

    private sphereNormal: Mesh;

    private meshesIntersectable: Array<Mesh> = [];

    private ambiantLight: AmbientLight = new AmbientLight(0x000000);

    constructor(world: MatcapEditorWorld) {
        this.world = world;

        const halfSize = 0.3;

        this.cameraSnapshot = new OrthographicCamera(
            -halfSize,
            halfSize,
            halfSize,
            -halfSize,
            0.5,
            200,
        );
        this.cameraSnapshot.position.set(0, 0, 1);

        const planeGeometry = new PlaneGeometry(2, 2);
        const planeMaterial = new MeshBasicMaterial({ color: 0x000000 });
        planeMaterial.transparent = true;
        planeMaterial.opacity = 0;
        this.plane = new Mesh(planeGeometry, planeMaterial);

        const sphereRenderGeometry = new SphereGeometry(
            0.3,
            data.widthSegments,
            data.heightSegments,
        );
        this.sphereRenderMaterial = new MeshPhysicalMaterial({
            color: 0xffffff,
        });
        this.sphereRenderMaterial.roughness = materialParams.roughness;
        this.sphereRenderMaterial.metalness = materialParams.metalness;
        this.sphereRender = new Mesh(
            sphereRenderGeometry,
            this.sphereRenderMaterial,
        );

        const sphereNormalGeometry = new SphereGeometry(
            0.4,
            data.widthSegments,
            data.heightSegments,
        );
        const sphereNormalMaterial = new MeshNormalMaterial({
            opacity: 0,
            transparent: true,
        });
        this.sphereNormal = new Mesh(
            sphereNormalGeometry,
            sphereNormalMaterial,
        );

        this.meshesIntersectable = [
            this.plane,
            this.sphereRender,
            this.sphereNormal,
        ];

        this.sphereRender.geometry.computeBoundsTree();
        this.sphereNormal.geometry.computeBoundsTree();

        world.scene.add(this.plane);
        world.scene.add(this.sphereRender);
        world.scene.add(this.sphereNormal);

        this.ambiantLight.intensity = ambiantParams.intensity;
        this.ambiantLight.color = ambiantParams.color;

        events.on('matcap:ambiant:update', this.onAmbiantChanged);
    }

    private onAmbiantChanged = () => {
        this.ambiantLight.intensity = ambiantParams.intensity;
        this.ambiantLight.color = ambiantParams.color;
    };
}
export default MatcapEditorContent;
