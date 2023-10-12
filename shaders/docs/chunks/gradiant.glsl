// common gradiant functions

float mod289(float x) {
    return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec2 mod289(vec2 x) {
    return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec3 mod289(vec3 x) {
    return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 mod289(vec4 x) {
    return x - floor(x * (1.0 / 289.0)) * 289.0;
}

float permute(float x) {
    return mod289(((x * 34.0) + 1.0) * x);
}

vec2 permute(vec2 x) {
    return mod289(((x * 34.0) + 1.0) * x);
}

vec3 permute(vec3 x) {
    return mod289(((x * 34.0) + 1.0) * x);
}

vec4 permute(vec4 x) {
    return mod289(((x * 34.0) + 1.0) * x);
}

float taylorInvSqrt(float r) {
    return 1.79284291400159 - 0.85373472095314 * r;
}

vec2 taylorInvSqrt(vec2 r) {
    return 1.79284291400159 - 0.85373472095314 * r;
}

vec3 taylorInvSqrt(vec3 r) {
    return 1.79284291400159 - 0.85373472095314 * r;
}

vec4 taylorInvSqrt(vec4 r) {
    return 1.79284291400159 - 0.85373472095314 * r;
}

float fade(float t) {
    return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);
}

vec2 fade(vec2 t) {
    return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);
}

vec3 fade(vec3 t) {
    return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);
}

vec4 fade(vec4 t) {
    return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);
}