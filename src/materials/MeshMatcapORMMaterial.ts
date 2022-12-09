/* eslint-disable import/prefer-default-export */
/* eslint-disable no-param-reassign */
import {
    MeshMatcapMaterial,
    Texture,
    type MeshMatcapMaterialParameters,
} from 'three';

import matcapORMUniform from '../shaders/shaderChunk/matcapORMUniform';
import matcapORM from '../shaders/shaderChunk/matcapORM';

export class MeshMatcapORMMaterial extends MeshMatcapMaterial {
    private customUniforms: {
        uRoughness: { value: number };
        uRoughnessMap: { value: Texture };
        uMetalness: { value: number };
    };

    constructor(parameters?: MeshMatcapMaterialParameters) {
        super(parameters);

        this.customUniforms = {
            uRoughness: { value: null },
            uRoughnessMap: { value: null },
            uMetalness: { value: null },
        };

        this.setValues(parameters);
        this.onBeforeCompile = (shader) => {
            shader.uniforms = Object.assign(
                shader.uniforms,
                this.customUniforms,
            );
            shader.fragmentShader = shader.fragmentShader.replace(
                '#define MATCAP',
                matcapORMUniform,
            );
            shader.fragmentShader = shader.fragmentShader.replace(
                'vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;',
                matcapORM,
            );
        };
    }

    set roughness(value: number) {
        this.customUniforms.uRoughness.value = value;
    }

    get roughness() {
        return this.customUniforms.uRoughness.value;
    }

    set roughnessMap(value: Texture | null) {
        this.customUniforms.uRoughnessMap.value = value;
    }

    get roughnessMap() {
        return this.customUniforms.uRoughnessMap.value;
    }

    set metalness(value: number) {
        this.customUniforms.uMetalness.value = value;
    }

    get metalness() {
        return this.customUniforms.uMetalness.value;
    }
}
