// 方形的uv中左上角为(-.5*√2, .5*√2), 上边缘为(.5, .5), 右上角为(.5*√2, .5*√2)

// xxx  | 0 ~ 1 | 1 ~ 0 |  xxx
// xxx  e3      e1      e2 xxx
// 图中 e1, e2, e3 分别为函数的三个边界

// 在一个方形片面的uv坐标中, 获取球状描边的颜色因数 
float orbhalo(vec2 st, vec2 center, float e1, float e2, float fstrength) {

    float _distance = length(st - center);

    float outerBoundary = step(_distance, e1); // 0 ~ e1
    float innerBoundary = step(_distance, e2); // 0 ~ e2
    float isPixel = outerBoundary - innerBoundary; // 1. 或者 0.
    float gradianted = smoothstep(e2, e1, _distance) * isPixel;

    float factor = gradianted * fstrength; // 最终球状描边(逐片元值)

    return factor;
}

// 在球状描边的基础上模糊外边缘
float orbhalo_fuzzy(vec2 st, vec2 center, float e1, float e2, float e3, float fstrength) {
    float _distance = length(st - center);

    float outerBoundary = step(_distance, e1); // 0 ~ outLineLength为1
    float innerBoundary = step(_distance, e2); // 0 ~ innerLineLength为1
    float isPixel = outerBoundary - innerBoundary; // 1. 或者 0.
    float gradianted = smoothstep(e2, e1, _distance) * isPixel;

    gradianted += smoothstep(e1 + e3, e1, _distance) - step(_distance, e1);
    gradianted = clamp(gradianted, 0., 1.);
    float factor = gradianted * fstrength; // 最终球状描边(逐片元值)

    return factor;
}