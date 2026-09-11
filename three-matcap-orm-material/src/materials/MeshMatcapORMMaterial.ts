import matcapORMUniform from '../shaders/shaderChunk/matcapORMUniform';
import matcapORM from '../shaders/shaderChunk/matcapORM';
import * as THREE from 'three';

export class MeshMatcapORMMaterial extends THREE.MeshMatcapMaterial {
    private customUniforms: {
        uMap2: { value: THREE.Texture | null };
        uRoughness: { value: number };
        uRoughnessMap: { value: THREE.Texture | null };
        uMetalness: { value: number };
        uColor: { value: THREE.Color };
    };

    constructor(parameters?: THREE.MeshMatcapMaterialParameters) {
        super(parameters);

        this.customUniforms = {
            uMap2: { value: null },
            uRoughness: { value: 0 },
            uRoughnessMap: { value: null },
            uMetalness: { value: 0 },
            uColor: { value: new THREE.Color(0xffffff) },
        };

        this.setValues(parameters as THREE.MeshMatcapMaterialParameters);

        this.onBeforeCompile = (shader: THREE.Shader) => {
            (shader as any).defines = Object.assign((shader as any).defines, {
                USE_UV: '',
            });

            shader.uniforms = Object.assign(shader.uniforms, this.customUniforms);
            shader.fragmentShader = shader.fragmentShader.replace('#define MATCAP', matcapORMUniform);
            shader.fragmentShader = shader.fragmentShader.replace(
                'vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;',
                matcapORM,
            );
        };
    }

    set color2(value: THREE.Color) {
        this.customUniforms.uColor.value = value;
    }

    get color2() {
        return this.customUniforms.uColor.value;
    }

    set map2(value: THREE.Texture | null) {
        if (value) this.defines.USE_MAP2 = '';
        else delete this.defines.USE_MAP2;
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

    set roughnessMap(value: THREE.Texture | null) {
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

    applyMapsFromOtherMaterial(material: MeshMatcapORMMaterial) {
        if (material.color) this.color2 = material.color;

        if (material.map) {
            this.map2 = material.map;
        }

        if (material.roughness) this.roughness = material.roughness;

        if (material.roughnessMap) this.roughnessMap = material.roughnessMap;

        if (material.normalMap) this.normalMap = material.normalMap;
    }
}
