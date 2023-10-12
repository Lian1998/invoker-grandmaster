uniform sampler2D map;
varying vec2 vUv;

float luminance(const in vec3 rgb) {
	// assumes rgb is in linear color space with sRGB primaries and D65 white point
    const vec3 weights = vec3(0.2126729, 0.7151522, 0.0721750);
    return dot(weights, rgb);
}

void main() {

    vec4 mapcolor = texture2D(map, vUv);

    gl_FragColor = vec4(mapcolor);
}