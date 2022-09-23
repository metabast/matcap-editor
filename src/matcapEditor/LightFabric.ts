import { Light, PointLight, RectAreaLight, SpotLight } from 'three';
import { MatcapEditorStore, type IMatcapEditorStore } from '../store';

let store: IMatcapEditorStore;
MatcapEditorStore.subscribe((value) => {
    store = value;
});

class LightFabric {
    static instance: LightFabric;

    constructor() {
        if (!LightFabric.instance) {
            LightFabric.instance = this;
        } else {
            throw new Error('LightFabric is a singleton class');
        }
    }

    static getLightInstance(
        _TYPE: string,
    ): SpotLight | RectAreaLight | PointLight {
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
    }

    static getInstance() {
        if (!LightFabric.instance) {
            return new LightFabric();
        }
        return LightFabric.instance;
    }
}

export default LightFabric;
