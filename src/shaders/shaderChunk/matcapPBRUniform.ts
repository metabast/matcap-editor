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
`;
