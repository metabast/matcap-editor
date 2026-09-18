import type { TSphereRenderAmbiant } from './TSphereRenderAmbiant';
import type { TSphereRenderMaterial } from './TSphereRenderMaterial';

/**
 * Serializable shape of a matcap project: what `matcap.json` holds, and the only
 * thing the import path is allowed to assume. Written by hand rather than
 * derived from the runtime classes, so that nothing here depends on Three.js or
 * on Tweakpane.
 *
 * The light entries transcribe `Object3D.toJSON()`'s envelope, which is what the
 * exporter has always written. Decoupling the file format from Three's own
 * serialization is a separate change, and would need a version bump.
 */

export type SerializedVector2 = { x: number; y: number };

export type SerializedVector3 = { x: number; y: number; z: number };

export type SerializedLightObject = {
    uuid: string;
    type: string;
    color: number;
    intensity: number;
    matrix: number[];
    /** RectAreaLight only. */
    width?: number;
    /** RectAreaLight only. */
    height?: number;
};

export type SerializedLightEnvelope = {
    metadata?: { version: number; type: string; generator: string };
    object: SerializedLightObject;
};

export type SerializedLight = {
    _light: SerializedLightEnvelope;
    _screenPosition: SerializedVector2;
    _distance: number;
    _sphereFaceNormal: SerializedVector3;
    _positionOnSphere: SerializedVector3;
    _positionTarget: SerializedVector3;
    _lookAtTarget: boolean;
    _front: boolean;
};

export type MatcapProject = {
    metadata: {
        version: number;
        type: string;
    };
    sphereRenderMaterial: TSphereRenderMaterial;
    sphereRenderAmbiant: TSphereRenderAmbiant;
    lights: SerializedLight[];
};
