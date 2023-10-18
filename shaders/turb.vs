varying vec2 vUv;
varying vec3 vPosition;
varying vec2 vCenter;
varying float vAlpha;

uniform float uLifeTime;

void main() {

    vUv = uv;
    vPosition = position;
    vCenter = vec2(0.5);
    // vAlpha = smoothstep(1.0, 0.0, uLifeTime);
    vAlpha = 1.0;

    vec4 mvPosition = modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0); // 只取modelViewMatrix的w列, Tranform信息

    // 通过(被Object3D.scale影响后的)BufferGeometry传入的第一个第二个顶点间隔确定计算平面长宽
    vec2 scaleVertex = vec2(1.0, 1.0); // 默认长宽
    scaleVertex.x = length(vec3(modelMatrix[0].x, modelMatrix[0].y, modelMatrix[0].z));
    scaleVertex.y = length(vec3(modelMatrix[1].x, modelMatrix[1].y, modelMatrix[1].z));

    // 设置一个变量用于在顶点控制器控制平面的偏移
    vec2 vsOffset = vec2(0.0, 0.0); 
    // 设置一个变量用于在顶点着色器控制平面的缩放 这个值最终控制在.6会比较合理
    float timeFactor = smoothstep(0.0, 0.375, uLifeTime);
    float vsScale = timeFactor * step(uLifeTime, 0.5) * 0.6; 

    // 计算偏移和缩放
    vec2 alignedPosition = (position.xy + vsOffset) * scaleVertex * vsScale;
    mvPosition.xy += alignedPosition.xy;

    gl_Position = projectionMatrix * mvPosition;

}