uniform float uRand; // 静态随机数
uniform float uRandDinamic; // 动态随机数
uniform sampler2D uMap1; // 球状着色图
uniform sampler2D uMap2; // 能量球状着色图
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uColor3;
uniform float uTime; // 时间
uniform float uLifeTime; // 存在时间

varying vec2 vUv; // uv

vec2 center = vec2(.5);

#montage import('./glsl-noise/simplex/2d.glsl');

#montage import('./value-noise/1d.glsl');
#montage import('./value-noise/2d.glsl');

#montage import('./orb/orbhalo.glsl');

void main() {

    // 球状描边色
    float outerFactor = .48; // 要比贴图稍微大一点, 这样会在外圈生成一层颜色稍淡的黑边, 有点立体效果
    float innerFactor = .3 + smoothed_rand(uRandDinamic) * .1;
    float orbhaloFactor = orbhalo(vUv, center, outerFactor, innerFactor, .6);
    float orbhaloStrength = 1.5;
    float wave = glslnoise_simplex2d(vec2(distance(center, vUv) * 10. + uTime * 2.)); // 中心点向外推波
    vec3 orbHaloColor = mix(vec3(0.), uColor3, orbhaloFactor) * orbhaloStrength + wave * uColor3 * orbhaloFactor * .5; // 球状描边

    // 火焰
    // float freq = 30.;
    // float valuenoise0 = valueNoise2d(vUv * freq); // 中心点向外推波
    // float valuenoise1 = valueNoise2d(vUv * freq * 2.5); // 中心点向外推波
    // float valuenoise = (valuenoise0 - .5) * .5 + (valuenoise1 - .5) * .5 * .5 + .5;

    float g2d = valueNoise2d(vUv * 100.);

    // gl_FragColor = vec4(vec3(wave), 1.); // wave Factor
    // gl_FragColor = vec4(vec3(orbhaloFactor), 1.);// halo Factor
    // gl_FragColor = vec4(orbHaloColor, 1.);  // halo Colored
    // gl_FragColor = vec4(vec3(valuenoise), 1.);
    gl_FragColor = vec4(vec3(g2d), 1.);
}