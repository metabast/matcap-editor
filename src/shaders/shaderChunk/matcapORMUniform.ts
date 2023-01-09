export default /* glsl */ `
#define MATCAP

uniform float uPower;
uniform float uRoughness;
uniform float uMetalness;
uniform sampler2D uRoughnessMap;
uniform sampler2D uMetalnessMap;

float map(float value, float min1, float max1, float min2, float max2) {
    return min2 + (value - min1) * (max2 - min2) / (max1 - min1);
}

vec4 getCellMatcap( sampler2D matcap, vec2 uv, float row, float col ) {
    return texture2D(matcap, vec2(uv.x/3., uv.y/3.) + vec2(1./3.*row, 1./3.*col) );
}
`;
