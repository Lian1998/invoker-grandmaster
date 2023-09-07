attribute float life;
attribute float random;
attribute vec3 offset;

varying float vAlpha;

// From Inigo Quilez http://www.iquilezles.org/www/articles/functions/functions.htm
float impulse(float k, float x) {
    float h = k * x;
    return h * exp(1.0 - h);
}

void main() {
    // size basic / life + size + / height + size +
    float size = .2 + life / 5. + offset.y / 5.;

    // vAlpah basic / life + vAlpha - 
    vAlpha = impulse(6.28, life);
    vAlpha = clamp(vAlpha - .4, 0., .6);

    // offset
    vec3 pos = position;
    pos += offset * vec3(life * 0.5 + 0.3, life * 0.9 + 0.1, life * 0.5 + 0.3);

    // size * random * (cameraProjection)
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = size * (0.5 - (0.3 * random)) * (80.0 / length(mvPosition.xyz));

    gl_Position = projectionMatrix * mvPosition;
}