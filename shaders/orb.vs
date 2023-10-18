varying vec2 vUv;
varying vec3 vPosition;
varying vec2 vCenter;
varying float vAlpha;

// ps: 此顶点着色器需传入的BufferGeometry配合使用 
// position [ -0.5, 0.5, 0,  0.5, 0.5, 0,  -0.5, -0.5, 0,  0.5, -0.5, 0 ]
// uv [ 0, 1,  1, 1,  0, 0,  1, 0 ]
// index [ 0, 2, 1, 2, 3, 1 ]

// 传入的几何体是一块长/宽都为1.0的正方形平面; 法线方向是z轴负方向; 中心点是vec2(0.5); UV左上角为vec2(0.0), 右下角为vec2(1.0);

uniform float uLifeTime;

void main() {

    float timeFactor = smoothstep(0.0, 0.2, uLifeTime);

    // 顶点着色器内置变量 vetex_shader_param
    vec2 vsp_Offset = vec2(0.0, 0.0);
    float vsp_Scale = 0.25 + 0.3 * timeFactor; // float vsp_Scale = 0.55;

    // Varying
    vUv = uv;
    vPosition = position;
    vCenter = vec2(0.5);
    vAlpha = timeFactor; // vAlpha = 1.0;

    vec4 mvPosition = modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0); // 只取modelViewMatrix的w列, Tranform信息

    // 通过(被Object3D.scale影响后的)BufferGeometry传入的第一个第二个顶点间隔确定计算平面长宽
    vec2 scaleVertex = vec2(1.0, 1.0); // 默认长宽
    scaleVertex.x = length(vec3(modelMatrix[0].x, modelMatrix[0].y, modelMatrix[0].z));
    scaleVertex.y = length(vec3(modelMatrix[1].x, modelMatrix[1].y, modelMatrix[1].z));

    // 计算偏移和缩放
    vec2 alignedPosition = (position.xy + vsp_Offset) * scaleVertex * vsp_Scale;
    mvPosition.xy += alignedPosition.xy;

    gl_Position = projectionMatrix * mvPosition;

}