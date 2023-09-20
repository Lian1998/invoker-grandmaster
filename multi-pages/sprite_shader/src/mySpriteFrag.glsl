uniform sampler2D map;
varying vec2 vUv;

void main() {

    vec4 mapcolor = texture2D(map, vUv);

    gl_FragColor = vec4(mapcolor);
}