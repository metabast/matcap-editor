export default /* glsl */ `
vec3 outgoingLight = vec3( 0.0 );

vec4 matcap0 = getCellMatcap(matcap, uv, 0., 2.);
vec4 matcap1 = getCellMatcap(matcap, uv, 1., 2.);
vec4 matcap2 = getCellMatcap(matcap, uv, 2., 2.);
vec4 matcap3 = getCellMatcap(matcap, uv, 0., 1.);
vec4 matcap4 = getCellMatcap(matcap, uv, 1., 1.);
vec4 matcap5 = getCellMatcap(matcap, uv, 2., 0.);

float roughness = uRoughness;

#ifdef USE_ROUGHNESSMAP
    vec4 roughnessMapColor = texture2D( uRoughnessMap, vUv );
    roughness = roughnessMapColor.g;
#endif

vec3 mix1 = mix(matcap0.rgb, matcap1.rgb, clamp(map(roughness, 0., .25, 0., 1.), 0., 1.));
vec3 mix2 = mix(matcap2.rgb, matcap3.rgb, clamp(map(roughness, .25, .5, 0., 1.), 0., 1.));
vec3 mix3 = mix(matcap4.rgb, matcap5.rgb, clamp(map(roughness, .5, .75, 0., 1.), 0., 1.));

vec3 mix4 = mix(mix1, mix2, clamp(map(roughness, 0., .5, 0., 1.), 0., 1.));
vec3 mix5 = mix(mix2, mix3, clamp(map(roughness, .5, 1., 0., 1.), 0., 1.));

diffuseColor.rgb = uColor;
#ifdef USE_MAP2
    diffuseColor.rgb = texture2D( uMap2, vUv ).rgb;
#endif
outgoingLight = diffuseColor.rgb * mix(mix4, mix5, uRoughness);
`;
