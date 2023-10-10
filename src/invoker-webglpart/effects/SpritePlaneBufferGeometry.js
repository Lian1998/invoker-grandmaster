
import * as THREE from 'three';

const VERTEX = 4; // vertex

const POSITION = [ // vertex position
    -0.5, 0.5, 0,
    0.5, 0.5, 0,
    -0.5, -0.5, 0,
    0.5, -0.5, 0
];

const UV = [ // vertex uv
    0, 1,
    1, 1,
    0, 0,
    1, 0,
];

const INDEX = [ // vertex 2 face
    0, 2, 1, 2, 3, 1
];

export const SpritePlaneBufferGeometry = () => {

    const bufferGeometry = new THREE.BufferGeometry();

    // attributes

    {
        const v = 3;
        const buffer = new THREE.BufferAttribute(new Float32Array(VERTEX * v), v);
        for (let i = 0; i < VERTEX; i += 1) {
            buffer.setXYZ(i, POSITION[i * v], POSITION[i * v + 1], POSITION[i * v + 2]);
        }
        bufferGeometry.setAttribute('position', buffer);
    }

    {
        const v = 2;
        const buffer = new THREE.BufferAttribute(new Float32Array(VERTEX * v), v);
        for (let i = 0; i < VERTEX; i += 1) {
            buffer.setXY(i, UV[i * v], UV[i * v + 1]);
        }
        bufferGeometry.setAttribute('uv', buffer);
    }

    {
        const v = 1;
        const buffer = new THREE.BufferAttribute(new Uint16Array(INDEX.length * v), v);
        for (let i = 0; i < INDEX.length; i += 1) {
            buffer.setX(i, INDEX[i * v]);
        }
        bufferGeometry.setIndex(buffer);
    }

    return bufferGeometry;
}
