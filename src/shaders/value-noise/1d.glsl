// https://thebookofshaders.com/

// 使用正弦波计算的噪声
float rand(float x) {
    return fract(sin(x) * 100000.0);
}

// 使用正弦波计算的噪声, 但是通过整数小数进行插值叠加平滑处理
float smoothed_rand(float x) {
    float i = floor(x);  // 整数（i 代表 integer）
    float f = fract(x);  // 小数（f 代表 fraction）

    // 这里可以使用自己的三次曲线 cubic curve
    float u = f * f * (3.0 - 2.0 * f); // custom cubic curve
    // float u = smoothstep(0., 1., f);

    return mix(rand(i), rand(i + 1.0), u); // using it in the interpolation
}