varying vec2 vUv;
varying vec3 vPosition;
varying vec2 vCenter;
varying float vAlpha;

uniform float uLifeTime;

mat4 scaleMatrix(float a) {
    return mat4(
        a, 0, 0, 0,
        0, a, 0, 0,
        0, 0, a, 0,
        0, 0, 0, 1
    );
}

void main() {

    float p1 = 0.25;
    float p2 = 0.5;
    float curve1 = step(uLifeTime, p1) * smoothstep(0.0, p1, uLifeTime);
    float curve2 = (1.0 - step(uLifeTime, p1)) * smoothstep(p2, p1, uLifeTime);
    float timeFactor = curve1 + curve2;

    vUv = uv;
    vAlpha = timeFactor;
    vCenter = vec2(0.5);

    // 随着时间稍微扩大一点点
    float timeFactor1 = smoothstep(0.0, p2, uLifeTime);
    mat4 vsp_scale = scaleMatrix(1.0 + 0.18 * timeFactor1);

    gl_Position = projectionMatrix * modelViewMatrix * vsp_scale * vec4(position, 1.0);

}