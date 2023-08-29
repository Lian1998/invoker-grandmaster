
varying vec2 vUv;

void main() {

    vUv = uv;

    // mvp
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}