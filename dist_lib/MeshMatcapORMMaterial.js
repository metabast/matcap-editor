/* eslint-disable no-param-reassign */
import { Color, MeshMatcapMaterial, } from 'three';
const matcapORM = /* glsl */ `
vec3 outgoingLight = vec3( 0.0 );

vec4 matcap0 = getCellMatcap(matcap, uv, 2., 0.);
vec4 matcap1 = getCellMatcap(matcap, uv, 2., 1.);
vec4 matcap2 = getCellMatcap(matcap, uv, 2., 2.);
vec4 matcap3 = getCellMatcap(matcap, uv, 1., 0.);
vec4 matcap4 = getCellMatcap(matcap, uv, 1., 1.);
vec4 matcap5 = getCellMatcap(matcap, uv, 1., 2.);
vec4 matcap6 = getCellMatcap(matcap, uv, 0., 0.);
vec4 matcap7 = getCellMatcap(matcap, uv, 0., 1.);
vec4 matcap8 = getCellMatcap(matcap, uv, 0., 2.);

float roughness = uRoughness;

#ifdef USE_ROUGHNESSMAP
    vec4 roughnessMapColor = texture2D( uRoughnessMap, vUv );
    roughness = roughnessMapColor.g;
#endif

float interval = 1./8.;

matcap0.rgb *= clamp( map(roughness, 0., interval, 1., 0.), 0., 1.);

matcap1.rgb *= clamp( map(roughness, .0, interval, 0., 1.), 0., 1.);
matcap1.rgb *= clamp( map(roughness, interval, interval * 2., 1., 0.), 0., 1.);

matcap2.rgb *= clamp( map(roughness, interval * 1., interval * 2., 0., 1.), 0., 1.);
matcap2.rgb *= clamp( map(roughness, interval * 2., interval * 3., 1., 0.), 0., 1.);

matcap3.rgb *= clamp( map(roughness, interval * 2., interval * 3., 0., 1.), 0., 1.);
matcap3.rgb *= clamp( map(roughness, interval * 3., interval * 4., 1., 0.), 0., 1.);

matcap4.rgb *= clamp( map(roughness, interval * 3., interval * 4., 0., 1.), 0., 1.);
matcap4.rgb *= clamp( map(roughness, interval * 4., interval * 5., 1., 0.), 0., 1.);

matcap5.rgb *= clamp( map(roughness, interval * 4., interval * 5., 0., 1.), 0., 1.);
matcap5.rgb *= clamp( map(roughness, interval * 5., interval * 6., 1., 0.), 0., 1.);

matcap6.rgb *= clamp( map(roughness, interval * 5., interval * 6., 0., 1.), 0., 1.);
matcap6.rgb *= clamp( map(roughness, interval * 6., interval * 7., 1., 0.), 0., 1.);

matcap7.rgb *= clamp( map(roughness, interval * 6., interval * 7., 0., 1.), 0., 1.);
matcap7.rgb *= clamp( map(roughness, interval * 7., interval * 8., 1., 0.), 0., 1.);

matcap8.rgb *= clamp( map(roughness, interval * 7., interval * 8., 0., 1.), 0., 1.);

vec3 matcapProgress = 
    matcap0.rgb + matcap1.rgb + matcap2.rgb + matcap3.rgb + matcap4.rgb + 
    matcap5.rgb + matcap6.rgb + matcap7.rgb + matcap8.rgb;

diffuseColor.rgb = uColor;
#ifdef USE_MAP2
    diffuseColor.rgb = texture2D( uMap2, vUv ).rgb;
#endif
outgoingLight = diffuseColor.rgb * matcapProgress;
`;
const matcapORMUniform = /* glsl */ `
#define MATCAP

uniform float uPower;
uniform float uRoughness;
uniform float uMetalness;
uniform vec3 uColor;

uniform sampler2D uMap2;
uniform sampler2D uRoughnessMap;
uniform sampler2D uMetalnessMap;

float map(float value, float min1, float max1, float min2, float max2) {
    return min2 + (value - min1) * (max2 - min2) / (max1 - min1);
}

vec4 getCellMatcap( sampler2D matcap, vec2 uv, float row, float col ) {
    return texture2D(matcap, vec2(uv.x/3., uv.y/3.) + vec2(1./3.*col, 1./3.*row) );
}
`;
export class MeshMatcapORMMaterial extends MeshMatcapMaterial {
    customUniforms;
    constructor(parameters) {
        super(parameters);
        this.customUniforms = {
            uMap2: { value: null },
            uRoughness: { value: 0 },
            uRoughnessMap: { value: null },
            uMetalness: { value: 0 },
            uColor: { value: new Color(0xFFFFFF) },
        };
        this.setValues(parameters);
        this.onBeforeCompile = (shader) => {
            shader.defines = Object.assign(shader.defines, {
                USE_UV: '',
            });
            shader.uniforms = Object.assign(shader.uniforms, this.customUniforms);
            shader.fragmentShader = shader.fragmentShader.replace('#define MATCAP', matcapORMUniform);
            shader.fragmentShader = shader.fragmentShader.replace('vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;', matcapORM);
        };
    }
    set color2(value) {
        this.customUniforms.uColor.value = value;
    }
    get color2() {
        return this.customUniforms.uColor.value;
    }
    set map2(value) {
        if (value)
            this.defines.USE_MAP2 = '';
        else
            delete this.defines.USE_MAP2;
        this.customUniforms.uMap2.value = value;
    }
    get map2() {
        return this.customUniforms.uMap2.value;
    }
    set roughness(value) {
        this.customUniforms.uRoughness.value = value;
    }
    get roughness() {
        return this.customUniforms.uRoughness.value;
    }
    set roughnessMap(value) {
        this.customUniforms.uRoughnessMap.value = value;
    }
    get roughnessMap() {
        return this.customUniforms.uRoughnessMap.value;
    }
    set metalness(value) {
        this.customUniforms.uMetalness.value = value;
    }
    get metalness() {
        return this.customUniforms.uMetalness.value;
    }
}
//# sourceMappingURL=MeshMatcapORMMaterial.js.map