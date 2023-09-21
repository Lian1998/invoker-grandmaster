
// 球状着色图
uniform sampler2D uMap1;

// 冰球
uniform vec3 uColor1;
uniform vec3 uColor2;

// 电球
uniform sampler2D uMap2;

// 火球

// 时间
uniform float uLifeTime;
uniform float uTime;

varying vec2 vUv;


vec2 center = vec2(.5);
vec2 iceOrbHighlight1Pos = vec2(.25, .55);
vec2 iceOrbHighlight2Pos = vec2(.75, .55);
vec3 iceOrbHighlightCyan = vec3(1., 1., 1.);

void main() {


    // add1 球状描边贴图, 方形的uv中, 左上角为(-.5*√2, .5*√2), 上方为(.5, .5), 右上角为(.5*√2, .5*√2)
    float add1OutlineLength = .5;
    float add1InnerlineLength = .15;
    float boundary = step(length(vUv - center), add1OutlineLength); // 0 ~ outLineLength为1
    float boundary1 = step(length(vUv - center), add1InnerlineLength); // 0 ~ innerLineLength为1
    float add1Factor = boundary - boundary1;
    float add1Strength = smoothstep(add1InnerlineLength, add1OutlineLength, length(vUv - center));
    float add1StrengthFactor = .85;
    float add1FinalFactor = add1Factor * add1Strength * add1StrengthFactor; // 最终球状描边(逐片元值)


    // 计算片源对应的UV值
    vec2 uv = vUv;

    float spriteNum = 29.0; // 雪碧图的长度(帧)
    float spriteUnitUVLength = 1.0 / spriteNum;
    float spriteIndex = floor(mod(uTime * 2.0, 1.0) * spriteNum);
    uv.x /= spriteNum;
    uv.x += spriteIndex * spriteUnitUVLength; // 根据是第几(spriteIndex)张图进行uv偏移, floor(返回小于等于x的最大整数值)

    // 从贴图取色
    vec4 mapColor1 = texture2D(uMap1, uv); // 普通球体
    vec4 mapColor2 = texture2D(uMap2, uv); // 电球着色球体

    // 普通球体的透明通道
    float mapColor1AlphaStrength = mapColor1.r;
    if (mapColor1AlphaStrength != 0.) { mapColor1AlphaStrength += 0.35; }

    // 冰球
    iceOrbHighlight1Pos.x += sin(uTime) * 0.02;
    iceOrbHighlight1Pos.y -= sin(uTime) * 0.05;
    iceOrbHighlight2Pos.x -= sin(uTime) * 0.04;
    iceOrbHighlight2Pos.y += sin(uTime) * 0.03;
    float iceOrbHighlight1 = smoothstep(.17, 0., length(vUv - iceOrbHighlight1Pos));
    float iceOrbHighlight2 = smoothstep(.17, 0., length(vUv - iceOrbHighlight2Pos));
    
    vec4 iceOrbColor = mix(vec4(0.), vec4(uColor2, 1.), add1FinalFactor);
    vec3 iceOrbMapColor = mix(uColor2, uColor1, mapColor1AlphaStrength);
    vec4 iceOrbHightLightColor = vec4(
        mix(iceOrbHighlightCyan, uColor1, iceOrbHighlight1) * iceOrbHighlight1 + mix(iceOrbHighlightCyan, uColor1, iceOrbHighlight2) * iceOrbHighlight2,
        (iceOrbHighlight1 + iceOrbHighlight2)
    );


    // gl_FragColor = iceOrbHightLightColor;
    // gl_FragColor = iceOrbColor;
    // gl_FragColor = vec4(iceOrbMapColor.rgb, mapColor1AlphaStrength);
    gl_FragColor = vec4(vec3(iceOrbColor.rgb + iceOrbMapColor.rgb + iceOrbHightLightColor.rgb), mapColor1AlphaStrength + iceOrbColor.r + iceOrbHightLightColor.a);
}