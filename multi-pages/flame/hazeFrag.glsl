uniform sampler2D uMap;
uniform sampler2D uMask;
uniform vec2 uResolution;

varying float vAlpha;
varying vec2 vUv;

void main() {

    // gl_FragCoord 左下角00 右上角11
    vec2 uv = gl_FragCoord.xy / uResolution;

    // haze贴图是一个球状图形, 球状的四个角最白, 为v3(.78)
    vec2 mask = texture2D(uMask, vUv).ra - vec2(0.5);
    uv -= mask * 0.1;

    vec4 tex = texture2D(uMap, uv);

    gl_FragColor.rgb = tex.rgb;
    gl_FragColor.a = vAlpha * 0.5;

    // gl_FragColor = vec4(vec3(1.), 1.);
    // gl_FragColor = vec4(vec3(uv.x), 1.);
    // gl_FragColor = vec4(vec3(uv.y), 1.);
    // gl_FragColor = tex;
}