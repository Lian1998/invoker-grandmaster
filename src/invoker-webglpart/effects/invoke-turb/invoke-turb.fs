uniform sampler2D uMap; // 上一次渲染出图 rtt
uniform sampler2D uMask; // 遮罩纹理
uniform vec2 uResolution; // 分辨率

varying vec2 vUv;
varying vec2 vCenter;
varying float vAlpha;

// gl_FragCoord:
// vec2(0.0, 1.0) ---- vec2(1.0, 1.0)
//      |                      |
//      |                      |
// vec2(0.0, 0.0) ---- vec2(0.0, 1.0)

void main() {

    // 每个像素点的uv
    vec2 pixelUv = gl_FragCoord.xy / uResolution; 

    // 计算rtt的uv偏移
    vec2 maskUv = vUv;
    float maskFactor = step(distance(maskUv, vCenter), 0.5) + smoothstep(0.6, 0.5, distance(maskUv, vCenter));
    vec2 mask = texture2D(uMask, maskUv).ra - vec2(0.5);
    pixelUv -= mask * maskFactor * 0.05; // 每个像素点的偏移的幅度

    // 重采样
    vec4 tex = texture2D(uMap, pixelUv);

    gl_FragColor = vec4(tex.rgb, vAlpha); // gl_FragColor = vec4(vec3(1.0), vAlpha);
    // gl_FragColor = vec4(1.0);

    #include <colorspace_fragment>
}