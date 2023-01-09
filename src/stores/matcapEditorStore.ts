import type LightModel from '@/matcapEditor/LightModel';
import { defineStore } from 'pinia';
import { Color } from 'three';

const viewSize = 256;
export type Lights = LightModel[];
export const matcapEditorStore = defineStore('matcapEditor', {
    state: () => {
        return {
            sizes: {
                view: viewSize,
                exportDefault: 256,
                exportRatios: [0.5, 1, 2, 4],
                exportRatio: 1,
            },
            ratio: 256 / viewSize,
            material: {
                roughness: 0,
                metalness: 1,
            },
            ambiant: {
                color: new Color(),
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
        };
    },
    actions: {
        addLight(light: LightModel) {
            this.lights.push(light);
        },
    },
});