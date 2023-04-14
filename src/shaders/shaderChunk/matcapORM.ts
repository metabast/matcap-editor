export default /* glsl */ `
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
