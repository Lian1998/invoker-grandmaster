// 球状描边贴图, 方形的uv中, 左上角为(-.5*√2, .5*√2), 上方为(.5, .5), 右上角为(.5*√2, .5*√2)
float orbhalo(vec2 uv, vec2 center, float outerFactor, float innerFactor, float strengthFactor) {

    float outerFactor = .5;
    float innerFactor = .25;
    float outerBoundary = step(length(uv - center), outerFactor); // 0 ~ outLineLength为1
    float innerBoundary = step(length(uv - center), innerFactor); // 0 ~ innerLineLength为1
    float isPixcel = outerBoundary - innerBoundary; // 1. 或者 0.
    float gradianted = smoothstep(innerFactor, outerFactor, length(uv - center));
    float factor = isPixcel * gradianted * strengthFactor; // 最终球状描边(逐片元值)

    return factor;
}