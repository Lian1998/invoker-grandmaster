uniform sampler2D uMap; // 上一次渲染出图 rtt
uniform vec3 uColor;

varying vec2 vUv;
varying vec2 vCenter;
varying float vAlpha;

void main() {

    // 重采样
    vec4 tex = texture2D(uMap, vUv);

    gl_FragColor = vec4(uColor.rgb, tex.r); // gl_FragColor = vec4(vec3(1.0), vAlpha);

    #include <colorspace_fragment>
}