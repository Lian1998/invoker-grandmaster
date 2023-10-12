// https://thebookofshaders.com/

// 伪随机函数: 使用正弦波计算的噪声
float valuenoise_rand(float x) {
    return fract(sin(x) * 43758.5453123);
}

// 平滑(三次曲线插值后)的伪随机函数: 使用正弦波计算的噪声, 但是通过整数小数进行插值叠加平滑处理
float valuenoise_smoothedrand(float x) {
    float i = floor(x);  // 整数（i 代表 integer）
    float f = fract(x);  // 小数（f 代表 fraction）

    // 这里可以使用自己的三次曲线 cubic curve
    float u = f * f * (3.0 - 2.0 * f); // custom cubic curve
    // float u = smoothstep(0., 1., f);

    // using it in the interpolation
    return mix(
        valuenoise_rand(i),
        valuenoise_rand(i + 1.0),
        u
    );
}

float valuenoise_1d(float x) {
    return valuenoise_rand(x);
}

float valuenoise_smoothed1d(float x) {
    return valuenoise_smoothedrand(x);
}