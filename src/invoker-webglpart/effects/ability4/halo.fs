uniform sampler2D uMap; // 上一次渲染出图 rtt
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uColor3;
uniform float uType;

varying vec2 vUv;
varying vec2 vCenter;
varying float vAlpha;

void main() {

    // 重采样
    vec4 tex = texture2D(uMap, vUv);

    // 当前切技能的应该使用的颜色
    vec3 orbColor = uColor1;
    float colorStrength = 0.8;
    if (uType < 1.0) { orbColor = uColor1; } 
    else if (uType > 1.0 && uType < 2.0) { orbColor = uColor2; } 
    else { orbColor = uColor3; }
    orbColor *= colorStrength;
    vec4 color = vec4(orbColor, tex.r);

    gl_FragColor = color * vAlpha; // gl_FragColor = vec4(vec3(1.0), vAlpha);

    #include <colorspace_fragment>
}