varying vec2 vUv;
varying vec3 vPosition;
varying vec2 vCenter;
varying float vAlpha;

uniform float uLifeTime;

void main() {
    float p1 = 0.45;
    float p2 = 0.6;
    float curve1 = step(uLifeTime, p1) * smoothstep(0.0, p1, uLifeTime);
    float curve2 = (1.0 - step(uLifeTime, p1)) * smoothstep(p2, p1, uLifeTime);
    float timeFactor = curve1 + curve2;
    vec3 worldUp = vec3(0.0, 1.0, 0.0);
    float watchFactor = dot(worldUp, normalize(cameraPosition - position)); // 角度越小越接近1

    // 顶点着色器内置变量 vetex_shader_param
    // vec2 vsp_Offset = vec2(0.0, 0.0);
    vec2 vsp_Offset = vec2(0.0, 0.0);
    vec2 vsp_Scalev2 = vec2(6.0 * timeFactor, 6.0 * timeFactor);

    // Varying
    vUv = uv;
    vPosition = position;
    vCenter = vec2(0.5);
    vAlpha = timeFactor;

    vec4 mvPosition = modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0); // 只取modelViewMatrix的w列, Tranform信息

    // 通过(被Object3D.scale影响后的)BufferGeometry传入的第一个第二个顶点间隔确定计算平面长宽
    vec2 scaleVertex = vec2(1.0, 1.0); // 默认长宽
    scaleVertex.x = length(vec3(modelMatrix[0].x, modelMatrix[0].y, modelMatrix[0].z));
    scaleVertex.y = length(vec3(modelMatrix[1].x, modelMatrix[1].y, modelMatrix[1].z));

    // 计算最终偏移和缩放
    vec2 alignedPosition = (position.xy + vsp_Offset) * scaleVertex * vsp_Scalev2;
    mvPosition.xy += alignedPosition.xy;

    gl_Position = projectionMatrix * mvPosition;

}