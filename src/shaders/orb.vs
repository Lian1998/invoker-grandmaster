
// attribute vec3 position;
// attribute vec3 normal;
// attribute vec2 uv;

// uniform mat4 modelViewMatrix; // = camera.matrixWorldInverse * object.matrixWorld
// uniform mat4 modelMatrix; // = object.matrixWorld 
// uniform mat4 projectionMatrix; // = camera.projectionMatrix
// uniform mat4 viewMatrix; // = camera.matrixWorldInverse
// uniform mat3 normalMatrix; // = inverse transpose of modelViewMatrix
// uniform vec3 cameraPosition; // = camera position in world space

// gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 ); // MVP
// gl_Position = projectionMatrix * (viewMatrix * modelMatrix) * vec4( position, 1.0 );

// ps: threejs 生成的planeGeometry的uvCoord是左上角为vec2(0., 0.), 右下角为vec2(1., 1.)

varying vec2 vUv;

uniform float uType;

vec2 center = vec2(.5); // 传入的几何体是一块(1, 1)对准z轴的平面, 中心点是vec2(.5, .5)
vec2 scale = vec2(1., 1.); // 设置顶点的scale, 默认长宽都为1.0
float scleFactor = 1.; // scale计算因数

void main() {

    vUv = uv;

    // modelViewMatrix = camera.matrixWorldInverse * object.matrixWorld; object位置vec4, 齐次坐标(homogeneous coordinates)
    // 只取modelViewMatrix的w列 (平移信息)
    // mvPosition = [ vec4(modelViewMatrix[0][3], modelViewMatrix[1][3], modelViewMatrix[2][3], modelViewMatrix[3][3]) ];
    vec4 mvPosition = modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0);

    if (uType > 2.) {
        scleFactor = 1.2;
    } else if (uType > 1.) {
        scleFactor = 1.5;
    } else if (uType > 0.) {
        scleFactor = 1.;
    }

    scale.x = length(vec3(modelMatrix[0].x, modelMatrix[0].y, modelMatrix[0].z));
    scale.y = length(vec3(modelMatrix[1].x, modelMatrix[1].y, modelMatrix[1].z));
    scale *= -1. / length(mvPosition);
    vec2 alignedPosition = (position.xy - (center - vec2(0.5))) * scale * scleFactor;

    mvPosition.xy += alignedPosition.xy;

    gl_Position = projectionMatrix * mvPosition;

}