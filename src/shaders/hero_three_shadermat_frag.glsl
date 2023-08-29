uniform sampler2D map;

varying vec2 vUv;

void main() {

    vec4 diffuseColor = texture2D(map, vUv);

    gl_FragColor = vec4(diffuseColor.r, diffuseColor.g, diffuseColor.b, 1.);

    // // uv test
    // gl_FragColor = vec4(vUv, 0.7, 1.);

}