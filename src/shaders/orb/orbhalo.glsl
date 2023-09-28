float orbhalo_range(float oldValue, float oldMin, float oldMax, float newMin, float newMax) {
    float oldRange = oldMax - oldMin;
    float newRange = newMax - newMin;
    float calRange = (((oldValue - oldMin) * newRange) / oldRange) + newMin;
    return calRange;
}

// 球状描边贴图, 方形的uv中, 左上角为(-.5*√2, .5*√2), 上方为(.5, .5), 右上角为(.5*√2, .5*√2)
float orbhalo(vec2 uv, vec2 center, float outerFactor, float innerFactor, float strengthFactor) {
    float _distance = length(uv - center);

    float outerBoundary = step(_distance, outerFactor); // 0 ~ outLineLength为1
    float innerBoundary = step(_distance, innerFactor); // 0 ~ innerLineLength为1
    float isPixcel = outerBoundary - innerBoundary; // 1. 或者 0.

    float gradianted = smoothstep(innerFactor, outerFactor, _distance); // smoothstep太平滑了, 需要一个急速下坠的1D曲线
    float factor = isPixcel * gradianted * strengthFactor; // 最终球状描边(逐片元值)

    return factor;
}