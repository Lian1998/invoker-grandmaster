varying vec2 vUv;

uniform vec2 uOffset;
uniform float uScale;
uniform float uRotation;

bool isPerspectiveMatrix(mat4 m) {
    return m[2][3] == -1.0;
}

void main() {

    vUv = uv;

    // unforms
    float rotation = 0.;

    vec2 center = vec2(.5);

    vec4 mvPosition = modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0); // 只取modelViewMatrix的w列, Tranform信息

    // Scale
    vec2 scale = vec2(1.);
    scale.x = length(vec3(modelMatrix[0].x, modelMatrix[0].y, modelMatrix[0].z));
    scale.y = length(vec3(modelMatrix[1].x, modelMatrix[1].y, modelMatrix[1].z));
    // // 去除透视相机对大小的影响
    // bool isPerspective = isPerspectiveMatrix(projectionMatrix);
    // if (isPerspective) {
    //     scale *= -mvPosition.z;
    // }

    // Transform
    vec2 alignedPosition = (position.xy + uOffset) * scale * uScale;

    float rotation1 = 90.;

    // Rotation
    vec2 rotatedPosition;
    rotatedPosition.x = cos(uRotation) * alignedPosition.x - sin(uRotation) * alignedPosition.y;
    rotatedPosition.y = sin(uRotation) * alignedPosition.x + cos(uRotation) * alignedPosition.y;

    mvPosition.xy += rotatedPosition;

    gl_Position = projectionMatrix * mvPosition;

}