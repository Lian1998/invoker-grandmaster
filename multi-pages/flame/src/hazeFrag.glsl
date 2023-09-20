
uniform sampler2D uMap; // _rtt.texture
uniform sampler2D uMask; // haze.png
uniform vec2 uResolution; // width(pixel), height(pixcel)

varying float vAlpha;
varying vec2 vUv;

void main() {

    vec2 uv = gl_FragCoord.xy / uResolution; // _rtt.texture的uv
    vec2 mask = texture2D(uMask, vUv).ra - vec2(0.5); // haze.png的采样, 中心点为(.5, .5)
    uv -= mask * 0.1; // 热效应uv的视觉偏移
    vec4 tex = texture2D(uMap, uv); // 从_rtt.texture上采样偏移后的图像

    gl_FragColor.rgb = tex.rgb;
    gl_FragColor.a = vAlpha * 0.5;
}