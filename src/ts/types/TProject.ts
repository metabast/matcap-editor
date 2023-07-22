import type { TSphereRenderAmbiant } from './TSphereRenderAmbiant';
import type { TSphereRenderMaterial } from './TSphereRenderMaterial';

export type TProject = {
    metadata: {
        version: number;
        type: string;
    };
    sphereRenderMaterial: TSphereRenderMaterial;
    sphereRenderAmbiant: TSphereRenderAmbiant;
    lights: any[];
}