bool isPerspectiveMatrix(mat4 m) {
    return m[2][3] == -1.0;
}

float rotation = 0.;
vec2 center = vec2(.5);

varying vec2 vUv;

void main() {

    vUv = uv;

    // object位置vec4, 齐次坐标(homogeneous coordinates)
    vec4 mvPosition = modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0); 
    // 只取modelViewMatrix的w列 (平移)
    // vec4(modelViewMatrix[0][3], modelViewMatrix[1][3], modelViewMatrix[2][3], modelViewMatrix[3][3]);

    // vec2 scale;
    // scale.x = length(vec3(modelMatrix[0].x, modelMatrix[0].y, modelMatrix[0].z)) / 10.;
    // scale.y = length(vec3(modelMatrix[1].x, modelMatrix[1].y, modelMatrix[1].z)) / 10.;
    // bool isPerspective = isPerspectiveMatrix(projectionMatrix);
    // if(isPerspective) {
    //     scale *= -mvPosition.z;
    // }
    // vec2 alignedPosition = (position.xy - (center - vec2(0.5))) * scale;

    vec2 alignedPosition = (position.xy - (center - vec2(0.5))) * 1.;

    // vec2 rotatedPosition;
    // rotatedPosition.x = cos(rotation) * alignedPosition.x - sin(rotation) * alignedPosition.y;
    // rotatedPosition.y = sin(rotation) * alignedPosition.x + cos(rotation) * alignedPosition.y;

    mvPosition.xy += alignedPosition.xy;

    gl_Position = projectionMatrix * mvPosition;

}