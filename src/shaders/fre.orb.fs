uniform float uRand; // 静态随机数
uniform float uRandDinamic; // 动态随机数
uniform sampler2D uMap1; // 球状着色图
uniform sampler2D uMap2; // 能量球状着色图
uniform sampler2D uMap3; // garynoise from shadertoy
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uColor3;
uniform vec3 uColor4;
uniform vec3 uColor5;
uniform float uTime; // 时间
uniform float uLifeTime; // 存在时间

varying vec2 vUv;

vec2 center = vec2(.5);

#montage import('./glsl-noise/simplex/2d.glsl');
#montage import('./glsl-noise/simplex/3d.glsl');
#montage import('./value-noise/1d.glsl');
#montage import('./value-noise/2d.glsl');
#montage import('./orb/orbhalo.glsl');

// 从 graynoise 中获取颜色
float getFireNoise(vec2 mapUv) {
    // https://www.desmos.com/calculator
    vec2 mapFreq = vec2(5., 20.); // 缩放纹理产生更多的细节
    vec2 mapUvFreqed = mapUv * mapFreq;

    // cubic function插值函数模型:  [.125, .875] (x - .5) * .5 + (x - .5) * .5 * .5 + .5
    // 可以使用的噪声来源:
    // 使用由三角面优化片元计算的柏林噪声: glslnoise_simplex2d(mapUvFreqed)
    // 使用由shadertoy提供的静态通道贴图: texture2D(uMap3, mapUv).r
    // 使用由sin波生成的随机噪声: valueNoise2d(mapUvFreqed)
    float n = (texture2D(uMap3, mapUv).r - .5) * .5 + (texture2D(uMap3, mapUv * 2.).r - .5) * .5 * .5 + .5;
    return n;
}

void main() {

    // 球状描边
    float outerFactor = .34;
    float innerFactor = .2 + smoothed_rand(uRandDinamic) * .1;
    float orbhaloFactor = orbhalo(vUv, center, outerFactor, innerFactor, .3);
    float orbhaloStrength = 1.;
    vec3 orbHaloColor = mix(vec3(0.), uColor2, orbhaloFactor) * orbhaloStrength; // 描边

    // 帧贴图色
    vec2 frameTexUv = vUv;
    vec2 frameScale = vec2(1.5, 1.5); // 每帧雪碧图的缩放
    float frameNum = 29.; // 雪碧图包含了多少帧
    float frameIndex = floor(mod((frameNum * uRand + uLifeTime), 1.) * frameNum); // 计算当前显示的雪碧图帧数 int[0 ~ 28]
    float frameFloating = frameIndex * (1. / frameNum); // 雪碧图当前帧漂移的距离
    frameTexUv.x = ((frameTexUv.x / frameScale.x) + (frameScale.x - 1.) / (2. * frameScale.x)) / frameNum + frameFloating;
    frameTexUv.y = (frameTexUv.y / frameScale.y) + (frameScale.y - 1.) / (2. * frameScale.y);
    vec4 uMap1Color = texture2D(uMap1, frameTexUv);
    float uMap1ColorStrengthScale = 1.2;
    float uMap1ColorStrength = (uMap1Color.r + uMap1Color.g + uMap1Color.b) / 3. * uMap1ColorStrengthScale; // 普通球体贴图的通道值
    vec3 uMap1ColorMixed = mix(uColor2, uColor1, uMap1ColorStrength); // 贴图色

    // 迸发火焰色 from shadertoy https://www.shadertoy.com/view/ds3cWB

    // 将坐标转化为极坐标x是中心点到边缘 y是角坐标 
    float PI = 3.14159265358979323844;
    vec2 polarUv = vUv; // 计算出的极坐标 
    polarUv -= center; // (x=[-0.5, 0.5], y=[-0.5, 0.5])
    polarUv = vec2(length(polarUv) / sqrt(0.5), (atan(polarUv.y, polarUv.x) / (2.0 * PI) + 0.5)); // (r, a) (r=[0., 1.], a=[0., 1. CCW from W])
    // 参数计算
    vec2 flameUv = polarUv;
    flameUv.x /= 1.8; // 生成火焰贴图的缩放
    float flameSpeed = .2;
    float flameTime = uTime * flameSpeed;
    // Get noise for this fragment (in polar coordinates) and time
    float noiseResolution = .5;
    float fragmentNoise = getFireNoise(flameUv * vec2(noiseResolution / 2.0, noiseResolution) + vec2(-flameTime, 0.0));
    // Randomize radius based on noise and radius
    float variationR = (fragmentNoise - 0.5);
    variationR *= smoothstep(.05, .4, flameUv.x); // Straighten the flame at the center and make full turbulence outside
    variationR *= .25; // Scale variation .65
    flameUv.x += variationR; // Randomize!
    // Calculate brightness
    float radius1 = flameUv.x; 
    // Focus (compress dynamics)
    float radius2 = smoothstep(.2, .35, radius1);
    float brightness = 1.0 - radius2;
    // Emit
    vec3 flameColor = mix(vec3(.9, .9, .9), vec3(.9, .9, .6), smoothstep(.1, .2, radius1));
    flameColor = mix(flameColor, vec3(.9, .4, 0.1), smoothstep(.18, .25, radius1));
    // Blend with background
    float alpha = brightness;
    vec4 flameColor4 = mix(vec4(0.), vec4(flameColor, 1.), alpha);
    float flameStep = step(0., flameColor4.r + flameColor4.g + flameColor4.b);

    // 如果有火焰明度使用火焰明度, 否则的话就使用描边色+贴图色
    gl_FragColor = vec4(flameStep * (orbHaloColor.rgb + uMap1ColorMixed.rgb) + flameStep * flameColor4.rgb, max(max(uMap1ColorStrength, orbhaloFactor), flameColor4.a));
}