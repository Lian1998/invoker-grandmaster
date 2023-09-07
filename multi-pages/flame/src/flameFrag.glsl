uniform sampler2D uMap;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform float uTime;

varying vec2 vUv;
varying float vAlpha;

void main() {
    vec2 uv = vUv;

    float spriteFrame = 10.; // 纹理帧数
    float spriteUVSlicePerFrame = 1. / 10.; // 每帧对应的偏移量

    uv.x /= spriteFrame;

    // 根据时间计算当前使用的帧纹理(纹理偏移)
    float spriteIndex = floor(mod(uTime, spriteFrame));
    uv.x += spriteIndex * spriteUVSlicePerFrame;

    // 根据纹理去图片中采样颜色
    vec4 mapColor = texture2D(uMap, uv);

    // 计算输出颜色
    float clamped = clamp(0., 1., mapColor.r + .2);
    gl_FragColor.rgb = mix(uColor2, uColor1, clamped);
    gl_FragColor.a = vAlpha * mapColor.a;
}