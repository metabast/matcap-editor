import { Light, PointLight, RectAreaLight, SpotLight } from 'three';
import { createLightParameters } from '../store';
import type { CreateLightParametersInterface } from '../store';

let createLightParams: CreateLightParametersInterface;
createLightParameters.subscribe((value) => {
    createLightParams = value;
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

    static getLightInstance(_TYPE: string): SpotLight | RectAreaLight | PointLight {
        const TYPE: string = _TYPE || createLightParams.lightType;
        let light: SpotLight | RectAreaLight | PointLight;
        switch (TYPE) {
            case 'Point':
                light = new PointLight(
                    createLightParams.color,
                    createLightParams.intensity,
                );
                break;
            case 'Area':
                light = new RectAreaLight(
                    createLightParams.color,
                    createLightParams.intensity,
                    createLightParams.area.width,
                    createLightParams.area.height,
                );
                break;
            case 'Spot':
                light = new SpotLight(
                    createLightParams.color,
                    createLightParams.intensity,
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
