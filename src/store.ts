import { derived, writable } from 'svelte/store';
import type {Writable} from 'svelte/store';
import { Color, PointLight, RectAreaLight, SpotLight } from 'three';

interface ISize {
    view: number;
    exportDefault: number;
    exportRatios: [number, number, number, number];
    exportRatio: number;
}

interface IMaterial{
    roughness: number;
    metalness: number;
}

interface IAmbiant{
    color: Color;
    intensity: number;
}
interface IArea{
    width: number;
    height: number;
}
interface ICreate{
    front: boolean;
    lightType: string;
    color: number;
    intensity: number;
    distance: number;
    area: IArea;
}
export interface IMatcapEditorStore {
    sizes: ISize;
    ratio:number;
    material:IMaterial;
    ambiant:IAmbiant;
    create:ICreate;
    lights: PointLight | RectAreaLight | SpotLight[];
    isUILightVisible:boolean;
}
export const MatcapEditorStore = writable<IMatcapEditorStore>({
    sizes: {
        view: 200,
        exportDefault: 256,
        exportRatios: [0.5, 1, 2, 4],
        exportRatio: 1,
    },
    ratio: 256 / 200,
    material: {
        roughness: 0.25,
        metalness: 0.5,
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

interface IStoreUI {
    isUILightVisible: boolean;
}
export type { IStoreUI };

export const StoreUI = writable<IStoreUI>({
    isUILightVisible: true,
});


interface MaterialParametersInterface {
    roughness: number;
    metalness: number;
}

export type { MaterialParametersInterface };

export const materialParameters = writable<MaterialParametersInterface>({
    roughness: 0.25,
    metalness: 0.5,
});

interface CreateLightParametersInterface {
    front: boolean;
    lightType: 'Point';
    color: number;
    intensity: number;
    distance: number;
    area: {
        width: number;
        height: number;
    };
}

export type { CreateLightParametersInterface };

export const createLightParameters = writable<CreateLightParametersInterface>({
    front: false,
    lightType: 'Point',
    color: 0xffffff,
    intensity: 1,
    distance: 1,
    area: {
        width: 2,
        height: 6,
    },
});

interface AmbiantParametersInterface {
    color: Color;
    intensity: number; // 0.004
}

export type { AmbiantParametersInterface };

export const ambiantParameters = writable<AmbiantParametersInterface>({
    color: new Color(),
    intensity: 0,
});
