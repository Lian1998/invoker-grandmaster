varying vec2 vUv;
varying vec3 vPosition;
varying vec2 vCenter;

// ps: 此顶点着色器需传入的BufferGeometry配合使用 
// position [ -0.5, 0.5, 0,  0.5, 0.5, 0,  -0.5, -0.5, 0,  0.5, -0.5, 0 ]
// uv [ 0, 1,  1, 1,  0, 0,  1, 0 ]
// index [ 0, 2, 1, 2, 3, 1 ]

// 传入的几何体是一块长度, 宽度都为1的正方形平面
// 其法线方向是z轴负方向
// 中心点是 vec2(.5)
// UV左上角为 vec2(0.), 右下角为 vec2(1.)

void main() {

    vUv = uv;
    vPosition = position;
    vCenter = vec2(.5);

    vec4 mvPosition = modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0); // 只取modelViewMatrix的w列, Tranform信息

    // 通过(被Object3D.scale影响后的)BufferGeometry传入的第一个第二个顶点间隔确定计算平面长宽
    vec2 scaleVertex = vec2(1., 1.); // 默认长宽
    scaleVertex.x = length(vec3(modelMatrix[0].x, modelMatrix[0].y, modelMatrix[0].z));
    scaleVertex.y = length(vec3(modelMatrix[1].x, modelMatrix[1].y, modelMatrix[1].z));

    vec2 vsOffset = vec2(0., 0.); // 设置一个变量用于在顶点控制器控制平面的偏移
    float vsScale = .5; // 设置一个变量用于在顶点着色器控制平面的缩放

    // 计算偏移和缩放
    vec2 alignedPosition = (position.xy + vsOffset) * scaleVertex * vsScale;
    mvPosition.xy += alignedPosition.xy;

    gl_Position = projectionMatrix * mvPosition;

}