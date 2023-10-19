float sRGBToLinear(float value) {

    float result = value;

    if (value < 0.04045) {
        result = value;
    } else {
        result = pow(value * 0.9478672986 + 0.0521327014, 2.4);
    }
    return result;
}

vec4 sRGBToLinear(vec4 color) {

    color.r = sRGBToLinear(color.r);
    color.g = sRGBToLinear(color.g);
    color.b = sRGBToLinear(color.b);

    return color;
}