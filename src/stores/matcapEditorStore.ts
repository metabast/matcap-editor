import { defineStore } from 'pinia';
import type LightModel from '@/matcapEditor/LightModel';
import type { TSphereRenderMaterial } from '@/ts/types/TSphereRenderMaterial';

const viewSize = 256;
export type Lights = LightModel[];
export const matcapEditorStore = defineStore('matcapEditor', {
    state: () => ({
        sizes: {
            view: viewSize,
            exportDefault: 256,
            exportRatios: [0.5, 1, 2, 4],
            exportRatio: 1,
        },
        ratio: 256 / viewSize,
        // Source of truth for the sphere rendering. Colours are hex strings, the
        // form Tweakpane binds to; the Three.js side converts on application.
        material: {
            roughness: 0,
            metalness: 1,
            color: '#ffffff',
        },
        ambiant: {
            color: '#ffffff',
            intensity: 0, // 0.004
        },
        create: {
            front: true,
            lightType: 'Area',
            color: 0xffffff,
            intensity: 1,
            distance: 1,
            area: {
                width: 2,
                height: 6,
            },
        },
        lights: [] as Lights,
        isUILightVisible: true,
    }),
    actions: {
        addLight(light: LightModel) {
            this.lights.push(light);
        },
        removeLight(light: LightModel) {
            this.lights.splice(this.lights.indexOf(light), 1);
        },
        setSphereRenderMaterial(material: TSphereRenderMaterial) {
            this.material.roughness = material.roughness;
            this.material.metalness = material.metalness;
            this.material.color = material.color;
        },
    },
});
