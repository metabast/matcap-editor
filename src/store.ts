import { writable, readable } from 'svelte/store';
import { Color } from 'three';

export const occuledPoints = writable([]);
export const rotationCursor = writable(false);
export const loadingHidden = writable(false);

export const matcapEditor = writable({
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
        lightType: 'Point',
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
