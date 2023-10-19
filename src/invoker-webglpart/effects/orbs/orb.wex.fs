uniform float uRand; // 静态随机数
uniform float uRandDinamic; // 动态随机数
uniform sampler2D uMap1; // 球状着色图
uniform sampler2D uMap2; // 能量球状着色图
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uColor3;
uniform float uTime; // 渲染总时间
uniform float uLifeTime; // 生命时间

varying vec2 vUv; // uv
varying vec3 vPosition; // uv
varying vec2 vCenter;
varying float vAlpha;

#montage import('@shaders/glsl-noise/simplex2d.glsl');
#montage import('@shaders/value-noise/1d.glsl');
#montage import('@shaders/threejs/colorspace/sRGBToLinear.glsl');
#montage import('./orbhalo.glsl');

void main() {

    // 球状描边色 particles/units/heroes/hero_invoker/invoker_soft_wex_sphere.vpcf_c
    float outerFactor = 0.3; // 要比贴图稍微大一点, 这样会在外圈生成一层颜色稍淡的黑边, 有点立体效果
    float innerFactor = 0.0;
    vec2 uvShake = vec2(0.05 * (valuenoise_smoothed1d(uTime) - 0.5), 0.05 * (valuenoise_smoothed1d(uTime) - 0.5)); // 随便来点抖动
    float orbhaloFactor = orbhalo_fuzzy(vUv + uvShake, vCenter, outerFactor, innerFactor, 0.12, 0.6); // 注意扩散边缘的长度
    float orbhaloStrength = 1.5;
    float wave = glslnoise_simplex2d(vec2(distance(vCenter, vUv) * 5.0 - uTime * 5.0)); // 中心点向内推波
    if (orbhaloFactor > 0.0) {
        orbhaloFactor += wave * 0.2;
    }
    vec3 orbHaloColor = uColor1 * orbhaloStrength * orbhaloFactor; // 描边

    // 角度影响数值
    vec3 worldUp = vec3(0.0, 1.0, 0.0);
    float watchFactor = 1.0 - dot(worldUp, normalize(cameraPosition - vPosition)); // 角度越小越接近1

    // 帧贴图色
    vec2 frameTexUv = vUv;
    vec2 frameScale = vec2(1.45, 1.45); // 每帧雪碧图的缩放
    float frameNum = 29.0; // 雪碧图包含了多少帧
    float frameSpeedScale = 1.5; // 收到时间影响的因数
    float frameIndex = floor(mod((frameNum * uRand + uLifeTime * frameSpeedScale), 1.0) * frameNum); // 计算当前显示的雪碧图帧数 int[0 ~ 28]
    float frameFloating = frameIndex * (1.0 / frameNum); // 雪碧图当前帧漂移的距离
    frameTexUv.x = ((frameTexUv.x / frameScale.x) + (frameScale.x - 1.0) / (2.0 * frameScale.x)) / frameNum + frameFloating;
    frameTexUv.y = (frameTexUv.y / frameScale.y) + (frameScale.y - 1.0) / (2.0 * frameScale.y);
    vec4 uMap2Color = texture2D(uMap2, frameTexUv);
    float uMap2ColorStrength = (uMap2Color.r + uMap2Color.g + uMap2Color.b) / 3.0 * 1.2; // 普通球体贴图的通道值
    if (uMap2ColorStrength > 0.0) { // 通道值加强
        uMap2ColorStrength += 0.35;
    }
    uMap2ColorStrength += step(distance(vCenter, vUv), 0.36) * 0.6 * watchFactor;
    vec3 uMap2ColorMixed = mix(uColor3, uColor2, uMap2ColorStrength); // 贴图

    // 高光点补光
    vec2 highlight1Pos = vec2(0.5, 0.5);
    float highlight1Size = 0.4;
    float orbHighlightFactor = smoothstep(highlight1Size, 0.0, length(vUv - highlight1Pos));

    // 角度影响高光点补光强度
    float orbHighlightStrength = 0.35 + 0.45 * watchFactor; // 0.55
    vec3 orbHighlightColor = vec3(orbHighlightFactor) * orbHighlightStrength;

    // gl_FragColor = vec4(vec3(wave), 1.0); // wave Factor
    // gl_FragColor = vec4(vec3(orbhaloFactor), 1.0);  // halo Factor
    // gl_FragColor = vec4(orbHaloColor, 1.0);  // halo Colored
    // gl_FragColor = vec4(vec3(orbHighlightFactor), 1.0); // highlight Factor
    // gl_FragColor = vec4(orbHighlightColor, orbHighlightFactor); // highlight Colored
    // gl_FragColor = uMap2Color; // uMap2Color
    // gl_FragColor = vec4(uMap2ColorStrength); // uMap2Color Strength
    // gl_FragColor = vec4(uMap2ColorMixed, uMap2ColorStrength); // uMap2ColorMixed
    // gl_FragColor = vec4(vec3(watchFactor), 1.0);

    float alpha = (max(uMap2ColorStrength, orbhaloFactor)) * vAlpha;
    gl_FragColor = vec4(orbHaloColor.rgb + uMap2ColorMixed.rgb + orbHighlightColor.rgb, alpha);

    gl_FragColor = sRGBToLinear(gl_FragColor);

    #include <colorspace_fragment>

}