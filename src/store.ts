import { writable } from 'svelte/store';
import { Color } from 'three';
import type LightModel from './matcapEditor/LightModel';

interface ISize {
    view: number;
    exportDefault: number;
    exportRatios: [number, number, number, number];
    exportRatio: number;
}

interface IMaterial {
    roughness: number;
    metalness: number;
}

interface IAmbiant {
    color: Color;
    intensity: number;
}
interface IArea {
    width: number;
    height: number;
}
interface ICreate {
    front: boolean;
    lightType: string;
    color: number;
    intensity: number;
    distance: number;
    area: IArea;
}
export interface IMatcapEditorStore {
    sizes: ISize;
    ratio: number;
    textureIndex: number;
    material: IMaterial;
    ambiant: IAmbiant;
    create: ICreate;
    lights: LightModel[];
    isUILightVisible: boolean;
}
export const MatcapEditorStore = writable<IMatcapEditorStore>({
    sizes: {
        view: 200,
        exportDefault: 256,
        exportRatios: [0.5, 1, 2, 4],
        exportRatio: 1,
    },
    ratio: 256 / 200,
    textureIndex: 0,
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
    lights: [],
    isUILightVisible: true,
});

export interface IPreviewStore {
    power: number;
    roughness: number;
    metalness: number;
}
export const PreviewStore = writable<IPreviewStore>({
    power: 1,
    roughness: 0,
    metalness: 1,
});
