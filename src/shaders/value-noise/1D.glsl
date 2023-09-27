float valuenoise_rand(float x) {
    return fract(sin(x) * 100000.0);
}

float valuenoise_rand_curved(float x) {
    float i = floor(x);  // 整数（i 代表 integer）
    float f = fract(x);  // 小数（f 代表 fraction）
    // return  mix(rand1D(i), rand1D(i + 1.0), smoothstep(0., 1., f));
    float u = f * f * (3.0 - 2.0 * f); // custom cubic curve
    return mix(valuenoise_rand(i), valuenoise_rand(i + 1.0), u); // using it in the interpolation
}