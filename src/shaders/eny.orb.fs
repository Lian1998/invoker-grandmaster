uniform float uRand; // 静态随机数
uniform float uRandDinamic; // 动态随机数
uniform sampler2D uMap1; // 球状着色图
uniform sampler2D uMap2; // 能量球状着色图
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform float uTime; // 时间
uniform float uLifeTime; // 存在时间

varying vec2 vUv; // uv

vec2 center = vec2(.5);

#montage import('./glsl-noise/simplex/2d.glsl');
#montage import('./value-noise/1d.glsl');
#montage import('./orb/orbhalo.glsl');

void main() {

    // 球状描边色
    float outerFactor = .34; // 要比贴图稍微大一点, 这样会在外圈生成一层颜色稍淡的黑边, 有点立体效果
    float innerFactor = .1 + smoothed_rand(uRandDinamic) * .1;
    float orbhaloFactor = orbhalo(vUv, center, outerFactor, innerFactor, .9);
    float orbhaloStrength = 1.;
    vec3 orbHaloColor = mix(vec3(0.), uColor2, orbhaloFactor) * orbhaloStrength; // 描边

    // 帧贴图色
    vec2 frameTexUv = vUv;
    vec2 frameScale = vec2(1.4, 1.4); // 每帧雪碧图的缩放
    float frameNum = 29.; // 雪碧图包含了多少帧
    float frameSpeedScale = 1.5; // 收到时间影响的因数
    float frameIndex = floor(mod((frameNum * uRand + uLifeTime * frameSpeedScale), 1.) * frameNum); // 计算当前显示的雪碧图帧数 int[0 ~ 28]
    float frameFloating = frameIndex * (1. / frameNum); // 雪碧图当前帧漂移的距离
    frameTexUv.x = ((frameTexUv.x / frameScale.x) + (frameScale.x - 1.) / (2. * frameScale.x)) / frameNum + frameFloating;
    frameTexUv.y = (frameTexUv.y / frameScale.y) + (frameScale.y - 1.) / (2. * frameScale.y);
    vec4 uMap2Color = texture2D(uMap2, frameTexUv);
    float uMap2ColorStrength = (uMap2Color.r + uMap2Color.g + uMap2Color.b) / 3. * 1.2; // 普通球体贴图的通道值
    float wave = glslnoise_simplex2d(vec2(distance(center, vUv) * 5. - uTime * 2.)); // 中心点向内推波
    if (uMap2ColorStrength > 0.) { // 通道值加强
        uMap2ColorStrength += .12;
        uMap2ColorStrength += wave * .12;
    }
    uMap2ColorStrength += step(distance(center, vUv), .34) * .1; // 边框内的一个基础强度
    vec3 uMap2ColorMixed = mix(uColor2, uColor1, uMap2ColorStrength); // 贴图

    // 高光点, 一个比较大的高光点, 左下到右上sin函数运动
    vec2 highlight1Pos = vec2(.5, .5);
    vec3 highlightCyan = vec3(1., 1., 1.);
    float highlight1Size = .5;
    float orbHighlightFactor = smoothstep(highlight1Size, 0., length(vUv - highlight1Pos));
    vec3 orbHighlightColor = orbHighlightFactor * highlightCyan * clamp(rand(vUv.x * vUv.y * uTime), .45, .55);

    // gl_FragColor = vec4(vec3(wave), 1.); // wave Factor
    // gl_FragColor = vec4(vec3(orbhaloFactor), 1.);  // halo Factor
    // gl_FragColor = vec4(orbHaloColor, 1.);  // halo Colored
    // gl_FragColor = vec4(vec3(orbHighlightFactor), 1.); // highlight Factor
    // gl_FragColor = vec4(orbHighlightColor, 1.); // highlight Colored
    // gl_FragColor = uMap2Color; // uMap2Color
    // gl_FragColor = vec4(uMap2ColorStrength); // uMap2Color Strength
    // gl_FragColor = vec4(uMap2ColorMixed, uMap2ColorStrength); // uMap2ColorMixed

    gl_FragColor = vec4(orbHaloColor.rgb + uMap2ColorMixed.rgb + orbHighlightColor.rgb, uMap2ColorStrength + orbHighlightFactor * uMap2ColorStrength * .2 + orbhaloFactor * .2);
    // gl_FragColor = vec4(orbHaloColor.rgb + uMap2ColorMixed.rgb, uMap2ColorStrength + orbhaloFactor * .2);

}