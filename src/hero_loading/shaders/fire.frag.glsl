uniform sampler2D uMap;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform float uTime;

varying vec2 vUv;
varying float vAlpha;

void main() {
    vec2 uv = vUv;

float spriteLength = 10.0; // 雪碧图的长度(帧)
    float spriteUnitUVx = 1.0 / spriteLength;
    float spriteIndex = floor(mod(uTime, 1.0) * spriteLength);
    uv.x /= spriteLength;
    uv.x += spriteIndex * spriteUnitUVx; // 根据是第几(spriteIndex)张图进行uv偏移, floor(返回小于等于x的最大整数值)

    vec4 map = texture2D(uMap, uv);

    gl_FragColor.rgb = mix(uColor2, uColor1, map.r);
    gl_FragColor.a = vAlpha * map.a;
}