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