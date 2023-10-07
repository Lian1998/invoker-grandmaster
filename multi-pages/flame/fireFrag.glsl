uniform sampler2D uMap;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform float uTime;

varying vec2 vUv;
varying float vAlpha;
varying float vRandom;

void main() {
    vec2 uv = vUv;

    float spriteLength = 10.0;
    uv.x /= spriteLength;
    float spriteIndex = mod(uTime * 0.1 + vRandom * 2.0, 1.0);
    uv.x += floor(spriteIndex * spriteLength) / spriteLength;

    vec4 map = texture2D(uMap, uv);

    gl_FragColor.rgb = mix(uColor2, uColor1, map.r);
    gl_FragColor.a = vAlpha * map.a;
}