/* eslint-disable no-param-reassign */
import {
    Color,
    MeshMatcapMaterial,
    Texture,
    type MeshMatcapMaterialParameters,
    type Shader,
} from 'three';

import matcapORMUniform from '../shaders/shaderChunk/matcapORMUniform';
import matcapORM from '../shaders/shaderChunk/matcapORM';

export class MeshMatcapORMMaterial extends MeshMatcapMaterial {
    private customUniforms: {
        uMap2: { value: Texture | null };
        uRoughness: { value: number };
        uRoughnessMap: { value: Texture | null };
        uMetalness: { value: number };
        uColor: { value: Color };
    };

    constructor(parameters?: MeshMatcapMaterialParameters) {
        super(parameters);

        this.customUniforms = {
            uMap2: { value: null },
            uRoughness: { value: 0 },
            uRoughnessMap: { value: null },
            uMetalness: { value: 0 },
            uColor: { value: new Color(0xFFFFFF) },
        };

        this.setValues(parameters as MeshMatcapMaterialParameters);
        console.log('this.customUniforms.uMap2.value', this.customUniforms.uMap2.value);

        if (this.customUniforms.uMap2.value)
            console.log(this.customUniforms.uMap2.value);

        this.onBeforeCompile = (shader: Shader) => {
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
    set color2(value: Color) {
        console.log(value);

        this.customUniforms.uColor.value = value;
    }

    get color2() {
        return this.customUniforms.uColor.value;
    }

    set map2(value: Texture | null) {
        if (value)
            this.defines.USE_MAP2 = '';
        else
            delete this.defines.USE_MAP2;
        this.customUniforms.uMap2.value = value;
    }

    get map2() {
        return this.customUniforms.uMap2.value;
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
