uniform sampler2D uMap;
uniform vec3 uColor;

varying float vAlpha;

void main() {
    vec2 uv = vec2(gl_PointCoord.x, 1.0 - gl_PointCoord.y);
    vec4 mask = texture2D(uMap, uv);

    gl_FragColor.rgb = uColor;
    gl_FragColor.a = mask.a * vAlpha * 0.8;
}