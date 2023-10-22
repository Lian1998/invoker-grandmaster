import * as THREE from 'three';
import invokeTurbV from './turb.vs';
import invokeTurbF from './turb.fs';
import { getJoinedBaseUrl } from '@src/utils/getJoinedBaseUrl.js';
import { rtt } from '@src/invoker-webglpart/index.js';

const textureLoader = new THREE.TextureLoader();
const turbT = textureLoader.load(getJoinedBaseUrl('/invoker-textures/invoke/spark_cone.png'));

export const Ability4TurbShaderMaterial = () => new THREE.ShaderMaterial({
    uniforms: {
        uLifeTime: { value: 0.0 }, // 切球时间
        uMap: { value: rtt.texture },
        uMask: { value: turbT },
        uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
    },
    blending: THREE.NormalBlending,
    vertexShader: invokeTurbV,
    fragmentShader: invokeTurbF,
    depthWrite: false,
    depthTest: false,
    transparent: true,
    opacity: 1.0
});