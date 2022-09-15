import { writable } from 'svelte/store';
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
