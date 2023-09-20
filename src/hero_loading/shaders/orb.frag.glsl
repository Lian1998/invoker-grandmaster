uniform sampler2D uMap1; // basic orb
uniform sampler2D uMap2; // energy
uniform vec3 uColor1; // ice
uniform vec3 uColor2; // ice1
uniform float uTime;

varying vec2 vUv;
// varying float vAlpha;

void main() {
    vec2 uv = vUv;

    float spriteLength = 29.0; // 雪碧图的长度(帧)
    float spriteUnitUVx = 1.0 / spriteLength;
    float spriteIndex = floor(mod(uTime * 2.0, 1.0) * spriteLength);
    uv.x /= spriteLength;
    uv.x += spriteIndex * spriteUnitUVx; // 根据是第几(spriteIndex)张图进行uv偏移, floor(返回小于等于x的最大整数值)

    vec4 map1 = texture2D(uMap1, uv);
    vec4 map2 = texture2D(uMap2, uv);

    float orbStrengthFactor = map1.r;

    if (orbStrengthFactor != 0.) {
        orbStrengthFactor += 0.19;
    }

    vec3 color = mix(uColor2, uColor1, orbStrengthFactor);

    gl_FragColor = vec4(color.rgb, orbStrengthFactor);
}