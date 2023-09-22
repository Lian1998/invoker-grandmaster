uniform float uRand;
uniform float uRandDinamic;

// 球状着色图
uniform sampler2D uMap1;

uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uColor3;
uniform vec3 uColor4;
uniform vec3 uColor5;
uniform vec3 uColor6;
uniform vec3 uColor7;
uniform vec3 uColor8;

// 能量球状着色图
uniform sampler2D uMap2;

// 火球

// 时间
uniform float uTime;
uniform float uLifeTime;

varying vec2 vUv;


vec2 center = vec2(.5);
vec2 iceOrbHighlight1Pos = vec2(.23, .55);
vec2 iceOrbHighlight2Pos = vec2(.77, .55);
vec3 iceOrbHighlightCyan = vec3(164. / 255., 245. / 255., 1.);

float rand1D(float x) {
    return fract(sin(x) * 100000.0);
}

float rand1DSmooth(float x) {
    float i = floor(x);  // 整数（i 代表 integer）
    float f = fract(x);  // 小数（f 代表 fraction）
    return  mix(rand1D(i), rand1D(i + 1.0), smoothstep(0., 1., f));
    // float u = f * f * (3.0 - 2.0 * f ); // custom cubic curve
    // return = mix(rand(i), rand(i + 1.0), u); // using it in the interpolation
}

void main() {


    // add1 球状描边贴图, 方形的uv中, 左上角为(-.5*√2, .5*√2), 上方为(.5, .5), 右上角为(.5*√2, .5*√2)
    float add1OutlineLength = .5;
    float add1InnerlineLength = .25;
    float boundary = step(length(vUv - center), add1OutlineLength); // 0 ~ outLineLength为1
    float boundary1 = step(length(vUv - center), add1InnerlineLength); // 0 ~ innerLineLength为1
    float add1Factor = boundary - boundary1; // 1. 或者 0.
    float add1Strength = smoothstep(add1InnerlineLength, add1OutlineLength, length(vUv - center));
    float add1StrengthFactor = .8;
    float add1FinalFactor = add1Factor * add1Strength * add1StrengthFactor; // 最终球状描边(逐片元值)

    // 计算片源对应的UV值
    vec2 uv = vUv;

    float spriteNum = 29.0; // 雪碧图的长度(帧)
    float spriteUnitUVLength = 1.0 / spriteNum;
    float spriteIndex = floor(mod(uLifeTime + spriteNum * uRand, 1.0) * spriteNum);
    uv.x /= spriteNum;
    uv.x += spriteIndex * spriteUnitUVLength; // 根据是第几(spriteIndex)张图进行uv偏移, floor(返回小于等于x的最大整数值)

    // 贴图

    // 普通球体
    vec4 mapColor1 = texture2D(uMap1, uv); 
    float mapColor1AlphaStrength = mapColor1.r; // 普通球体贴图的通道值
    if (mapColor1AlphaStrength != 0.) { mapColor1AlphaStrength += 0.3; } // 通道值加强

    // 能量球体
    vec4 mapColor2 = texture2D(uMap2, uv); 
    float mapColor2AlphaStrength = mapColor2.r; // 普通球体贴图的通道值
    if (mapColor2AlphaStrength != 0.) { mapColor2AlphaStrength += 0.05; } // 通道值加强

    // 判断当前渲染的球

    // 冰球
    float iceOrbHightlight1Size = .17 + .07 * rand1D(uRandDinamic);
    float iceOrbHightlight2Size = .17 + .07 * rand1D(uRandDinamic);
    iceOrbHighlight1Pos.x += (rand1DSmooth(uTime) - .5) * 0.1;
    iceOrbHighlight1Pos.y += (rand1DSmooth(uTime) - .5) * 0.1;
    iceOrbHighlight2Pos.x += (rand1DSmooth(uTime) - .5) * 0.1;
    iceOrbHighlight2Pos.y += (rand1DSmooth(uTime) - .5) * 0.1;
    float iceOrbHighlight1 = smoothstep(iceOrbHightlight1Size, 0., length(vUv - iceOrbHighlight1Pos));
    float iceOrbHighlight2 = smoothstep(iceOrbHightlight2Size, 0., length(vUv - iceOrbHighlight2Pos));
    
    vec4 iceorbShapeColor = vec4(mix(vec3(0.), uColor3, add1FinalFactor), 1.); // 球状描边
    vec3 iceOrbMapMixedColor = mix(uColor2, uColor1, mapColor1AlphaStrength); // 冰球MapMixedColor
    vec4 iceOrbHightLightColor = vec4(
        (iceOrbHighlightCyan * iceOrbHighlight1 + iceOrbHighlightCyan * iceOrbHighlight2) * 
        clamp(rand1D(vUv.x * vUv.y * uTime), .45, .55),
        iceOrbHighlight1 + iceOrbHighlight2
    );

    // gl_FragColor = iceOrbHightLightColor; // 冰球高光
    // gl_FragColor = vec4(iceOrbMapMixedColor.rgb, mapColor1AlphaStrength); // 冰球MapMixedColor
    // gl_FragColor = iceorbShapeColor;  // 球状描边
    gl_FragColor = vec4(
        iceOrbMapMixedColor.rgb + (iceorbShapeColor.rgb * .6) + iceOrbHightLightColor.rgb, 
        (iceorbShapeColor.r + iceorbShapeColor.g + iceorbShapeColor.b) / 3. + 
        mapColor1AlphaStrength + iceOrbHightLightColor.a
    );

    // 电球
    
    vec3 eleOrbMapMixedColor = mix(uColor5, uColor4, mapColor2AlphaStrength); // 电球MapMixedColor
    vec4 eleorbShapeColor = vec4(mix(vec3(0.), uColor4, add1FinalFactor), 1.); // 球状描边

    // gl_FragColor = vec4(eleOrbMapMixedColor, mapColor2AlphaStrength); // 电球MapMixedColor
    // gl_FragColor = eleorbShapeColor;  // 球状描边
    gl_FragColor = vec4(
        eleOrbMapMixedColor.rgb + (eleorbShapeColor.rgb * .6), 
        (eleorbShapeColor.r + eleorbShapeColor.g + eleorbShapeColor.b) / 3. + 
        mapColor2AlphaStrength
    );


    // 火球
    vec4 flameorbShapeColor = vec4(mix(vec3(0.), uColor8, add1FinalFactor), 1.); // 球状描边
    gl_FragColor = flameorbShapeColor;  // 球状描边

}