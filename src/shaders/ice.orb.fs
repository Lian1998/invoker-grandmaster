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

#montage import('./value-noise/1D.glsl');
#montage import('./orb/orbhalo.glsl');

void main() {

    // 球状描边色
    float outerFactor = .5;
    float innerFactor = .25 + valuenoise_rand(uRandDinamic) * .15;
    float orbhaloFactor = orbhalo(vUv, center, outerFactor, innerFactor, .9);

    // 贴图色
    vec2 mapUv = vUv; // 传递uv
    float spriteNum = 29.0; // 雪碧图的长度(帧)
    float spriteUnitUVLength = 1.0 / spriteNum;
    float spriteIndex = floor(mod(uLifeTime + spriteNum * uRand, 1.0) * spriteNum);
    mapUv.x /= spriteNum;
    mapUv.x += spriteIndex * spriteUnitUVLength; // 根据index进行uv偏移
    vec4 uMap1Color = texture2D(uMap1, mapUv);
    float uMap1ColorStrength = (uMap1Color.r + uMap1Color.g + uMap1Color.b) / 3. * 1.2; // 普通球体贴图的通道值
    if (uMap1ColorStrength != 0.) { // 通道值加强
        uMap1ColorStrength += 0.12;
    }

    // 高光点颜色
    float highlight1Size = .2 + .05 * valuenoise_rand_curved(uRandDinamic); // 大小随机
    float highlight2Size = .2 + .05 * valuenoise_rand_curved(uRandDinamic);
    highlight1Pos.x += (valuenoise_rand_curved(uTime) - .5) * 0.05; // 轻微移动
    highlight1Pos.y += (valuenoise_rand_curved(uTime) - .5) * 0.05;
    highlight2Pos.x += (valuenoise_rand_curved(uTime) - .5) * 0.05;
    highlight2Pos.y += (valuenoise_rand_curved(uTime) - .5) * 0.05;
    float orbHighlight1 = smoothstep(highlight1Size, 0., length(vUv - highlight1Pos));
    float orbHighlight2 = smoothstep(highlight2Size, 0., length(vUv - highlight2Pos));
    float orbHighlightStrength = (orbHighlight1 + orbHighlight2);

    vec3 orbHaloColor = mix(vec3(0.), uColor3, orbhaloFactor) * 1.8; // 球状描边
    vec3 uMap1MixedColor = mix(uColor2, uColor1, uMap1ColorStrength); // 冰球MapMixedColor
    vec3 orbHighlightColor = (orbHighlight1 + orbHighlight2) * highlightCyan * clamp(valuenoise_rand(vUv.x * vUv.y * uTime), .45, .55);

    // gl_FragColor = orbHaloColor;  // 球状描边
    // gl_FragColor = orbHighlightColor; // 冰球高光
    // gl_FragColor = uMap1MixedColor; // 冰球MapMixedColor
    gl_FragColor = vec4(orbHaloColor.rgb + uMap1MixedColor.rgb + orbHighlightColor.rgb, uMap1ColorStrength + orbHighlightStrength);

}