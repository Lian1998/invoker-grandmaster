uniform float uRand; // 静态随机数
uniform float uRandDinamic; // 动态随机数
uniform sampler2D uMap1; // 球状着色图
uniform sampler2D uMap2; // 能量球状着色图
uniform sampler2D uMap3; // garynoise
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uColor3;
uniform float uTime; // 时间
uniform float uLifeTime; // 存在时间

varying vec2 vUv;

vec2 center = vec2(.5);

#montage import('./glsl-noise/simplex/2d.glsl');
#montage import('./value-noise/1d.glsl');
#montage import('./value-noise/2d.glsl');
#montage import('./orb/orbhalo.glsl');

// 从 graynoise 中获取颜色
float getGrayNoise(vec2 map_uv) // -> (.25, .75)
{
    // 三次式
    // float n = (valueNoise2d(map_uv * 100.) - 0.5) * 0.5 + (valueNoise2d(map_uv * 100.) - 0.5) * 0.5 * 0.5 + 0.5;
    // float n = (smoothed_valueNoise2d(map_uv * 100.) - 0.5) * 0.5 + (smoothed_valueNoise2d(map_uv * 100.) - 0.5) * 0.5 * 0.5 + 0.5;
    float n = (texture(uMap3, map_uv).r - 0.5) * 0.5 + (texture(uMap3, map_uv * 2.5).r - 0.5) * 0.5 * 0.5 + 0.5;
    return n;
}

void main() {

    // 球状描边色
    float outerFactor = (.48) / 5. * 4.; // 要比贴图稍微大一点, 这样会在外圈生成一层颜色稍淡的黑边, 有点立体效果
    float innerFactor = (.1 + smoothed_rand(uRandDinamic) * .1) / 5. * 4.;
    float orbhaloFactor = orbhalo(vUv, center, outerFactor, innerFactor, .6);
    // gl_FragColor = vec4(vec3(orbhaloFactor), 1.);// halo Factor
    float orbhaloStrength = 1.5;
    float wave = glslnoise_simplex2d(vec2(distance(center, vUv) * 10. + uTime * 2.)); // 中心点向内
    // gl_FragColor = vec4(vec3(wave), 1.); // wave Factor
    vec3 orbHaloColor = mix(vec3(0.), uColor3, orbhaloFactor) * orbhaloStrength + wave * uColor3 * orbhaloFactor * .3; // 球状描边
    // gl_FragColor = vec4(orbHaloColor, orbhaloFactor);  // halo Colored

    // 迸发火焰色

    // 转为极坐标
    vec2 fireUv = vUv;
    fireUv -= center; // (x=[-0.5, 0.5], y=[-0.5, 0.5])
    float PI = 3.14159265358979323844;
    fireUv = vec2(length(fireUv) / sqrt(0.5), (atan(fireUv.y, fireUv.x) / (2.0 * PI) + 0.5)); // (r, a) (r=[0.0, 1.0], a=[0.0, 1.0 CCW from W])
    // gl_FragColor = vec4(fireUv.x, fireUv.y, 1., 1.); 

    // 极坐标映射噪音
    float flameSpeed = .2;
    float flameTime = flameSpeed * uTime;
    float noiseResolution = .5;
    float fragmentNoise = getGrayNoise(fireUv * vec2(noiseResolution / 2., noiseResolution) + vec2(-flameTime, 0.0)); // (.25, .75)
    // gl_FragColor = vec4(vec3(fragmentNoise), 1.);

    // uv叠加噪声创造更多细节
    float variationR = fragmentNoise - .5; // (-.25, .25)
    float noteffect_circir = .05; // 完全不受variation进行uv叠加的小圈
    float effect_circir = .4; // 完全接受variation进行uv叠加的大圈
    float variation_additived = smoothstep(noteffect_circir, effect_circir, fireUv.x); // smoothstep(0.05, 0.4, fireUv.x)
    variationR *= variation_additived; // 只要极坐标x轴超过.4就1., 小于.05就0. 将中心的火焰拉直，使外部产生充分的湍流
    variationR *= 1.; // Scale 
    fireUv.x += variationR; // Randomize!

    float radius1 = fireUv.x;
    float radius2 = smoothstep(.2, .35, radius1); // Focus (compress dynamics)
    float fireBrightnessFactor = 1. - radius2; // 计算明亮度因数 Calculate fireBrightnessFactor
    // gl_FragColor = vec4(vec3(fireBrightnessFactor), 1.);

    // Emit
    vec3 fireColorMixer = mix(vec3(1., 1., 1.), vec3(1., 1., .6), smoothstep(.1, .2, radius1));
    fireColorMixer = mix(fireColorMixer, vec3(1., .4, .1), smoothstep(.18, .25, radius1));
    vec3 fireColor = mix(vec3(0.), fireColorMixer, fireBrightnessFactor);
    gl_FragColor = vec4(fireColor, fireBrightnessFactor);

    gl_FragColor = vec4(fireColor + orbHaloColor, fireBrightnessFactor + orbhaloStrength);
}