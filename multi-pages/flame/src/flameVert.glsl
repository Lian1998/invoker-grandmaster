attribute vec4 orientation;
attribute float life;

varying vec2 vUv;
varying float vAlpha;

float range(float oldValue, float oldMin, float oldMax, float newMin, float newMax) {
    float oldRange = oldMax - oldMin;
    float newRange = newMax - newMin;
    return (((oldValue - oldMin) * newRange) / oldRange) + newMin;
}

// From Inigo Quilez http://www.iquilezles.org/www/articles/functions/functions.htm
float pcurve(float x, float a, float b) {
    float k = pow(a + b, a + b) / (pow(a, a) * pow(b, b));
    return k * pow(x, a) * pow(1.0 - x, b);
}

void main() {
    vUv = uv;
    vAlpha = pcurve(life, 1.0, 2.0);

    vec3 pos = position;

    // random scale
    vec2 scale = vec2(.5, .5);
    float lerp1 = range(pow(life, 1.5), 0.0, 1.0, 1.0, 0.6); // 0 ~ 1 映射到 0   ~ 0.6
    float lerp2 = range(pow(life, 1.5), 0.0, 1.0, 0.6, 1.2); // 0 ~ 1 映射到 0.6 ~ 1.2
    pos.xy *= scale * vec2(lerp1, lerp2);

    // orientation
    vec4 or = orientation;
    vec3 vcV = cross(or.xyz, pos);
    pos = vcV * (2.0 * or.w) + (cross(or.xyz, vcV) * 2.0 + pos);

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}