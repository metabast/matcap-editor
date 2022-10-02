export default /* glsl */ `
vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;

float mask = map(uv.x, 0., 1., 0., 1.);
// mask = snoise(uv*vec2(1.));
// mask = map(mask, .0, 1., 0.4, 1.);

vec4 roughnessMapColor = texture2D( uRoughnessMap, uv );

// matcapColor.rgb *= vec3(clamp(1.-mask*2., 0., 1.));
// roughnessMapColor.rgb *= vec3(mask);

// matcapColor.rgb *= vec3(uMetalness);
// roughnessMapColor.rgb *= vec3(uRoughness);

outgoingLight = mix(matcapColor.rgb, roughnessMapColor.rgb, mask);
// outgoingLight = matcapColor.rgb + roughnessMapColor.rgb;
// outgoingLight = vec3(mask);
// outgoingLight = roughnessMapColor.rgb;
`;
