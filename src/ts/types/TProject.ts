import type { TSphereRenderAmbiant } from '@/ts/types/TSphereRenderAmbiant';
import type { TSphereRenderMaterial } from '@/ts/types/TSphereRenderMaterial';

export type TProject = {
    metadata: {
        version: number;
        type: string;
    };
    sphereRenderMaterial: TSphereRenderMaterial;
    sphereRenderAmbiant: TSphereRenderAmbiant;
    lights: any[];
}