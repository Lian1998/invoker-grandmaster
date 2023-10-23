uniform sampler2D uMap; // 上一次渲染出图 rtt
uniform sampler2D uMask; // 遮罩纹理
uniform sampler2D uMask1; // 遮罩纹理
uniform vec2 uResolution; // 分辨率
uniform float uLifeTime;

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
    vec4 maskTexcolor = (texture2D(uMask, maskUv) + texture2D(uMask1, maskUv)) / 2.0;
    float maskStrength = 0.5;
    float timeFactor = abs(sin(uLifeTime * 10.0));

    // y轴上减少影响
    vec2 mask1 = vec2(maskTexcolor.r, maskTexcolor.r * maskStrength) * maskStrength * 0.1;
    vec2 mask2 = vec2(maskTexcolor.r, -maskTexcolor.r * maskStrength) * maskStrength * 0.1;
    vec2 mask3 = vec2(-maskTexcolor.r, maskTexcolor.r * maskStrength) * maskStrength * 0.1;
    vec2 mask4 = vec2(-maskTexcolor.r, -maskTexcolor.r * maskStrength) * maskStrength * 0.1;

    vec2 pixelUv1 = pixelUv + mask1;
    vec2 pixelUv2 = pixelUv + mask2;
    vec2 pixelUv3 = pixelUv + mask3;
    vec2 pixelUv4 = pixelUv + mask4;

    // 重采样
    vec4 color = texture2D(uMap, pixelUv);
    vec4 color1 = texture2D(uMap, pixelUv1);
    vec4 color2 = texture2D(uMap, pixelUv2);
    vec4 color3 = texture2D(uMap, pixelUv3);
    vec4 color4 = texture2D(uMap, pixelUv4);

    vec4 avgColor = 0.5 * color + 0.5 * (color1 + color2 + color3 + color4) / 4.0;
    gl_FragColor = vec4(avgColor.rgb, vAlpha);
    // gl_FragColor = vec4(1.0);

    #include <colorspace_fragment>
}