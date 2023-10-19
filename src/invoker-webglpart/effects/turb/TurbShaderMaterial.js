import * as THREE from 'three';
import turbv from './turb.vs';
import turbf from './turb.fs';
import { getJoinedBaseUrl } from '@src/utils/getJoinedBaseUrl.js';
import { rtt } from '@src/invoker-webglpart/index.js';

const textureLoader = new THREE.TextureLoader();
const turbT = textureLoader.load(getJoinedBaseUrl('/invoker-textures/orbs/orb_spawn_turb.png'));

export const TurbShaderMaterial = () => new THREE.ShaderMaterial({
    uniforms: {
        uLifeTime: { value: 0.0 }, // 切球时间
        uMap: { value: rtt.texture },
        uMask: { value: turbT },
        uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
    },
    blending: THREE.NormalBlending,
    vertexShader: turbv,
    fragmentShader: turbf,
    depthWrite: false,
    depthTest: false,
    transparent: true,
})