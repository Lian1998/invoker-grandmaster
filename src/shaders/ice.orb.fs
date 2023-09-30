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
vec2 highlight1Pos = vec2(.2, .55);
vec2 highlight2Pos = vec2(.8, .55);
vec3 highlightCyan = vec3(160. / 255., 245. / 255., 1.);

#montage import('./glsl-noise/simplex/2d.glsl');
#montage import('./value-noise/1d.glsl');
#montage import('./orb/orbhalo.glsl');

void main() {

    // 球状描边色
    float outerFactor = .48; // 要比贴图稍微大一点, 这样会在外圈生成一层颜色稍淡的黑边, 有点立体效果
    float innerFactor = .2 + smoothed_rand(uRandDinamic) * .1;
    float orbhaloFactor = orbhalo(vUv, center, outerFactor, innerFactor, .9);
    float orbhaloStrength = 2.;
    vec3 orbHaloColor = mix(vec3(0.), uColor3, orbhaloFactor) * orbhaloStrength; // 描边

    // 贴图色
    vec2 mapUv = vUv; // 传递uv
    float spriteNum = 29.; // 雪碧图的长度(帧)
    float spriteUnitUVLength = 1. / spriteNum;
    float spriteIndex = floor(mod(uLifeTime + spriteNum * uRand, 1.) * spriteNum);
    mapUv.x /= spriteNum;
    mapUv.x += spriteIndex * spriteUnitUVLength; // 根据index进行uv偏移
    vec4 uMap1Color = texture2D(uMap1, mapUv);
    float uMap1ColorStrength = (uMap1Color.r + uMap1Color.g + uMap1Color.b) / 3. * 1.2; // 普通球体贴图的通道值
    float wave = glslnoise_simplex2d(vec2(distance(center, vUv) * 5. + uTime * 2.)); // 中心点向内推波
    if (uMap1ColorStrength > 0.) { // 通道值加强
        uMap1ColorStrength += .08;
        uMap1ColorStrength += wave * .12;
    }
    vec3 uMap1ColorMixed = mix(uColor2, uColor1, uMap1ColorStrength); // 贴图

    // 高光点颜色
    float highlight1Size = .2 + .05 * smoothed_rand(uRandDinamic); // 大小随机
    float highlight2Size = .2 + .05 * smoothed_rand(uRandDinamic);
    highlight1Pos.x += (smoothed_rand(uTime) - .5) * 0.05; // 轻微移动
    highlight1Pos.y += (smoothed_rand(uTime) - .5) * 0.05;
    highlight2Pos.x += (smoothed_rand(uTime) - .5) * 0.05;
    highlight2Pos.y += (smoothed_rand(uTime) - .5) * 0.05;
    float orbHighlight1Factor = smoothstep(highlight1Size, 0., length(vUv - highlight1Pos));
    float orbHighlight2Factor = smoothstep(highlight2Size, 0., length(vUv - highlight2Pos));
    float orbHighlightFactor = orbHighlight1Factor + orbHighlight2Factor;
    vec3 orbHighlightColor = orbHighlightFactor * highlightCyan * clamp(rand(vUv.x * vUv.y * uTime), .45, .55);

    // gl_FragColor = vec4(vec3(wave), 1.); // wave Factor
    // gl_FragColor = vec4(vec3(orbhaloFactor), 1.);  // halo Factor
    // gl_FragColor = vec4(orbHaloColor, 1.);  // halo Colored
    // gl_FragColor = vec4(vec3(orbHighlightFactor), 1.); // highlight Factor
    // gl_FragColor = vec4(orbHighlightColor, 1.); // highlight Colored
    // gl_FragColor = uMap1Color; // uMap1Color
    // gl_FragColor = vec4(uMap1ColorStrength); // uMap1Color Strength
    // gl_FragColor = vec4(uMap1ColorMixed, uMap1ColorStrength); // uMap1ColorMixed

    gl_FragColor = vec4(orbHaloColor.rgb + uMap1ColorMixed.rgb + orbHighlightColor.rgb, uMap1ColorStrength + orbHighlightFactor + orbhaloFactor * .2);

}