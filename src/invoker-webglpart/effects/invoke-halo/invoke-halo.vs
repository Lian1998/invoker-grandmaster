varying vec2 vUv;
varying vec3 vPosition;
varying vec2 vCenter;
varying float vAlpha;

uniform float uLifeTime;

void main() {

    float timeFactor = smoothstep(0.0, 0.5, uLifeTime);

    vUv = uv;
    vAlpha = timeFactor;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);

}