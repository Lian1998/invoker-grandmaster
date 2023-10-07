attribute float size;
attribute float life;
attribute vec3 offset;

varying float vAlpha;

// From Inigo Quilez http://www.iquilezles.org/www/articles/functions/functions.htm
float impulse(float k, float x) {
    float h = k * x;
    return h * exp(1.0 - h);
}

void main() {
    vAlpha = impulse(6.28, life);

    vec3 pos = position;
    pos += offset * vec3(life * 0.7 + 0.3, life * 0.9 + 0.1, life * 0.7 + 0.3);

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = size * (80.0 / length(mvPosition.xyz));
    gl_Position = projectionMatrix * mvPosition;
}