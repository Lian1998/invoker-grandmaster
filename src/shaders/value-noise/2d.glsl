

// 将一个二维向量转化为一维浮点数
float rand2d(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

vec2 smoothed_rand2d(vec2 st){
    st = vec2( dot(st,vec2(127.1,311.7)),
              dot(st,vec2(269.5,183.3)) );
    return -1.0 + 2.0 * fract(sin(st) * 43758.5453123);
}

// 2D Noise based on Morgan McGuire @morgan3d
// https://thebookofshaders.com/edit.php#11/2d-noise.frag
// https://www.shadertoy.com/view/4dS3Wd
float valueNoise2d(vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);

    // Four corners in 2D of a tile
    float a = rand2d(i);
    float b = rand2d(i + vec2(1.0, 0.0));
    float c = rand2d(i + vec2(0.0, 1.0));
    float d = rand2d(i + vec2(1.0, 1.0));

    // Smooth Interpolation

    // Cubic Hermine Curve.  Same as SmoothStep()
    vec2 u = f * f * (3.0 - 2.0 * f);
    // vec2 u = smoothstep(0.,1.,f);

    // Mix 4 coorners percentages
    return mix(a, b, u.x) +
            (c - a)* u.y * (1.0 - u.x) +
            (d - b) * u.x * u.y;
}

// // Gradient Noise by Inigo Quilez - iq/2013
// // https://thebookofshaders.com/edit.php#11/2d-gnoise.frag
// // https://www.shadertoy.com/view/XdXGW8
float smoothed_valueNoise2d(vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);

    vec2 u = f * f * (3.0 - 2.0 * f);

    return 
        mix(
            mix(dot(smoothed_rand2d(i + vec2(0.0,0.0)), f - vec2(0.0,0.0)),
                dot(smoothed_rand2d(i + vec2(1.0,0.0)), f - vec2(1.0,0.0)),
                u.x),
            mix(dot(smoothed_rand2d(i + vec2(0.0,1.0)), f - vec2(0.0,1.0)),
                dot(smoothed_rand2d(i + vec2(1.0,1.0)), f - vec2(1.0,1.0)),
                u.x), 
            u.y
        );
}