import { matcapEditorStore } from '@/stores/matcapEditorStore';
import { PointLight, RectAreaLight, SpotLight } from 'three';

let store: any;



export const LightFabric = {
    getLightInstance(_TYPE: string): SpotLight | RectAreaLight | PointLight {
        if (!store) store = matcapEditorStore();

        const TYPE: string = _TYPE || store.create.lightType;
        let light: SpotLight | RectAreaLight | PointLight;
        switch (TYPE) {
            case 'Point':
                light = new PointLight(
                    store.create.color,
                    store.create.intensity,
                );
                break;
            case 'Area':
                light = new RectAreaLight(
                    store.create.color,
                    store.create.intensity,
                    store.create.area.width,
                    store.create.area.height,
                );
                break;
            case 'Spot':
                light = new SpotLight(
                    store.create.color,
                    store.create.intensity,
                );
                break;

            default:
                throw new Error('Light type not supported');
        }
        return light;
    },
};