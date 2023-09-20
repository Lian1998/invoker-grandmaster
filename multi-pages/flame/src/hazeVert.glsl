attribute vec3 base;
attribute vec3 offset;
attribute vec4 orientation;
attribute vec2 scale;
attribute float life;

varying float vAlpha;
varying vec2 vUv;

// From Inigo Quilez http://www.iquilezles.org/www/articles/functions/functions.htm
float impulse(float k, float x) {
    float h = k * x;
    return h * exp(1.0 - h);
}

float pcurve(float x, float a, float b) {
    float k = pow(a + b, a + b) / (pow(a, a) * pow(b, b));
    return k * pow(x, a) * pow(1.0 - x, b);
}

void main() {
    vUv = uv;
    vAlpha = pcurve(life, 1.0, 2.0);

    vec3 pos = position;

    pos.xy *= scale * (life * 0.7 + 0.3);

    vec4 or = orientation;
    vec3 vcV = cross(or.xyz, pos);
    pos = vcV * (2.0 * or.w) + (cross(or.xyz, vcV) * 2.0 + pos);

    pos += base;
    pos += offset * vec3(life * 0.7 + 0.3, life * 0.9 + 0.1, life * 0.7 + 0.3);

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);;
}