// 方形的uv中左上角为(-.5*√2, .5*√2), 上边缘为(.5, .5), 右上角为(.5*√2, .5*√2)

// 在一个方形片面的uv坐标中, 获取球状描边的颜色因数 
float orbhalo(vec2 uv, vec2 center, float outerFactor, float innerFactor, float strengthFactor) {
    float _distance = length(uv - center);

    float outerBoundary = step(_distance, outerFactor); // 0 ~ outLineLength为1
    float innerBoundary = step(_distance, innerFactor); // 0 ~ innerLineLength为1
    float isPixcel = outerBoundary - innerBoundary; // 1. 或者 0.
    float gradianted = smoothstep(innerFactor, outerFactor, _distance) * isPixcel;

    float factor = gradianted * strengthFactor; // 最终球状描边(逐片元值)

    return factor;
}

// 在球状描边的基础上模糊外边缘
float orbhalo_fuzzy(vec2 uv, vec2 center, float outerFactor, float innerFactor, float outerGradiantFactor, float strengthFactor) {
    float _distance = length(uv - center);

    float outerBoundary = step(_distance, outerFactor); // 0 ~ outLineLength为1
    float innerBoundary = step(_distance, innerFactor); // 0 ~ innerLineLength为1
    float isPixcel = outerBoundary - innerBoundary; // 1. 或者 0.
    float gradianted = smoothstep(innerFactor, outerFactor, _distance) * isPixcel;

    gradianted += smoothstep(outerFactor + outerGradiantFactor, outerFactor, _distance) - step(_distance, outerFactor);
    float factor = gradianted * strengthFactor; // 最终球状描边(逐片元值)

    return factor;
}