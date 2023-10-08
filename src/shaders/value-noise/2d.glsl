// 二维伪随机函数: 将一个二维向量转化为一维浮点数
float valuenoise_rand(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

// 平滑的二维随机函数
vec2 valuenoise_smoothedrand(vec2 st){
    st = vec2( dot(st,vec2(127.1,311.7)),
              dot(st,vec2(269.5,183.3)) );
    return -1.0 + 2.0 * fract(sin(st) * 43758.5453123);
}

// 2D Noise based on Morgan McGuire @morgan3d
// https://thebookofshaders.com/edit.php#11/2d-noise.frag
// https://www.shadertoy.com/view/4dS3Wd
float valuenoise_2d(vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);

    // Four corners in 2D of a tile
    float a = valuenoise_rand(i);
    float b = valuenoise_rand(i + vec2(1.0, 0.0));
    float c = valuenoise_rand(i + vec2(0.0, 1.0));
    float d = valuenoise_rand(i + vec2(1.0, 1.0));

    // Smooth Interpolation

    // Cubic Hermine Curve.  Same as SmoothStep()
    vec2 u = f * f * (3.0 - 2.0 * f);
    // vec2 u = smoothstep(0.,1.,f);

    // Mix 4 coorners percentages
    return mix(a, b, u.x) +
            (c - a)* u.y * (1.0 - u.x) +
            (d - b) * u.x * u.y;
}

// Gradient Noise by Inigo Quilez - iq/2013
// https://thebookofshaders.com/edit.php#11/2d-gnoise.frag
// https://www.shadertoy.com/view/XdXGW8
float valuenoise_smoothed2d(vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);

    vec2 u = f * f * (3.0 - 2.0 * f);

    return mix(
            mix(
                dot(valuenoise_smoothedrand(i + vec2(0.0,0.0)), f - vec2(0.0,0.0)),
                dot(valuenoise_smoothedrand(i + vec2(1.0,0.0)), f - vec2(1.0,0.0)),
                u.x),
            mix(dot(
                valuenoise_smoothedrand(i + vec2(0.0,1.0)), f - vec2(0.0,1.0)),
                dot(valuenoise_smoothedrand(i + vec2(1.0,1.0)), f - vec2(1.0,1.0)),
                u.x), 
            u.y);
}